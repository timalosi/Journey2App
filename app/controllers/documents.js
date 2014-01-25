/**
 * Controller for the Facebook post list screen
 *
 * @class Controllers.facebook
 * @uses Models.facebook
 * @uses core
 * @uses utilities
 */
var APP = require("core");
var FileManager = require("FileManager");

var CONFIG = arguments[0];
var SELECTED;

var offset = 0;
var refreshLoading = false;
var refreshEngaged = false;

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "documents.init | " + JSON.stringify(CONFIG));

	$.populate();

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

	if (CONFIG.isChild === true) {
		$.NavigationBar.showBack(function(_event) {
			APP.removeChild();
		});
	}

	if (APP.Settings.useSlideMenu) {
		$.NavigationBar.showMenu(function(_event) {
			APP.toggleMenu();
		});
	} else {
		$.NavigationBar.showSettings(function(_event) {
			APP.openSettings();
		});
	}

	//Set App Wide Listeners
	Ti.App.addEventListener("document_change", $.populate);
};


function doTableviewClick(e) {
	APP.log("debug", "documents.doTableviewClick.e | " + JSON.stringify(e));

	var path = e.rowData.path;
	APP.log("debug", "documents.doTableviewClick.path: " + path);
	var z = Ti.UI.iOS.createDocumentViewer({
		url : path
	});
	z.show();
};

function doTableviewDelete(e) {
	APP.log("debug", "documents.doTableviewDelete.e | " + JSON.stringify(e));
	var path = e.rowData.path;
	var fm = new FileManager();
	fm.deleteFile(path);
};

$.populate = function() {
	//return;
	//get a copy of the FileManager utility
	var fm = new FileManager();
	var results = fm.ls(Alloy.Globals.directoryPath);
	alert("Results:" + JSON.stringify(results));
	var docs = results.files;

	APP.log("debug", "documents.populate | " + JSON.stringify(docs));
	var rows = [];
	for (var i in docs) {
		APP.log("debug", "documents.populate.document | " + JSON.stringify(docs[i]));
		if (docs[i].isFile === true && docs[i].extension === "pdf") {
			var row = Alloy.createController("documents_row", {
				path : docs[i].nativePath,
				heading : docs[i].name,
				subHeading : new Date(docs[i].modified).toLocaleString(),
				icon : "/icons/pdf.png",
			}).getView();
			rows.push(row);
		}
	}
	$.container.setData(rows);
};

/**
 * Handles the pull-to-refresh event
 * @param {Object} _event The event
 */
function ptrRelease(_event) {
	$.retrieveData(true, function() {
		_event.hide();
	});
}

// Kick off the init
$.init();

