/**
 * Controller for displaying a File in Tablet Detail
 *
 * @class Controllers.document_detail
 * @uses core
 * @uses ti.quicklook
 * @uses FileManager
 * @uses Widgets.com.mcongrove.detailNavigation
 *
 * CONFIG.index - index number to start the loop at
 * CONFIG.isChild - Passed from addChild
 */
var APP = require("core");
var Quicklook = require("ti.quicklook");
var FileManager = require("FileManager");

var CONFIG = arguments[0] || {};
var ACTION = {};
var NAMES = [];
var DOCS = [];
var INDEX = 0;

//TODO: when no documents and converting ... the address bar is black

/**
 * Initializes the controller
 */
$.init = function() {
	try {
		APP.log("debug", "document_detail.init | " + JSON.stringify(CONFIG));

		//Get the list of document
		var fm = new FileManager();
		var results = fm.ls(Alloy.Globals.directoryPath);
		var files = results.files;
		var paths = [];
		var filenames = [];

		var error = null;

		if (files.length == 0) {
			$.handleNavigation(false);
			return;
		}

		$.populate();

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
		
		Ti.App.addEventListener("APP.screen_change", $.refresh);
	} catch(err) {
		APP.error({
			f : 'document_details.init',
			err : err
		});
	}
};

/**
 * Handles detail navigation
 */
$.handleNavigation = function(_addarrows) {
	//TODO: Can we pass a title? //NOTYET ... need to update detailNavigation Widget
	try {
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
	} catch(err) {
		APP.error({
			f : 'document_details.handleNavigation',
			err : err
		});
	}
};

$.populate = function() {
	try {

		//Get the list of document
		var fm = new FileManager();
		var results = fm.ls(Alloy.Globals.directoryPath);
		var files = results.files;
		var paths = [];
		var filenames = [];

		var error = null;

		if (files.length > 0) {

			for (var i in files) {
				paths.push(files[i].nativePath);
				filenames.push(files[i].name);
			}
			if (CONFIG.index && CONFIG.index > 0) {
				var end = paths.splice(CONFIG.index, paths.length - CONFIG.index);
				var begin = paths.splice(0, CONFIG.index);
				var nend = filenames.splice(CONFIG.index, filenames.length - CONFIG.index);
				var nbegin = filenames.splice(0, CONFIG.index);
				DOCS = end.concat(begin);
				NAMES = nend.concat(nbegin);
			} else {
				DOCS = DOCS.concat(paths);
				NAMES = NAMES.concat(filenames);
			}
			APP.log("debug", "document_detail.DOCS |" + JSON.stringify(DOCS));

			// Confirm that Quicklook is supported on this device
			if (!Quicklook.isSupported()) {
				error = 'iOS 4.0 or greater is required for Quicklook.';
			} else {
				// IMPORTANT! Always check if items can be previewed, or a generic error will be displayed to your users!
				for (var i = 0; i < DOCS.length; i++) {
					if (!Quicklook.canPreviewItem(DOCS[i])) {
						error = 'The document "' + NAMES[i] + '" cannot be previewed with Quicklook!';
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
		}
	} catch(err) {
		APP.error({
			f : 'document_details.init',
			err : err
		});
	}
};

// Navigation Management
$.updateIndex = function(index) {
	try {
		$.quickView.setIndex(index);
	} catch(err) {
		//Do Nothing
	}
};
// Navigation Management
$.refresh = function(index) {
	try {
		$.container.remove($.quickView);
		$.quickView = null;
		$.populate();
	} catch(err) {
		//Do Nothing
	}
};

$.init();
