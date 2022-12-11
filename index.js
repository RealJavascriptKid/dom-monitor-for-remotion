let url = `file:///C:/Users/saadn/Desktop/sn_data/projects/remotion/dom-monitor-for-remotion/tests/ex2.html`,
      fps = 30,
      seconds = 10;

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

let getCurrentState = async (page) => {


   const result = await page.evaluate(async () => {

        if(!window._lastMousePos){
            window._lastMousePos = {x:0,y:0}
            onmousemove = function(e){
                window._lastMousePos.x = e.clientX;
                window._lastMousePos.y = e.clientY;
            }


        }

        let id = 0,styles = {};
        let elems = document.querySelectorAll( '*' ); //document.all;
        for(let e of elems){
            // if(['STYLE','SCRIPT'].includes(e.tagName))               
            //     continue;

            if(!e.id)
                e.id = `_dynVidID_${++id}`
            styles[e.id] = JSON.parse(JSON.stringify(getComputedStyle(e)))    
        }
            
        return {
            scrollTop: document.documentElement.scrollTop,
            mousePos:window._lastMousePos,
            styles,
            html: document.all[0].outerHTML //document.body.innerHTML
        }
    });
    
    return result
}

let run = async () => {

    fsExtra.emptyDirSync('out');

   
    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        args: [] 
    })
    
    
    const page = await browser.newPage()


    await page.goto(url, { waitUntil: 'networkidle0' })


    let waitTime = (1/fps)/1000,
        iterations = fps*seconds;

   

    let totalTime = new Date().getTime();    
    for(let i=1;i<=iterations;i++){
        
        let startTime = new Date().getTime();
        const state = await getCurrentState(page)
        fs.writeFileSync(`out/frame${i}.json`,JSON.stringify(state),'utf-8');
        console.log(`added frame ${i} in ${(new Date().getTime() - startTime)/1000}s`)
        //await wait(waitTime)
    }


    console.log('done collecting... total time took:', `${(new Date().getTime() - totalTime)/1000}s`)

    await browser.close();

    console.log('all done!')
}
 run();