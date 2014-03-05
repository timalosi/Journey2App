var FileManager = require('FileManager');
var AEAnalyticsEngine = require('com.snackableapps.aeanalyticsengine');

/**
 * Application Specific Initialization
 */
exports.preInit = function() {
	try {
		//create or get reference to the directory
		var fm = new FileManager();
		var directory = fm.createDirectory("pdf", Ti.Filesystem.applicationDataDirectory);
		Alloy.Globals.directoryPath = directory.nativePath;

		AEAnalyticsEngine.setExpiration(0);
		AEAnalyticsEngine.prepAppLaunch();
	} catch(err) {
		var msg = "Application.preInit.error:" + err;
		Ti.API.error(msg);
	}
};

exports.postInit = function() {
	try {
		//create or get reference to the directory
		//TODO: Check Arguments
		//TODO: Add observer for Resume
		//Log Launch Analytics
		//TODO: Detect and update environment
		AEAnalyticsEngine.appLaunch('dev');
	} catch(err) {
		var msg = "Application.postInit.error:" + err;
		Ti.API.error(msg);
	}
};
