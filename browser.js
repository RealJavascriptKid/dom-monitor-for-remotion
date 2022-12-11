
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
    
   
}
 run();