let url = `file:///C:/Users/saadn/Desktop/sn_data/projects/remotion/dom-monitor-for-remotion/tests/ex2.html`,
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



let run = async () => {

    fsExtra.emptyDirSync('out');

   
    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        args: [] 
    })
    
    
    const page = await browser.newPage()

    
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
        
                let id = 0;
                window._stateStyles = {};
                let elems = document.querySelectorAll( '*' ); //document.all;
                for(let e of elems){
                    // if(['STYLE','SCRIPT'].includes(e.tagName))               
                    //     continue;
        
                    if(!e.id)
                        e.id = `_dynVidID_${++id}`
                    window._stateStyles[e.id] = JSON.parse(JSON.stringify(getComputedStyle(e)))    
                } 


                logPageState({
                    scrollTop: document.documentElement.scrollTop,
                    mousePos:window._lastMousePos,
                    host:location.origin,
                    styles:window._stateStyles,
                    html: document.all[0].outerHTML //document.body.innerHTML
                });
            }

            window._keepLoggingState = async () => {

                while(true){
                      await window._logState();
                      await new Promise(res => setTimeout(res,5000))
                }
           }

           
            // const observer = new MutationObserver(async  mutations => {
            //     await window._logState()              
            // });
            // observer.observe(document.body, { attributes: true, childList: true, subtree: true });

             

            //_keepLoggingState();

            document.documentElement.addEventListener("keyup", window._logState);


          });

}
 run();