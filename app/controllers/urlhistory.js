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

//TODO: When a duplicate URL is used ... check and don't add

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
	var index = e.row.index || 0;
	APP.log("debug", "urlhistory.doTableviewClick.item_id | " + item_id);
	/* Tableview */
	var urlCollection = Alloy.Collections.url;
	var urlItem = urlCollection.get(item_id).toJSON();
	
	alert(typeof urlItem);
	//Display the Document Viewer
	var url = urlItem.url;
	APP.addChild("web", {
		url : url
	}, false, false);

	if (APP.Device.isTablet) {
		if (e.row.id == SELECTED) {
			return;
		} else {
			SELECTED = item_id;
		}
	}

	APP.addChild("extweb", {
		id : item_id,
		url : url,
		index : index
	});
};

function doTableviewDelete(e) {
	APP.log("debug", "urlhistory.doTableviewDelete.e | " + JSON.stringify(e));
	var item_id = e.rowData.id;
	var urlCollection = Alloy.Collections.url;
	var urlItem = urlCollection.get(item_id);
	urlItem.destroy();
	//TODO: Refresh the URL List
};

$.populate = function() {
	// Trigger the synchronization
	var urlCollection = Alloy.Collections.url;
	urlCollection.fetch();
	var urls = urlCollection.toJSON();
	//alert(JSON.stringify(docs));
	APP.log("debug", "urlhistory.populate | " + JSON.stringify(urls));
	var rows = [];
	if (urls.length > 0) {
		for (var i in urls) {
			APP.log("debug", "urls.populate.url | " + JSON.stringify(urls[i]));
			var row = Alloy.createController("urlhistory_row", {
				id : urls[i].alloy_id,
				index : i,
				heading : urls[i].url,
				subHeading : urls[i].filename,
				icon : "/icons/html.png"
			}).getView();
			rows.push(row);
		}
	}
	$.container.setData(rows);
	if (APP.Device.isTablet && !SELECTED) {
		if (urls.length > 0) {
			SELECTED = urls[0].alloy_id;

			APP.addChild("extweb", {
				id : urls[0].alloy_id,
				url : urls[0].url,
				index : 0
			});
		} else {
			APP.addChild("extweb", {
				id : 0,
				url : null,
				index : 0
			});
		}
	}
};

// Kick off the init
$.init();

