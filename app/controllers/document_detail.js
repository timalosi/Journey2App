/**
 * Controller for the article node screen
 *
 * @class Controllers.article.article
 * @uses Models.article
 * @uses core
 * @uses social
 * @uses Widgets.com.mcongrove.detailNavigation
 */
var APP = require("core");
var Quicklook = require("ti.quicklook");
var FileManager = require("FileManager");

var CONFIG = arguments[0] || {};
var ACTION = {};
var DOCS = [];
var INDEX = 0;

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "document_detail.init | " + JSON.stringify(CONFIG));

	//Get the list of document
	var fm = new FileManager();
	var results = fm.ls(Alloy.Globals.directoryPath);
	var files = results.files;
	var paths = [];

	var error = null;

	if (files.length == 0) {
		$.handleNavigation(false);
		return;
	}
	for (var i in files) {
		paths.push(files[i].nativePath);
	}
	if (CONFIG.index && CONFIG.index > 0) {
		var end = paths.splice(CONFIG.index, paths.length - CONFIG.index);
		var begin = paths.splice(0, CONFIG.index);
		DOCS = end.concat(begin);
	} else {
		DOCS = DOCS.concat(paths);
	}
	APP.log("debug", "document_detail.DOCS |" + JSON.stringify(DOCS));

	// Confirm that Quicklook is supported on this device
	if (!Quicklook.isSupported()) {
		error = 'iOS 4.0 or greater is required for Quicklook.';
	} else {
		// IMPORTANT! Always check if items can be previewed, or a generic error will be displayed to your users!
		for (var i = 0; i < DOCS.length; i++) {
			if (!Quicklook.canPreviewItem(DOCS[i])) {
				error = 'The document "' + DOCS[i] + '" cannot be previewed with Quicklook!';
				break;
			}
		}
	}

	if (error) {
		alert(error);
	} else {
		INDEX = 0;
		$.quickView = Quicklook.createView({
			data : DOCS,
		});
		$.container.add($.quickView);
	}

	$.handleNavigation(true);

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

	if (APP.Device.isHandheld) {
		$.NavigationBar.showBack(function(_event) {
			APP.removeAllChildren();
		});
	}

	$.NavigationBar.showAction(function(_event) {
		var docAction = Ti.UI.iOS.createDocumentViewer({
			url : DOCS[INDEX]
		});

		docAction.show({
			animated : false
		});
	});
};

/**
 * Handles detail navigation
 */
$.handleNavigation = function(_addarrows) {

	if (_addarrows) {
		var navigation = Alloy.createWidget("com.mcongrove.detailNavigation", null, {
			color : APP.Settings.colors.theme == "dark" ? "white" : "black",
			down : function(_event) {
				APP.log("debug", "document_detail @next");
				if (INDEX == DOCS.length - 1) {
					//Last document
					INDEX = 0;
				} else {
					INDEX += 1;
				}
				$.updateIndex(INDEX);

			},
			up : function(_event) {
				APP.log("debug", "document_detail @previous");

				if (INDEX == 0) {
					//First document
					INDEX = DOCS.length - 1;
				} else {
					INDEX -= 1;
				}
				$.updateIndex(INDEX);
			}
		}).getView();
	} else {
		var navigation = Alloy.createWidget("com.mcongrove.detailNavigation", null, {
			color : APP.Settings.colors.theme == "dark" ? "white" : "black"
		}).getView();
	}

	$.NavigationBar.addNavigation(navigation);
};

// Navigation Management
$.updateIndex = function(index) {
	$.quickView.setIndex(index);
};
// Kick off the init
$.init();
