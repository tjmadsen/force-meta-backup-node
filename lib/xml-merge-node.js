/**
 * Created by zhs007 on 2014/12/4.
 */

var DOMParser = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;
var pd = require('pretty-data').pd;
var fs = require('fs');
var timsort = require('timsort')
//var logger = require('./logger');

function addChild(obj, child) {
    obj.appendChild(child);
}

function findNodeAttr(obj, attrName) {
    var attrs = obj.attributes;

    for (var i = 0; i < attrs.length; ++i) {
        if (attrs[i].nodeName == attrName) {
            return attrs[i];
        }
    }

    return null;
}

function isEquNode(obj1, obj2, config) {
    if (obj1.nodeName == obj2.nodeName) {
        var max = config.length;
        for (var i = 0; i < max; ++i) {
            if (config[i].nodename == obj1.nodeName) {
                if (config[i].attrname == '*') {
                    if(config[i].childnode === null){
                        return true;    
                    }else{
                        var nums1 = obj1.childNodes.length;
                        var childs1 = obj1.childNodes;
                        var childValue1 = ''
                        for(var j = 0; j<nums1; j++){
                            if(childs1[j].nodeName == config[i].childnode){
                                for(var k=0; k<childs1[j].childNodes.length; k++ ){
                                    if(childs1[j].childNodes[k].nodeName == '#text'){
                                        childValue1 = childs1[j].childNodes[k].nodeValue;
                                    }
                                }
                            }
                        }
                        var nums2 = obj2.childNodes.length;
                        var childs2 = obj2.childNodes;
                        var childValue2 = ''
                        for(var j = 0; j<nums2; j++){
                            if(childs2[j].nodeName == config[i].childnode){
                                for(var k=0; k<childs2[j].childNodes.length; k++ ){
                                    if(childs2[j].childNodes[k].nodeName == '#text'){
                                        childValue2 = childs2[j].childNodes[k].nodeValue;
                                    }
                                }
                            }
                        }
                        if(childValue1 == childValue2){
                            return true;
                        }else{
                            return false;
                        }
                    }
                    
                }

                var attr1 = findNodeAttr(obj1, config[i].attrname);
                if (attr1 == null) {
                    return false;
                }

                var attr2 = findNodeAttr(obj2, config[i].attrname);
                if (attr2 == null) {
                    return false;
                }

                if (attr1.value == attr2.value) {
                    return true;
                }

                return false;
            }
        }
    }

    return false;
}

function findSameChild(obj, child, config) {
    var nums = obj.childNodes.length;
    var childs = obj.childNodes;
    for (var i = 0; i < nums; ++i) {
        var curobj = childs[i];
        if (isEquNode(curobj, child, config)) {
            return curobj;
        }
    }

    return null;
}

function sortDOM(a){
    if(a.hasChildNodes){
        console.log(a.childNodes.length+' Child Nodes');
        var thisNode = a.lastChild;
        var compareNode = a.firstChild;
        while(thisNode.previousSibling !== null){
            compareNode = a.firstChild
            while(thisNode.nodeName == '#text' && thisNode.previousSibling !== null){
                thisNode = thisNode.previousSibling;
            }
            console.log('Sorting: '+thisNode.nodeName);
            while(compareNode.nodeName == '#text' ||thisNode.nodeName > compareNode.nodeName){
                compareNode = compareNode.nextSibling;
            }
            if(thisNode.nodeName !== compareNode.nodeName){
                console.log('Moved '+thisNode.nodeName+' before '+compareNode.nodeName);
                a.insertBefore(a.removeChild(thisNode),compareNode);    
                
                thisNode = a.lastChild;
            }else{
                thisNode = thisNode.previousSibling;
            }
            while(thisNode.nodeName == '#text' && thisNode.previousSibling !== null){
                thisNode = thisNode.previousSibling;
            }
            
        }
    }else{
        console.log('No Child Nodes');
    }   
    return a;
}

function compareNodes(a,b){
  if (a.nodeName === b.nodeName) {
    return 0;

  } else {
    var aStr = String(a.nodeName);
    var bStr = String(b.nodeName);

    if (aStr === bStr) {
      return 0;

    } else {
      return aStr < bStr ? -1 : 1;
    }
  }
}

function mergeObj(obj1, obj2, config) {
    var isequ = isEquNode(obj1, obj2, config);
    if (!isequ) {
        return obj1;
    }

    if (!obj1.hasChildNodes() || !obj2.hasChildNodes()) {
        return obj1;
    }

    var nums2 = obj2.childNodes.length;
    var childs2 = obj2.childNodes;

    for (var i = 0; i < nums2; ++i) {
        var curobj = childs2[i];
        if (curobj.nodeName == '#text') {
            continue ;
        }

        //logger.normal.log('info', 'obj2 ', curobj.nodeName);

        var obj1child = findSameChild(obj1, curobj, config);
        if (obj1child != null) {
            mergeObj(obj1child, curobj, config);
        }else {
            addChild(obj1, curobj);
        }
    }

    return obj1;

}

 


