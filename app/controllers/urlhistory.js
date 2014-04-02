/**
 * Controller for the URL History list screen
 *
 * @class Controllers.urlhistory
 * @uses Models.url
 * @uses core
 *
 * CONFIG.isChild - passed from APP.addChild
 */
var APP = require("core");

var CONFIG = arguments[0];
var URLS = [];
var SELECTED;

//var offset = 0;
//var refreshLoading = false;
//var refreshEngaged = false;

//TODO: Up and Down arrows crashing

/**
 * Initializes the controller
 */
$.init = function() {
	try {
		APP.log("debug", "urlhistory.init | ");

		$.populate();

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
		
		if (APP.Device.isTablet && !SELECTED) {
			if (URLS.length > 0) {
				SELECTED = URLS[0].alloy_id;

				APP.addChild("extweb", {
					id : URLS[0].alloy_id,
					url : URLS[0].url,
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

		//Set App Wide Listeners
		Ti.App.addEventListener("history_change", $.refresh);
	} catch(err) {
		APP.error({
			f : 'urlhistory.init',
			err : err
		});
	}
};

function doTableviewClick(e) {
	try {
		APP.log("debug", "urlhistory.doTableviewClick.e | " + JSON.stringify(e));
		var item_id = e.rowData.id;
		var index = e.row.index || 0;

		var urlCollection = Alloy.Collections.url;
		var urlItem = urlCollection.get(item_id).toJSON();

		//Display the web browser
		var url = urlItem.url;

		if (APP.Device.isTablet) {
			if (e.row.id == SELECTED) {
				return;
			} else {
				SELECTED = item_id;
			}
			APP.addChild("extweb", {
				id : item_id,
				url : url,
				index : index
			});

		} else {
			APP.addChild("web", {
				url : url
			}, true, false);
		}

	} catch(err) {
		APP.error({
			f : 'urlhistory.doTableviewClick',
			err : err
		});
	}
};

function doTableviewDelete(e) {
	try {
		APP.log("debug", "urlhistory.doTableviewDelete.e | " + JSON.stringify(e));
		var item_id = e.rowData.id;
		var urlCollection = Alloy.Collections.url;
		var urlItem = urlCollection.get(item_id);
		urlItem.destroy();
		//TODO: Refresh the URL List
	} catch(err) {
		APP.error({
			f : 'urlhistory.doTableviewDelete',
			err : err
		});
	}
};

$.populate = function() {
	try {
		var urlCollection = Alloy.Collections.url;
		urlCollection.fetch();
		URLS = urlCollection.toJSON();
		
		APP.log("debug", "urlhistory.populate | " + JSON.stringify(URLS));
		var rows = [];
		if (URLS.length > 0) {
			for (var i in URLS) {
				APP.log("debug", "urls.populate.url | " + JSON.stringify(URLS[i]));
				var row = Alloy.createController("urlhistory_row", {
					id : URLS[i].alloy_id,
					index : i,
					heading : URLS[i].url,
					subHeading : URLS[i].timestamp,
					icon : "/icons/html.png"
				}).getView();
				rows.push(row);
			}
		}
		$.container.setData(rows);
		
	} catch(err) {
		APP.error({
			f : 'urlhistory.populate',
			err : err
		});
	}
};

$.refresh = function(e) {
	try {
		APP.log("debug", "urlhistory.refresh.e | " + JSON.stringify(e));
		$.populate();
	} catch(err) {
		APP.error({
			f : 'urlhistory.populate',
			err : err
		});
	}
};

// Kick off the init
$.init();

