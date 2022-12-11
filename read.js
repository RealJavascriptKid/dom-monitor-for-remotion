const fs = require('fs'),
      fsExtra = require('fs-extra'),
      useJSStyles = false;

let fileNames = [];

for(let i=1;i<=5;i++){
    fileNames.push(`frame${i}`);
}

//fileNames = ['frame5']


let run = async () => {

    const cheerio = require('cheerio');
      
    function styleObjToCss(id,obj){
        let css = ``;
        for(let i in obj){
            if(!isNaN(i))
              continue;

            let cssProperty = i.replace(/[A-Z]/g, m => "-" + m.toLowerCase());

            if(obj[i])
                css += `${cssProperty}:${obj[i]};`

        }

        css = `
              #${id} {
                ${css}
             }`
        return css;
    }

    function styleObjToJs(id,obj){
        let js = ``;
        for(let i in obj){
            if(!isNaN(i))
              continue;
          
            if(obj[i])
                js += `
                window["ele${id}"].style['${i}'] = '${obj[i]}';`

        }

        js = `
            window["ele${id}"] = document.getElementById('${id}');
            ${js}`
        return js;
    }

 
    for(let fileName of fileNames)
        await createHtml(fileName)
        
    async function createHtml(name){
        
        let item =  JSON.parse(fs.readFileSync(`out/${name}.json`,'utf-8'));

        let htmlStyle = '';
        for(let id in item.styles){

            if(useJSStyles)            
                htmlStyle += styleObjToJs(id,item.styles[id])  
            else
                htmlStyle += styleObjToCss(id,item.styles[id])          
        }

        if(useJSStyles)  
            htmlStyle = `
            <script>
                window.start = function(){
                    ${htmlStyle}
                }    
                window.start           
            </script>`;
        else
            htmlStyle = `
            <style>
                ${htmlStyle}
            </style>`;

        const $ = cheerio.load(item.html
            .replaceAll('src="/wp-content/','src="https://ratingstogo.com/wp-content/')
            .replaceAll('href="assets','href="https://ratingstogo.com/assets')
            );
  
            $('noscript, iframe').remove();


        $('style').remove();
        $('script').remove();
        $('link').remove();

        // let html =  `
        // <html>
        //     <head>
        //         <style>
        //           ${htmlStyle}
        //         </style>
        //     </head>
        //     <body>${$.html()}</body>
        // </html>`

        $('body').append(`${htmlStyle}`)

        $('body').append(`<script>document.body.scrollTop = ${item.scrollTop}</script>`)

        fs.writeFileSync(`out/${name}.html`,$.html(),'utf-8');
    }
    
}
 run();