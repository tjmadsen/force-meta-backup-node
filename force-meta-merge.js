
var builder = require('xmlbuilder');

var nforce = require('nforce'),
  meta = require('nforce-metadata')(nforce);


var _        = require('lodash');
var util     = require('util');
var fs       = require('fs');
var fse      = require('fs-extra');
var xmlmerge = require('./lib/xml-merge-node.js');
//var csv2obj  = require("./node_modules/xmlmerge-js/node_modules/heyutils/csv2obj.js");
var path     = require("path");

var XmlMergeTargetBuilder = function(type){
    var config = '';
    var srcDir = '';
    // console.log('Starting Analysis');

    
    var srcDir = 'build/profile-packages-metadata';
    // srcDir = 'test';

    var tgtDir = 'build/metadata';
    // tgtDir = 'test_out/'+type;
    // tgtDir = 'test_out';
    
    
    var walk = function(dir, done) {
        var results = [];
        fs.readdir(dir, function(err, list) {
            if (err) return done(err);
            var pending = list.length;
            if (!pending) return done(null, results);
            
            list.forEach(function(file) {
                file = path.resolve(dir, file);
                fs.stat(file, function(err, stat) {
                    if (stat && stat.isDirectory()) {
                        walk(file, function(err, res) {
                            results[file] = {type:'dir',name:file, contents:res};
                            if (!--pending) done(null, results);
                        });
                    } else {
                        results[file] = {type:'file',name:file};
                        if (!--pending) done(null, results);
                    }
                });
            });
        });
    };


    walk(srcDir, function(err, results){
        copyAllNonMergedMetadata(results);
        mergeAllPermissions(results);
        
    });


    var mergeAllPermissions = function(structure){
        
        //Get first folder
        var firstFolder = '';
        for(var i in structure){
            if(structure[i].type=='dir'){
                firstFolder = structure[i].name;
                break;
            }
        }

        var objects = {};

        var structureFirst = '';
        
        for(var i in structure){
            if(structure[i].type=='dir'){
                structureFirst = structure[i];
                break;
            }
        }

        var names = [];
        for(var j in structureFirst.contents){
            if(structureFirst.contents[j].type=='dir' && structureFirst.contents[j].name.indexOf(type) >= 0  ){
                //console.log('Copying '+structureFirst.name);
                for(var k in structureFirst.contents[j].contents){
                    var filenameTokens = k.split("/");
                    var filename = filenameTokens[filenameTokens.length-1];
                    names.push(filename);
                    if(type == 'profiles'){
                        objects[filename] = xmlmerge.getObj('<?xml version="1.0" encoding="UTF-8"?><Profile xmlns="http://soap.sforce.com/2006/04/metadata"><custom>false</custom></Profile>');
                    }else if(type == 'permissionsets'){
                        objects[filename] = xmlmerge.getObj('<?xml version="1.0" encoding="UTF-8"?><PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata"><custom>false</custom></PermissionSet>');
                    }
                    
                }
            }
        }





        
        fse.ensureDirSync(tgtDir+'/'+type);
        console.log('Number of '+type+': '+names.length);

        var mergeOne = function(name){
            for(var i in structure){
                if(structure[i].type=='dir' && firstFolder != structure[i].name && structure[i].contents ){
                    for(var j in structure[i].contents){
                        if(structure[i].contents[j].type=='dir' && structure[i].contents[j].name.indexOf(type) >= 0  ){
                            // console.log('Copying '+structure[i].name);
                            var filename = name;
                            var file2Data = fs.readFileSync(structure[i].contents[j].name+'/'+filename);
                            // console.log(structure[i].contents[j].name+'/'+filename);
                            var str2 = file2Data.toString();
                            // console.log(filename+' STR Length: '+str2.length);
                            var obj2 = xmlmerge.getObj(str2);
                            // console.log('Amount being added from '+ structure[i].name+': '+obj2.documentElement.childNodes.length);
                            var config = [
                                {nodename: 'Profile', attrname: '*'},
                                {nodename: 'PermissionSet', attrname: '*'},
                                {nodename: 'custom', attrname: '*'},
                                {nodename: 'userLicense', attrname: '*'},
                                {nodename: 'userPermissions', attrname: '*', childnode: 'name'},
                                {nodename: 'enabled', attrname: '*'},
                                {nodename: 'name', attrname: '*'}
                            ];
                            var xml = xmlmerge.mergeObj(objects[filename].documentElement, obj2.documentElement, config);
                            // var snapshot2 = v8.takeSnapshot();
                            // console.log('HEAP: ' + snapshot1.getHeader());
                            // console.log('Heap.Object: '+snapshot1.compare(snapshot2).Object);
                            // console.log('Heap.Text: '+snapshot1.compare(snapshot2).Text);
                            // console.log('Heap.Element: '+snapshot1.compare(snapshot2).Element);
                            // console.log(name+' Length: '+objects[filename].documentElement.childNodes.length);
                        }
                    }
                }
            }
            console.log(name+' Length: '+objects[name].documentElement.childNodes.length);
            console.log('Sorting '+name);
            xmlmerge.sortObj(objects[name]);
            console.log('Writing '+name);
            var res = fs.writeFileSync(tgtDir+'/'+type+'/'+name, xmlmerge.getXML(objects[name]));
            objects[name] = '';

        }

        for(var n in names){
            console.log('Copying '+names[n]);
            mergeOne(names[n]);
        }
    }

    var copyAllNonMergedMetadata = function(structure){
        for(var i in structure){
            if(structure[i].type=='dir' && structure[i].contents ){
                for(var j in structure[i].contents){
                    if(structure[i].contents[j].type=='dir' && structure[i].contents[j].name.indexOf('profiles') < 0 && structure[i].contents[j].name.indexOf('permissionsets') < 0  ){
                        var dirNameTokens = structure[i].contents[j].name.split("/");
                        var dirName = dirNameTokens[dirNameTokens.length-1];
                        fse.ensureDirSync(tgtDir+'/'+dirName);
                        fse.copy(structure[i].contents[j].name, tgtDir+'/'+dirName, {clobber:true}, function (err) {
                            if (err) {
                                //return console.error(err)
                            }
                            console.log('success!')
                        });
                    }
                }
            }
        }
    }


    // var sortAll = function(structure){
        
    //     for(var i in structure){
    //         console.log('Sorting: ');
    //         var filenameTokens = i.split("/");
    //         var filename = filenameTokens[filenameTokens.length-1];
    //         console.log('Sorting: '+filename);
    //         var file1Data = fs.readFileSync(tgtDir+'/'+filename);
    //         var str1 = file1Data.toString();
    //         var xml = xmlmerge.sort(str1);
    //         var res = fs.writeFileSync(tgtDir+'/'+filename, xml);
    //     }

    // }

};

XmlMergeTargetBuilder('profiles');
XmlMergeTargetBuilder('permissionsets');
