/**
 * Controller for the Facebook post list screen
 *
 * @class Controllers.facebook
 * @uses Models.facebook
 * @uses core
 * @uses utilities
 */
var APP = require("core");
var DocumentManager = require("DocumentManager");
var FileManager = require("FileManager");
//var DATE = require("alloy/moment");
//var STRING = require("alloy/string");
//var MODEL = require("models/facebook")();

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

	//MODEL.init(CONFIG.index);

	//CONFIG.feed = "http://www.facebook.com/feeds/page.php?format=json&id=" + CONFIG.userid;

	//APP.openLoading();

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
	Ti.App.addEventListener("document_change",$.populate);
};

function doClick(e) {
	//alert("row:" + JSON.stringify(e));
	//var item_id = e.row.item_id;
	var item_id = e.itemId;
	/* ListView */
	var collect = Alloy.Collections.document;
	var doc = collect.get(item_id).toJSON();
	//alert(JSON.stringify(doc));
	//var o = doc.toJSON();

	//Display the Document Viewer
	var z = Ti.UI.iOS.createDocumentViewer({
		url : doc.path
	});
	//$.document_view.add(z);
	z.show();

	//alert("list click:" + JSON.stringify(e) + "\n\n" + JSON.stringify(doc));
	//APP.addChild("document_details", {
	//	id: item_id,
	//});

	//$.trigger("file_click", {
	//	path : doc.path,
	//	filename : doc.filename
	//});
};

function doTableviewClick(e) {
	APP.log("debug", "documents.doTableviewClick.e | " + JSON.stringify(e));

	var item_id = e.rowData.id;
	var row_type = e.rowData.row_type;
	APP.log("debug", "documents.doTableviewClick.item_id | " + item_id);
	/* Tableview */
	var documentCollection = Alloy.Collections.document;
	var doc = documentCollection.get(item_id).toJSON();
	//Display the Document Viewer
	var path = (row_type == "original") ? doc.path : doc.pdf_path;
	var z = Ti.UI.iOS.createDocumentViewer({
		url : path
	});
	z.show();
};

function doTableviewDelete(e) {
	APP.log("debug", "documents.doTableviewDelete.e | " + JSON.stringify(e));
	var item_id = e.rowData.id;
	DocumentManager.deleteDocument(item_id);
};

// assign a ListItem template based on the contents of the model
function doTransform(model) {
	var o = model.toJSON();
	if (o.icon !== undefined) {
		o.template = "file_icon";
		o.icon = "/icons/" + o.icon;
	} else {
		o.template = 'file';
	}
	o.item_id = model.id;
	APP.log("debug", "documents.doTransform | " + JSON.stringify(o));
	//alert(JSON.stringify(o));
	return o;
}

$.populate = function() {
	//return;
	//get a copy of the FileManager utility
	var fm = new FileManager();
	var files = fm.ls(Ti.Filesystem.applicationDataDirectory);
	var docs = files.files;
	
	APP.log("debug", "documents.populate | " + JSON.stringify(files));
	var rows = [];
	for (var i in docs) {
		APP.log("debug", "documents.populate.document | " + JSON.stringify(docs[i]));
		var row = Alloy.createController("documents_row", {
				//id : docs[i].alloy_id,
				heading : docs[i].name,
				subHeading : "docs[i].description",
				icon : "/icons/pdf.png",
			}).getView();
		rows.push(row);
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
 
