/**
 * Controller for the Facebook post node screen
 *
 * @class Controllers.facebook.article
 * @uses Models.facebook
 * @uses core
 * @uses social
 * @uses Widgets.com.chariti.detailNavigation
 */
var APP = require("core");
var DocumentManager = require("DocumentManager");
//var DATE = require("alloy/moment");
//var STRING = require("alloy/string");
//var MODEL = require("models/facebook")();

var CONFIG = arguments[0] || {};
var ACTION = {};

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "document_details.init | " + JSON.stringify(CONFIG));

	//MODEL.init(CONFIG.index);

	$.handleData(CONFIG.id);
	$.handleNavigation();
};

/**
 * Handles the data return
 * @param {Object} _data The returned data
 */
$.handleData = function(_data) {
	APP.log("debug", "document_details.handleData");

	var collect = Alloy.Collections.document;
	var doc = collect.get(_data).toJSON();
	var metadata = JSON.parse(doc.metadata);

	$.file_icon.image = '/icons/' + doc.icon;
	$.file_name.text = doc.filename;
	$.file_type.text = doc.description;

	var colors = {
		white: {
			title: "White",
			rgb: "#FFFFFF"
		},
		pink: {
			title: "Pink",
			rgb: "#FF007F"
		},
		red: {
			title: "Red",
			rgb: "#FF0000"
		},
		orange: {
			title: "Orange",
			rgb: "#FF7F00"
		},
		brown: {
			title: "Brown",
			rgb: "#964B00"
		},
		yellow: {
			title: "Yellow",
			rgb: "#FFFF00"
		},
		gray: {
			title: "Gray",
			rgb: "#848484"
		},
		green: {
			title: "Green",
			rgb: "#00FF00"
		},
		cyan: {
			title: "Cyan",
			rgb: "#00FFFF"
		},
		blue: {
			title: "Blue",
			rgb: "#0000FF"
		},
		violet: {
			title: "Violet",
			rgb: "#9400D3"
		}
	};

	$.xlateto.init($.getView("xlate_to"));
	$.xlateto.choices = colors;
	$.xlatefrom.init($.getView("xlate_from"));
	$.xlatefrom.choices = colors;

	$.xlateto.on('change', function(event) {
		$.translate.backgroundColor = colors[event.id].rgb;
	});

};

/**
 * Handles detail navigation
 */
$.handleNavigation = function() {

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

	if(APP.Device.isHandheld) {
		$.NavigationBar.showBack(function(_event) {
			APP.removeChild();
		});
	}

	$.NavigationBar.showAction(function(_event) {
		DocumentManager.actions({
			options: ["Translate", "Delete Document"],
			mapping: ["translate", "delete"],
			destructive: 1
		}, $.NavigationBar.right, function(e) {
			switch(e.mapping[e.index]) {
				case "translate":
					DocumentManager.translateDocument(CONFIG.id);
					break;
				case "delete":
					DocumentManager.deleteDocument(CONFIG.id);
					APP.removeChild();
					break;
			}
		});
	});

};

// Kick off the init
$.init();