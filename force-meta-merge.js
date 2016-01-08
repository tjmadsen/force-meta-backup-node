
var builder = require('xmlbuilder');

var nforce = require('nforce'),
  meta = require('nforce-metadata')(nforce);


var _        = require('lodash');
var util     = require('util');
var fs       = require('fs');
var fse      = require('fs-extra');
var xmlmerge = require('xmlmerge-js');
var csv2obj  = require("./node_modules/xmlmerge-js/node_modules/heyutils/csv2obj.js");
var path     = require("path");

var XmlMergeTargetBuilder = function(){
    var config = '';
    var srcDir = '';

    
    srcDir = "build/profile-packages-metadata"
    
    
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

        //Merge Profiles
        fse.ensureDirSync('build/metadata/profiles');
        console.log('Copying Initial Set');
        fse.copySync(firstFolder+'/profiles','build/metadata/profiles');
        for(var i in structure){
            if(structure[i].type=='dir' && firstFolder != structure[i].name && structure[i].contents ){
                for(var j in structure[i].contents){
                    if(structure[i].contents[j].type=='dir' && structure[i].contents[j].name.indexOf("profiles") >= 0  ){
                        console.log('Copying '+structure[i].name);
                        for(var k in structure[i].contents[j].contents){
                            console.log('Copying '+structure[i].contents[j].contents[k].name);
                            var filenameTokens = k.split("/");
                            var filename = filenameTokens[filenameTokens.length-1];
                            var file1Data = fs.readFileSync('build/metadata/profiles/'+filename);
                            var str1 = file1Data.toString();
                            var file2Data = fs.readFileSync(k);
                            var str2 = file2Data.toString();
                            var configData = fs.readFileSync('ProfileMerge.csv');
                            var config = csv2obj.csv2obj(configData.toString());
                            var xml = xmlmerge.mergeSync(str1, str2, config);
                            var res = fs.writeFileSync('build/metadata/profiles/'+filename, xml);
                        }
                    }
                }
            }
        }

            


        //mergePermsets(structure);

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
