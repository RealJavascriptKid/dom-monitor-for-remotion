const fs = require('fs'),
      fsExtra = require('fs-extra');

let fileNames = [];

for(let i=1;i<=300;i++){
    fileNames.push(`frame${i}`);
}

//fileNames = ['frame6']


let run = async () => {

    const cheerio = require('cheerio');
      
    function styleObjToCss(id,obj,$){
        let css = ``;
        for(let i in obj){
            if(!isNaN(i))
              continue;

            let cssProperty = i.replace(/[A-Z]/g, m => "-" + m.toLowerCase());

            // if(cssProperty.startsWith('animation'))
            //     continue;

            if(obj[i]){
                if($)
                    $(`#${id}`).css(cssProperty,obj[i])
                else
                    css += `${cssProperty}:${obj[i]};`
            }
                

        }
        css = `
              #${id} {
                ${css}
             }`
        return css;
    }
   

 
    for(let fileName of fileNames)
        await createHtml(fileName)
        
    async function createHtml(name){
        
        let item =  JSON.parse(fs.readFileSync(`out/${name}.json`,'utf-8'));


        const $ = cheerio.load(item.html
            .replaceAll(`src="/`,`src="${item.host}/`)
            .replaceAll(`src="./`,`src="${item.host}/`)
            .replaceAll(`href="/`,`href="${item.host}/`)            
            .replaceAll(`href="assets`,`href="${item.host}/assets`)
            );
  
        $('noscript, iframe').remove();
        $('style').remove();
        $('script').remove();
        $('link').remove();

        if(!item.css){
            item.css = '';
            for(let id in item.styles){    
                item.css += styleObjToCss(id,item.styles[id])          
            }  
        }

        item.css = `
            <style>
                ${item.css}
            </style>`;

        //$('body *').removeClass(); //remove all classes       

        $('body').append(`${item.css}`)

        $('body').append(`<script>document.body.scrollTop = ${item.scrollTop}</script>`)

        fs.writeFileSync(`out/${name}.html`,$.html(),'utf-8');
    }
    
}
 run();