function mergeSync(str1, str2, config) {
    var obj1 = new DOMParser().parseFromString(str1);
    var obj2 = new DOMParser().parseFromString(str2);

    mergeObj(obj1.documentElement, obj2.documentElement, config);

    var str = pd.xml(new XMLSerializer().serializeToString(obj1));
    return str;
}

function merge(str1, str2, config, callback) {
    var obj1 = new DOMParser().parseFromString(str1);
    var obj2 = new DOMParser().parseFromString(str2);

    mergeObj(obj1.documentElement, obj2.documentElement, config);

    var str = pd.xml(new XMLSerializer().serializeToString(obj1));
    callback(str);
}


function getObj(str){
    var obj = new DOMParser().parseFromString(str);
    return obj;
}


function getXML(obj1){
    var str = pd.xml(new XMLSerializer().serializeToString(obj1));
    return str;
}

function sort(str1){
    var obj1 = new DOMParser().parseFromString(str1);

    //var doc = document.implementation.createHTMLDocument('');
    var doc = new DOMParser().parseFromString('<dummy/>', 'text/xml');
        doc.removeChild(doc.documentElement);
    //sortXML(obj1);
    var children = [];
    while(obj1.documentElement.hasChildNodes()){
        var grandchildren = [];
        var textGrandChildren = []
        while(obj1.documentElement.firstChild.hasChildNodes()){
            var node = obj1.documentElement.firstChild.removeChild(obj1.documentElement.firstChild.firstChild);
            if (node.nodeName == '#text') {
                textGrandChildren.push(node.nodeValue);
            }else{
                grandchildren.push({nodeName:node.nodeName, nodeValue: node.removeChild(node.firstChild).nodeValue});
            }
        }
        var node = obj1.documentElement.removeChild(obj1.documentElement.firstChild);
        if (node.nodeName != '#text') {
            if(grandchildren.length > 0){
                children.push({nodeName:node.nodeName, children:grandchildren, nodeValue:null});
            }else{
                if(textGrandChildren.length > 0){
                    children.push({nodeName:node.nodeName, children:[], nodeValue:textGrandChildren[0]});    
                }
            }
        }
    }
    timsort.sort(children, compareNodes);
    for(var i in children){
        var node = doc.createElement(children[i].nodeName);
        if(children[i].children.length > 0){
            for(var j=0; j<children[i].children.length; j++){
                var child = doc.createElement(children[i].children[j].nodeName);
                child.appendChild(doc.createTextNode(children[i].children[j].nodeValue));
                node.appendChild(child);
            }
        }else{
            node.appendChild(doc.createTextNode(children[i].nodeValue));
        }
        obj1.documentElement.appendChild(node);
    }

    var str = pd.xml(new XMLSerializer().serializeToString(obj1));
    
    return str;
}

function sortObj(obj1){
    //var doc = document.implementation.createHTMLDocument('');
    var doc = new DOMParser().parseFromString('<dummy/>', 'text/xml');
        doc.removeChild(doc.documentElement);
    //sortXML(obj1);
    var children = [];
    while(obj1.documentElement.hasChildNodes()){
        var grandchildren = [];
        var textGrandChildren = []
        while(obj1.documentElement.firstChild.hasChildNodes()){
            var node = obj1.documentElement.firstChild.removeChild(obj1.documentElement.firstChild.firstChild);
            if (node.nodeName == '#text') {
                textGrandChildren.push(node.nodeValue);
            }else{
                grandchildren.push({nodeName:node.nodeName, nodeValue: node.removeChild(node.firstChild).nodeValue});
            }
        }
        var node = obj1.documentElement.removeChild(obj1.documentElement.firstChild);
        if (node.nodeName != '#text') {
            if(grandchildren.length > 0){
                children.push({nodeName:node.nodeName, children:grandchildren, nodeValue:null});
            }else{
                if(textGrandChildren.length > 0){
                    children.push({nodeName:node.nodeName, children:[], nodeValue:textGrandChildren[0]});    
                }
            }
        }
    }
    timsort.sort(children, compareNodes);
    for(var i in children){
        var node = doc.createElement(children[i].nodeName);
        if(children[i].children.length > 0){
            for(var j=0; j<children[i].children.length; j++){
                var child = doc.createElement(children[i].children[j].nodeName);
                child.appendChild(doc.createTextNode(children[i].children[j].nodeValue));
                node.appendChild(child);
            }
        }else{
            node.appendChild(doc.createTextNode(children[i].nodeValue));
        }
        obj1.documentElement.appendChild(node);
    }

    //var str = pd.xml(new XMLSerializer().serializeToString(obj1));
    
    return obj1;
}

exports.mergeSync = mergeSync;
exports.mergeObj = mergeObj;
exports.sort = sort;
exports.sortObj = sortObj;
exports.getObj = getObj;
exports.getXML = getXML;
