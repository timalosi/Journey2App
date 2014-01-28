/**
 * Controller for the Facebook post list screen
 *
 * @class Controllers.facebook
 * @uses Models.facebook
 * @uses core
 * @uses utilities
 */
var APP = require("core");

var CONFIG = arguments[0];
var SELECTED;

var offset = 0;
var refreshLoading = false;
var refreshEngaged = false;

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "urlhistory.init | " + JSON.stringify(CONFIG));

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
	Ti.App.addEventListener("history_change", $.populate);
};

function doTableviewClick(e) {
	APP.log("debug", "urlhistory.doTableviewClick.e | " + JSON.stringify(e));
	var item_id = e.rowData.id;
	APP.log("debug", "urlhistory.doTableviewClick.item_id | " + item_id);
	/* Tableview */
	var urlCollection = Alloy.Collections.url;
	var urlItem = urlCollection.get(item_id).toJSON();
	//Display the Document Viewer
	var url = urlItem.url;
	APP.addChild("web", {
		url : url
	}, false, false);
};

function doTableviewDelete(e) {
	APP.log("debug", "urlhistory.doTableviewDelete.e | " + JSON.stringify(e));
	var item_id = e.rowData.id;
	var urlCollection = Alloy.Collections.url;
	var urlItem = urlCollection.get(item_id);
	urlItem.destroy();
};

$.populate = function() {
	// Trigger the synchronization
	var urlCollection = Alloy.Collections.url;
	urlCollection.fetch();
	var urls = urlCollection.toJSON();
	//alert(JSON.stringify(docs));
	APP.log("debug", "urlhistory.populate | " + JSON.stringify(urls));
	var rows = [];
	for (var i in urls) {
		APP.log("debug", "urls.populate.url | " + JSON.stringify(urls[i]));
		var row = Alloy.createController("urlhistory_row", {
			id : urls[i].alloy_id,
			heading : urls[i].url,
			subHeading : urls[i].filename,
			icon : "/icons/html.png"
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

