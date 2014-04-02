/**
 * Controller for listing files in the Alloy.Globals.directoryPath variable
 *
 * @class Controllers.documents
 * @uses core
 * @uses FileManager
 *
 * CONFIG.isChild - From APP.addChild
 */
var APP = require("core");
var FileManager = require("FileManager");

var CONFIG = arguments[0];
var SELECTED = 0;

/**
 * Initializes the controller
 */
$.init = function() {
	try {
		APP.log("debug", "documents.init | ");

		$.populate();

		if (APP.Device.isTablet) {
			APP.addChild("document_detail", {
				index : SELECTED
			});
		}

		$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

		if (CONFIG.isChild === true) {
			$.NavigationBar.showBack(function(_event) {
				APP.removeChild();
			});
		} else if (APP.Settings.useSlideMenu) {
			$.NavigationBar.showMenu(function(_event) {
				APP.toggleMenu();
			});
		} else {
			$.NavigationBar.showSettings(function(_event) {
				APP.openSettings();
			});
		}

		//Set App Wide Listeners
		Ti.App.addEventListener("document_change", $.refresh);
		Ti.App.addEventListener("APP.screen_change", $.refresh);
	} catch(err) {
		APP.error({
			f : 'documents.init',
			err : err
		});
	}
};

function doTableviewClick(e) {
	try {
		APP.log("debug", "documents.doTableviewClick.e | " + JSON.stringify(e));

		var path = e.row.path;
		var index = e.row.index;

		if (APP.Device.isTablet) {
			SELECTED = index;

			APP.addChild("document_detail", {
				index : index
			});
		} else {
			var z = Ti.UI.iOS.createDocumentViewer({
				url : path
			});
			z.show();
		}
	} catch(err) {
		APP.error({
			f : 'documents.doTableviewClick',
			err : err
		});
	}
};

function doTableviewDelete(e) {
	try {
		APP.log("debug", "documents.doTableviewDelete.e | " + JSON.stringify(e));
		var path = e.rowData.path;
		var fm = new FileManager();
		fm.deleteFile(path);
	} catch(err) {
		APP.error({
			f : 'documents.doTableviewDelete',
			err : err
		});
	}
};

$.populate = function() {
	try {
		//get a copy of the FileManager utility
		var fm = new FileManager();
		var results = fm.ls(Alloy.Globals.directoryPath);
		var docs = results.files;

		APP.log("debug", "documents.populate | " + JSON.stringify(docs));
		var rows = [];
		if (docs.length > 0) {
			for (var i in docs) {
				APP.log("debug", "documents.populate.document | " + JSON.stringify(docs[i]));
				if (docs[i].isFile === true && docs[i].extension === "pdf") {
					var row = Alloy.createController("documents_row", {
						path : docs[i].nativePath,
						heading : docs[i].name,
						subHeading : new Date(docs[i].modified).toLocaleString(),
						icon : "/icons/pdf.png",
						index : i
					}).getView();
					rows.push(row);
				}
			}
		} 
		$.container.setData(rows);

	} catch(err) {
		APP.error({
			f : 'documents.populate',
			err : err
		});
	}
};

$.refresh = function(e) {
	try {
		APP.log("debug", "documents.refresh.e | " + JSON.stringify(e));
		$.populate();
	} catch(err) {
		APP.error({
			f : 'documents.populate',
			err : err
		});
	}
};

// Kick off the init
$.init();

