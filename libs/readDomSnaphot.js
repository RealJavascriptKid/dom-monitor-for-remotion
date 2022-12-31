module.exports = (snapshot,computedCSSProps) => {

    let doc = snapshot.documents[0], //let's worry about single document only for now
        strings = snapshot.strings;

    let html = ``,
        nodesFlattened = [] //hash of all nodes as flattened
        ;
        
    let buildAttributes = (arr) => {
        let atr = {}
        for(let i=0;i<arr.length;i=i+2){
            if(arr[i] < 0)
                continue;

            atr[strings[arr[i]]] = strings[arr[i+1]]
        }
        return atr;
    }

    let buildStyles = (arr) => {
        let styles = {}
        for(let i=0;i<arr.length;i++){
            styles[computedCSSProps[i]] = strings[arr[i]]
        }
        return styles;
    }

    //step 1) flattend all node related data
    for(let i=0;i<doc.nodes.nodeName.length;i++){
        let nodeData = {
            name: strings[doc.nodes.nodeName[i]],
            value: strings[doc.nodes.nodeValue[i]],
            type: strings[doc.nodes.nodeType[i]],
            attributes:buildAttributes(doc.nodes.attributes[i]),
            styles:{}
        }

        nodesFlattened[i] = nodeData; //intentionally keeping the same index
    }

    //step 2) add computed styles 
    for(let i=0;i<doc.layout.nodeIndex.length;i++){
         let nodeData = nodesFlattened[doc.layout.nodeIndex[i]];
         nodeData.styles = buildStyles(doc.layout.styles[i])
    }

    //step 3) add parents
    for(let i=0;i<nodesFlattened.length;i++){
        nodesFlattened[i].parent = nodesFlattened[doc.nodes.parentIndex[i]]
    }
    
    return nodesFlattened;
}