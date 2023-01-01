
const puppeteer = require('puppeteer');
const fs = require('fs');
const allCSSProps = require('./libs/all-css-props'),
      readDomSnapshot = require('./libs/readDomSnaphot');

let url = 'file:///C:/Users/saadn/Desktop/sn_data/projects/remotion/dom-monitor-for-remotion/tests/ex1.html';

url = 'https://ratingstogo.com';

let wait = (time) => {
  return new Promise(res => {
      setTimeout(() => {
          res();
      },time)
  })
}


async function test1(cdp) {

    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    fs.writeFileSync('out/page.mhtml', data);

}

async function test2(cdp) {


  const result  = await cdp.send('DOMSnapshot.captureSnapshot', { 
    computedStyles: allCSSProps, //['display','width','height','color','background-color','margin'],
    includePaintOrder:true,
    includeDOMRects:true
   });
  
  fs.writeFileSync('out/domSnapshot.json', JSON.stringify(result));

  //let result = require('./out/domSnapshot.json')

   let html = readDomSnapshot(result,allCSSProps)

   fs.writeFileSync('out/domSnapshot.html', html);

}

async function test3(cdp,page) {

  let frameCount = 0;
  await page.exposeFunction('logPageState', async (additionalState) => {

    
    let startTime = new Date().getTime();
    const result  = await cdp.send('DOMSnapshot.captureSnapshot', { 
      computedStyles: allCSSProps, //['display','width','height','color','background-color','margin'],
      includePaintOrder:false,
      includeDOMRects:false
     });
     result.additionalState = additionalState;
    fs.writeFileSync(`out/frame${++frameCount}.json`,JSON.stringify(result),'utf-8');
    console.log(`added frame ${frameCount} in ${(new Date().getTime() - startTime)/1000}s`)
    
  });

  await page.evaluate(() => {

        window._logState = async () => {
          if(!window._lastMousePos){
              window._lastMousePos = {x:0,y:0}
              onmousemove = function(e){
                  window._lastMousePos.x = e.clientX;
                  window._lastMousePos.y = e.clientY;
              }
          }

      
          logPageState({
              scrollTop: document.documentElement.scrollTop,
              mousePos:window._lastMousePos,
              host:location.origin
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

//read snapshots created by test3
async function test4(){
     for(let i=1;i<300;i++){

        let startTime = new Date().getTime();
        let result = require(`./out/frame${i}.json`);
        let html = readDomSnapshot(result,allCSSProps)
        fs.writeFileSync(`out/frame${i}.html`, html);
        console.log(`converted frame ${i} to html in ${(new Date().getTime() - startTime)/1000}s`)
     }
}


(async function main() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      args: [] 
    });
    const [page] = await browser.pages();

    await page.setViewport({
      width: 1920,
      height: 1080
  });

    await page.goto(url);

    await wait(1000)
    
    const cdp = await page.target().createCDPSession();

    //await test1(cdp);

    //await test2(cdp);

    //await test3(cdp,page);

    await test4();
    
    //await browser.close();
  } catch (err) {
    console.error(err);
  }
})();

