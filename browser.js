
const puppeteer = require('puppeteer'),
           fs = require('fs'),
           fsExtra = require('fs-extra');


let run = async () => {

   
    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials'
        ] 
    })    

   

    const page =  await browser.newPage()

    await page.setViewport({
        width: 1280,
        height: 720
    });

    await page.goto('https://ratingstogo.com', { waitUntil: 'networkidle0' })
    
   
}
 run();