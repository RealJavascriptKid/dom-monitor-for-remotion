module.exports = (snapshot,computedCSSProps) => {

    let doc = snapshot.documents[0], //let's worry about single document only for now
        strings = snapshot.strings;

    let html = ``,
        nodesFlattened = [], //hash of all nodes as flattened
        rootNodes = [];
        
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

    let populateAttributes = (node) => {
        let att = ``;
        for(let prop in node.attributes){
            att += ' ' + prop;
            att += (node.attributes[prop] != null)?`="${node.attributes[prop]}"`:''; 
        }
        return att;
    }

    let populateChildren = (node) => {
        let content = ``;
        for(let children of node.children){
            if(children.children.length)
                content += populateChildren(children); //recursive
            else
                content += children.html;
        }
        node.html = node.html.replace('{{CONTENT}}',content);
        return node.html;
    }

    //step 1) flattend all node related data
    for(let i=0;i<doc.nodes.nodeName.length;i++){
        let nodeData = {
            idx:i,
            name: strings[doc.nodes.nodeName[i]],
            value: strings[doc.nodes.nodeValue[i]],
            type: strings[doc.nodes.nodeType[i]],
            attributes:buildAttributes(doc.nodes.attributes[i]),
            styles:{},
            children:[]
        }

        nodesFlattened[i] = nodeData; //intentionally keeping the same index
    }

    //step 2) add computed styles 
    for(let i=0;i<doc.layout.nodeIndex.length;i++){
         let nodeData = nodesFlattened[doc.layout.nodeIndex[i]];
         nodeData.styles = buildStyles(doc.layout.styles[i])
    }

    //step 3) add parent-children references (WARNING this makes nodesFlattend object to have circular references)
    for(let i=0;i<nodesFlattened.length;i++){
        let node = nodesFlattened[i];
        let parent = nodesFlattened[doc.nodes.parentIndex[i]];
        if(parent){
            node.parent = parent
            parent.children.push(node)
        }else{
            rootNodes.push(node)
        }

        node.html = `{{CONTENT}}`;
        switch(node.name.toLowerCase()){
            case '#text':
                node.html = node.value || '';
                break;
            case '#document':
                break;
            case 'input':
                node.html = `<${node.name}${populateAttributes(node)}/>`
                break;
            default:
                node.html = `<${node.name}${populateAttributes(node)}>${node.html}</${node.name}>`
                break;
        }

    }

    //step 4) building html
    html = populateChildren(rootNodes[0]);

    html = html.replaceAll('{{CONTENT}}','');
    return html;
}