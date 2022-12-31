
const puppeteer = require('puppeteer');
const fs = require('fs');
const allCSSProps = require('./libs/all-css-props'),
      readDomSnapshot = require('./libs/readDomSnaphot');

let url = 'file:///C:/Users/saadn/Desktop/sn_data/projects/remotion/dom-monitor-for-remotion/tests/ex4.html';

//url = 'https://ratingstogo.com';


async function test1(cdp) {

    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    fs.writeFileSync('out/page.mhtml', data);

}

async function test2(cdp) {


  // const result  = await cdp.send('DOMSnapshot.captureSnapshot', { 
  //   computedStyles: allCSSProps, //['display','width','height','color','background-color','margin'],
  //   includePaintOrder:true,
  //   includeDOMRects:true
  //  });
  
  //  fs.writeFileSync('out/domSnapshot.json', JSON.stringify(result));

  let result = require('./out/domSnapshot.json')

   let html = readDomSnapshot(result,allCSSProps)

  //console.log('test2 result:',result)

}

async function test3(cdp) {


  // await cdp.send('DOM.enable')
  // await cdp.send('CSS.enable')

  // const result  = await cdp.send('CSS.takeComputedStyleUpdates', { 
  //    nodeId:3
  //  });
  // //fs.writeFileSync('out/page.html', data);

  // console.log('test3 result:',result)

}


(async function main() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      args: [] 
    });
    const [page] = await browser.pages();

    await page.goto(url);

    
    const cdp = await page.target().createCDPSession();

    //await test1(cdp);

    await test2(cdp);

    await test3(cdp);
    
    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
