
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

var XmlMergeTargetBuilder = function(){
    var config = '';
    var srcDir = '';

    
    srcDir = 'build/profile-packages-metadata';
    // srcDir = 'test';

    tgtDir = 'build/metadata/profiles'
    // tgtDir = 'test_out/profiles'
    
    
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
        mergeAll(results);
    });
    
    
       

    var mergeAll = function(structure){
        
        //Get first folder
        var firstFolder = '';
        for(var i in structure){
            if(structure[i].type=='dir'){
                firstFolder = structure[i].name;
                break;
            }
            
        }
        var profileObjects = {};

        var structureFirst = '';
        
        for(var i in structure){
            structureFirst = structure[i];
            break;
        }

        var profiles = [];
        for(var j in structureFirst.contents){
            if(structureFirst.contents[j].type=='dir' && structureFirst.contents[j].name.indexOf("profiles") >= 0  ){
                //console.log('Copying '+structureFirst.name);
                for(var k in structureFirst.contents[j].contents){
                    var filenameTokens = k.split("/");
                    var filename = filenameTokens[filenameTokens.length-1];
                    profiles.push(filename);
                    profileObjects[filename] = xmlmerge.getObj('<?xml version="1.0" encoding="UTF-8"?><Profile xmlns="http://soap.sforce.com/2006/04/metadata"><custom>false</custom></Profile>');
                }
            }
        }





        //Merge Profiles
        fse.ensureDirSync(tgtDir);
        // console.log('Copying Initial Set');

        var mergeOne = function(profile){
            for(var i in structure){
                if(structure[i].type=='dir' && firstFolder != structure[i].name && structure[i].contents ){
                    for(var j in structure[i].contents){
                        if(structure[i].contents[j].type=='dir' && structure[i].contents[j].name.indexOf("profiles") >= 0  ){
                            // console.log('Copying '+structure[i].name);
                            var filename = profiles[n];
                            var file2Data = fs.readFileSync(structure[i].contents[j].name+'/'+filename);
                            // console.log(structure[i].contents[j].name+'/'+filename);
                            var str2 = file2Data.toString();
                            // console.log(filename+' STR Length: '+str2.length);
                            var obj2 = xmlmerge.getObj(str2);
                            // console.log('Amount being added from '+ structure[i].name+': '+obj2.documentElement.childNodes.length);
                            var config = [
                                {nodename: 'Profile', attrname: '*'},
                                {nodename: 'custom', attrname: '*'},
                                {nodename: 'userLicense', attrname: '*'},
                                {nodename: 'userPermissions', attrname: '*', childnode: 'name'},
                                {nodename: 'enabled', attrname: '*'},
                                {nodename: 'name', attrname: '*'}
                            ];
                            var xml = xmlmerge.mergeObj(profileObjects[filename].documentElement, obj2.documentElement, config);
                            // console.log(profiles[n]+' Length: '+profileObjects[filename].documentElement.childNodes.length);
                        }
                    }
                }
            }
            console.log(profiles[n]+' Length: '+profileObjects[profiles[n]].documentElement.childNodes.length);
            console.log('Sorting '+profiles[n]);
            xmlmerge.sortObj(profileObjects[profiles[n]]);
            console.log('Writing '+profiles[n]);
            var res = fs.writeFileSync(tgtDir+'/'+profiles[n], xmlmerge.getXML(profileObjects[profiles[n]]));
        }

        for(var n in profiles){
            console.log('Copying '+profiles[n]);
            mergeOne(profiles[n]);
        }
    }

    var sortAll = function(structure){
        
        for(var i in structure){
            console.log('Sorting: ');
            var filenameTokens = i.split("/");
            var filename = filenameTokens[filenameTokens.length-1];
            console.log('Sorting: '+filename);
            var file1Data = fs.readFileSync(tgtDir+'/'+filename);
            var str1 = file1Data.toString();
            var xml = xmlmerge.sort(str1);
            var res = fs.writeFileSync(tgtDir+'/'+filename, xml);
        }

    }

    // fs.readFile('samples/AndroidManifest.xml', function(err, data) {
    //     var str1 = data.toString();

    //     fs.readFile('samples/kuaiwan.xml', function(err, data) {
    //         var str2 = data.toString();

    //         fs.readFile('samples/AndroidManifest.csv', function(err, data) {

    //             config = csv2obj.csv2obj(data.toString());

    //             xmlmerge.merge(str1, str2, config, function (xml) {
    //                 fs.writeFile('samples/output.xml', xml, function (err) {

    //                 });
    //             });
    //         });
    //     });
    // });    

    // dir.eachFileRecurse (FileType.FILES) { file ->
    //     if (file.name ==~ /.+\.profile$/) {
    //         data.profiles << file.name
    //     } else if (file.name ==~ /.+\.permissionset/) {
    //         data.permissionsets <<  file.name
    //     }
    // }

    // private writeBuildXml() {
    //     def writer = FileWriterFactory.create("${config['build.dir']}/profile-packages-merge-target.xml")
    //     def builder = new MarkupBuilder(writer)

    //     def targetName = 'profilesPackageXmlMerge'
    //     def metadataDir = "${config['build.dir']}/metadata"

    //     builder.project('default': targetName) {
    //         'import'(file: '../ant-includes/setup-target.xml')

    //         target(name: targetName) {
    //             data.each { type, filenames ->
    //                 def destDir = "$metadataDir/$type"
    //                 mkdir(dir: destDir)

    //                 filenames.each { filename ->
    //                     echo "Xml Merging: $filename"
    //                     xmlmerge(dest: "$destDir/$filename", conf: 'xmlmerge.properties'
    //                     ) {
    //                         fileset(dir: srcDir) {
    //                             include(name: "**/$filename")
    //                         }
    //                     }
    //                 }
    //             }

    //             // TODO maybe we can dynamically build this list of folders/files to be copied
    //             copy(todir: metadataDir) {
    //                 fileset(dir: srcDir) {
    //                     include(name: '**/classes/*')
    //                     include(name: '**/pages/*')
    //                     include(name: '**/applications/*')
    //                     include(name: '**/objects/*')
    //                     include(name: '**/objectTranslations/*')
    //                     include(name: '**/customPermissions/*');
    //                     include(name: '**/tabs/*')
    //                     include(name: '**/layouts/*')
    //                     include(name: '**/dataSources/*')
    //                 }

    //                 cutdirsmapper(dirs: 1)
    //             }
    //         }
    //     }
    // }
};

XmlMergeTargetBuilder();
