String.prototype.toPascalCase = function () {
  return this.toLowerCase()
    .replace(new RegExp(/[-_]+/, "g"), " ")
    .replace(new RegExp(/[^\w\s]/, "g"), "")
    .replace(
      new RegExp(/\s+(.)(\w*)/, "g"),
      ($1, $2, $3) => `${$2.toUpperCase() + $3}`
    )
    .replace(new RegExp(/\w/), (s) => s.toUpperCase());
};

const fs = require("fs"),
  fsExtra = require("fs-extra");

const makeReactFC = false; //this will make react components instead of html file

let fileNames = [];

for (let i = 1; i <= 300; i++) {
  fileNames.push(`frame${i}`);
}

//fileNames = ['frame6']

let run = async () => {
  const cheerio = require("cheerio");

  function styleObjToCss(id, obj, $) {
    let css = ``;
    for (let i in obj) {
      if (!isNaN(i)) continue;

      let cssProperty = i.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

      // if(cssProperty.startsWith('animation'))
      //     continue;

      if (obj[i]) {
        if ($) $(`#${id}`).css(cssProperty, obj[i]);
        else css += `${cssProperty}:${obj[i]};`;
      }
    }
    css = `
        #${id} {
            ${css}
        }
        `;
    return css;
  }

  if (makeReactFC) await createReactFC();
  else {
    for (let fileName of fileNames) {
      await createHtml(fileName);
    }
  }

  async function createHtml(name) {
    let item = JSON.parse(fs.readFileSync(`out/${name}.json`, "utf-8"));

    const $ = cheerio.load(
      item.html
        .replaceAll(`src="/`, `src="${item.host}/`)
        .replaceAll(`src="./`, `src="${item.host}/`)
        .replaceAll(`href="/`, `href="${item.host}/`)
        .replaceAll(`href="assets`, `href="${item.host}/assets`)
    );

    $("noscript, iframe").remove();
    $("style").remove();
    $("script").remove();
    $("link").remove();

    if (!item.css) {
      item.css = "";
      for (let id in item.styles) {
        item.css += styleObjToCss(id, item.styles[id]);
      }
    }

    item.css = `
            <style>
                ${item.css}
            </style>`;

    //$('body *').removeClass(); //remove all classes

    $("body").append(`${item.css}`);

    $("body").append(
      `<script>document.body.scrollTop = ${item.scrollTop}</script>`
    );

    fs.writeFileSync(`out/${name}.html`, $.html(), "utf-8");
  }

  async function createReactFC() {

    let HTMLtoJSX = require('htmltojsx');
    let htmltoJSX = new HTMLtoJSX({
        createClass: false,
    });

    let htmls = [];

    for (let name of fileNames) {
      try {
        let item = JSON.parse(fs.readFileSync(`out/${name}.json`, "utf-8"));

        const $ = cheerio.load(
          item.html
            .replaceAll(`src="/`, `src="${item.host}/`)
            .replaceAll(`src="./`, `src="${item.host}/`)
            .replaceAll(`href="/`, `href="${item.host}/`)
            .replaceAll(`href="assets`, `href="${item.host}/assets`)
        );

        $("noscript, iframe").remove();
        $("style").remove();
        $("script").remove();
        $("link").remove();

        if (!item.css) {
          item.css = "";
          for (let id in item.styles) {
            item.css += styleObjToCss(id, item.styles[id]);
          }
        }

        // item.css = `
        // <style>
        //     ${item.css}
        // </style>`;

        //$('body *').removeClass(); //remove all classes

        //$('body').append(`${item.css}`)

        //$('body').append(`<script>document.body.scrollTop = ${item.scrollTop}</script>`)

        item.html = $.html();
        item.html = $("body")
          .css('margin-top',`-${parseInt(item.scrollTop)}px`)
          .prop("outerHTML")
          .replaceAll("<body", "<div")
          .replaceAll("</body", `
          <style>${item.css}</style>
          </div`);

        item.html = htmltoJSX.convert(item.html)

        item.name = name;
        htmls.push(item);
      } catch (e) {}
    }

    let jsx = `
        
        import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

        export const Frames = (props) => {
                const frame = useCurrentFrame();
                const {durationInFrames, fps} = useVideoConfig();
               
                return (
                    <>
                   
                    {
                        (() => {
                            switch('frame' + frame) {
                                ${htmls.map(item => {
                                  return ` 
                                    case '${item.name}': {
                                            return (                                              
                                                ${item.html}
                                            )
                                        }`;
                                }).join('')}                                   
                            }
                        })()  
                    }  
                    
                    </>
                );
        }
        
        `;

    fs.writeFileSync(`out/Frames.jsx`, jsx, "utf-8");
  }
};
run();
