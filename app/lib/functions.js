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

		if (ENV_DEV) {
			AEAnalyticsEngine.setExpiration(0);
		}
		AEAnalyticsEngine.prepAppLaunch();
	} catch(err) {
		handleError({
			f : 'functions.preInit',
			err : err
		});
	}
};

exports.postInit = function() {
	try {
		//create or get reference to the directory
		Ti.App.addEventListener("resumed", exports.resumeObserver);
		//Log Launch Analytics
		var vid = AEAnalyticsEngine.vid;
		AEAnalyticsEngine.appLaunch((ENV_DEV) ? 'dev' : 'prod', vid);
	} catch(err) {
		handleError({
			f : 'functions.postInit',
			err : err
		});
	}
};

exports.resumeObserver = function(e) {

	var args = Ti.App.getArguments();

	try {

		AEAnalyticsEngine.appResumed();

		exports.processArguments();
	} catch(err) {
		handleError({
			f : 'functions.resumeObserver',
			err : err
		});
	}
};

exports.processArguments = function() {

	var args = Ti.App.getArguments();

	try {

		var args = Ti.App.getArguments();

		if (args.url !== undefined) {
			var url = args.url;
			Alloy.Globals.url = url;

			var components = args.url.split('/');
			var len = components.length;
			var parameters = {};

			if (len > 0) {
				//Get the protocol and decide what to do
				switch(components[0].toLowerCase()) {
					case ('pdf:'):
					case ('pdfhttp:'):
						url = url.replace(components[0], 'http:');
						break;
					case('pdfs:'):
					case('pdfhttps:'):
						url = url.replace(components[0], 'https:');
						break;
				}
				var APP = require("core");
				//Open up web page
				APP.addChild("web", {
					url : url,
					isChild : true
				}, true, false);
				APP = null;
			} else {/*len > 0*/
				return false;
			}
		} else {/*args.url === undefined*/
			return false;
		}
	} catch(err) {
		handleError({
			f : 'functions.processArguments',
			err : err
		});
	}
};

exports.convertToPDF = function(_extWebView, _filename, _paper) {
	try {

		Ti.API.debug("functions.convertToPDF");
		AEAnalyticsEngine.incrementKpi();

		var filename = "";
		var url = _extWebView.url;

		if (_filename !== undefined) {
			filename = _filename;
		} else {
			//Not sure why there is no filename ... so ...
			//Build a default filename from the url
			//Remove the query string parameter (if ther is one)
			var urlarray1 = url.split("?");
			//Check to see if there is a trailing "/"
			var i = (urlarray1[0].substr(urlarray1[0].length - 1) == "/") ? 2 : 1;
			var urlarray2 = urlarray1[0].split("/");
			//extract the filename
			filename = Ti.Network.encodeURIComponent(urlarray2[urlarray2.length - i]);
			filename += ".pdf";
		}

		//Delete the file if it already exists
		var file = Ti.Filesystem.getFile(Alloy.Globals.directoryPath, filename);
		if (file.exists()) {
			file.deleteFile();
		}

		var paper = "";
		if (_paper !== undefined) {
			paper = _paper;
		} else {
			paper = "letter";
		}

		_extWebView.convertToPdf({
			filename : filename,
			path : file.nativePath,
			directory : Alloy.Globals.directoryPath,
			papersize : paper
		});

		var now = new Date().toLocaleString();

		Ti.App.fireEvent("document_change", {});
		var parameters = {
			url : url,
			filename : filename,
			timestamp : now
		};

		var urlCollection = Alloy.Collections.url;
		var existingHistory = urlCollection.where({
			url : url
		});

		if (existingHistory.length !== undefined && existingHistory.length == 0) {
			var urlItem = Alloy.createModel('url', parameters);
			urlItem.save();
			Ti.App.fireEvent("history_change", {});
		}
	} catch(err) {
		handleError({
			f : 'functions.convertToPDF',
			err : err
		});
	}
};

exports.getPdfsConverted = function() {
	return AEAnalyticsEngine.getKpi();
};
/**
 * Determines if there are PDF Files
 * @returns {Boolean} PDF Files Exist
 */
exports.filesExist = function() {
	try {
		//Create a FileManager object
		var fm = new FileManager();
		var results = fm.ls(Alloy.Globals.directoryPath);
		return (results.fileCount > 0) ? true : false;
	} catch(err) {
		handleError({
			f : 'functions.filesExists',
			err : err
		});
	}
};
/**
 * Display an dialog box with some information about the error
 * @param {Object}	f: Function name and err: error object
 */
var handleError = function(_args) {
	/*
	 * _args.f = string name of function
	 * _args.err = error object
	 */
	try {
		var alertDialog = Titanium.UI.createAlertDialog({
			title : L('titleUnexpectedError'),
			message : _args.f + ':' + _args.err,
			buttonNames : [L('acknowledged')]
		});
		alertDialog.show();
		Ti.API.error(_args.f + '.error:' + _args.err);
	} catch (err) {
		Ti.API.error('APP.error.error:' + err);
	}

};

