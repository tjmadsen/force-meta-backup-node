
var fs       = require('fs');
var fse      = require('fs-extra');

var cleanMetadata = function(){

	fse.ensureDirSync('build');
	fse.emptyDirSync('build/metadata');
}

cleanMetadata();
