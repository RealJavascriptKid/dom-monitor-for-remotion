let url = `file:///C:/Users/saadn/Desktop/sn_data/projects/remotion/dom-monitor-for-remotion/tests/ex1.html`,
      fps = 30,
      seconds = 10,
      frameCount = 0;

url = 'https://ratingstogo.com';



const puppeteer = require('puppeteer'),
           fs = require('fs'),
           fsExtra = require('fs-extra');

let wait = (time) => {
    return new Promise(res => {
        setTimeout(() => {
            res();
        },time)
    })
}

let run = async (url) => {

    fsExtra.emptyDirSync('out');

   
    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials'
        ] 
    })
    
    let pages = await browser.pages();
    
    const page =  pages[0] //await browser.newPage()

    await page.setViewport({
        width: 1920,
        height: 1080
    });
    
    // page.on('requestfinished', (request) => {
    //     console.log(request.url())
    // });


    await page.goto(url, { waitUntil: 'networkidle0' })

          
          await page.exposeFunction('logPageState', async (state) => {
           
            let startTime = new Date().getTime();
            fs.writeFileSync(`out/frame${++frameCount}.json`,JSON.stringify(state),'utf-8');
            console.log(`added frame ${frameCount} in ${(new Date().getTime() - startTime)/1000}s`)
            
          });

          await page.evaluate(() => {

            window._getSnapshot = (ele) => {
                let html = ele.outerHTML;
                let css = [].slice.call(document.styleSheets)
                .map(sheet => [].slice.call(sheet.rules))
                .filter(sheet => !sheet.disabled)
                .reduce((all_rules, rules) => all_rules.concat(rules), [])
                .reduce((style, rule) => `${style}\n${rule.cssText}`, "")
                return {html,css}
            }

            window._logState = async () => {
                if(!window._lastMousePos){
                    window._lastMousePos = {x:0,y:0}
                    onmousemove = function(e){
                        window._lastMousePos.x = e.clientX;
                        window._lastMousePos.y = e.clientY;
                    }
        
        
                }
        
                let {html,css} = window._getSnapshot(document.body);
               
                logPageState({
                    scrollTop: document.documentElement.scrollTop,
                    mousePos:window._lastMousePos,
                    host:location.origin,
                    css,
                    html
                });
            }

            window._keepLoggingState = async () => {

                while(true){
                      await window._logState();
                      await new Promise(res => setTimeout(res,5000))
                }
           }

           
            const observer = new MutationObserver(async  mutations => {
                await window._logState()              
            });
            observer.observe(document.body, { attributes: true, childList: true, subtree: true });

             

            //_keepLoggingState();

           //document.documentElement.addEventListener("keyup", window._logState);


          });

}
 run(url);