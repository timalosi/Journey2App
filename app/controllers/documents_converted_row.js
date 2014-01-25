/**
 * Controller for the Facebook post table row
 * 
 * @class Controllers.facebook.row
 * @uses core
 */
var APP = require("core");

var CONFIG = arguments[0] || {};

function doOriginalClick(e){
	APP.log("debug", "documents_converted_row.doOriginalClick.e | " + JSON.stringify(e));
	e.cancelBubble = true;
	
	var item_id = e.rowData.id;
	APP.log("debug", "documents.doTableviewClick.item_id | " + item_id);
	/* Tableview */
	var documentCollection = Alloy.Collections.document;
	var doc = documentCollection.get(item_id).toJSON();
	//Display the Document Viewer
	var path = doc.path;
	var z = Ti.UI.iOS.createDocumentViewer({
		url : path
	});
	z.show();
};

$.Wrapper.id = CONFIG.id || 0;
$.Wrapper.row_type = "pdf";
$.heading.text = CONFIG.heading || "";
$.subHeading.text = CONFIG.subHeading || "";
$.icon.image = CONFIG.icon || "";
$.originalicon.image = CONFIG.originalicon || "";


