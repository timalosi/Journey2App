/**
 * Controller for the Facebook post node screen
 *
 * @class Controllers.facebook.article
 * @uses Models.facebook
 * @uses core
 * @uses social
 * @uses Widgets.com.mcongrove.detailNavigation
 */
var APP = require("core");

var CONFIG = arguments[0] || {};
var ACTION = {};
var URLS = [];
var INDEX = 0;
var currentUrl = "";

//TODO: crash when saving another file of the same name


/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "extweb.init | " + JSON.stringify(CONFIG));

	//Get the rest of the collecion
	var urlCollection = Alloy.Collections.url;
	urlCollection.fetch();
	var URLS = urlCollection.toJSON();

	//create the extended functionality web view
	var SnackWebView = require("com.snackableapps.extwebview");
	$.webview = SnackWebView.createWebView({
		url : "",
		top : "0dp",
		scalesPageToFit : true,
		willHandleTouches : false
	});
	$.container.add($.webview);
	$.initToolbar();

	// Move the UI down if iOS7+
	// NOTE: This is because of problems surrounding a vertical layout on the wrapper
	//       so we have to bump down the container (47dp normally, 67dp for iOS 7+)
	if (OS_IOS && APP.Device.versionMajor >= 7) {
		$.container.top = "67dp";
	}

	APP.log("debug", "extweb.init | " + JSON.stringify(CONFIG));

	$.handleData(CONFIG);
	
	//Add Event Listeners
	$.webview.addEventListener("load", function(_event) {
		if ($.webview.canGoBack()) {
			$.containerBack.visible = true;
		} else {
			$.containerBack.visible = false;
		}

		if ($.webview.canGoForward()) {
			$.containerForward.visible = true;
		} else {
			$.containerForward.visible = false;
		}

		$.containerStop.visible = false;
		$.containerRefresh.visible = true;
	});

	$.webview.addEventListener("beforeload", function(_event) {
		$.containerRefresh.visible = false;
		$.containerStop.visible = true;

		currentUrl = _event.url;
	});

	$.containerBack.addEventListener("click", function(_event) {
		$.webview.goBack();
	});

	$.containerForward.addEventListener("click", function(_event) {
		$.webview.goForward();
	});

	$.containerRefresh.addEventListener("click", function(_event) {
		$.webview.reload();

		$.containerRefresh.visible = false;
		$.containerStop.visible = true;
	});

	$.containerStop.addEventListener("click", function(_event) {
		$.webview.stopLoading();

		$.containerStop.visible = false;
		$.containerRefresh.visible = true;
	});

	$.containerAction.addEventListener("click", function(_event) {
		APP.log("debug", "convert to pdf");
		var url = $.webview.url;
		//Remove the query string parameter (if ther is one)
		var urlarray1 = url.split("?");
		//Check to see if there is a trailing "/"
		var i = (urlarray1[0].substr(urlarray1[0].length - 1) == "/") ? 2 : 1;
		var urlarray2 = urlarray1[0].split("/");
		var filename = Ti.Network.encodeURIComponent(urlarray2[urlarray2.length - i]);
		filename += ".pdf";
		alert("PDF will be saved to: " + filename);
		var file = Ti.Filesystem.getFile(Alloy.Globals.directoryPath, filename);
		$.webview.convertToPdf({
			filename : filename,
			path : file.nativePath,
			directory : Alloy.Globals.directoryPath,
			papersize : 'letter'
		});
		Ti.App.fireEvent("document_change", {});
		var parameters = {
			url : $.webview.url,
			filename : filename
		};
		var urlItem = Alloy.createModel('url', parameters);
		urlItem.save();
		Ti.App.fireEvent("history_change", {});
		APP.removeChild(false);
		//Ti.Platform.openURL(currentUrl);
	});
};

/**
 * Handles the data return
 * @param {Object} _data The returned data
 */
$.handleData = function(_data) {
	/*
	 * Possible CONFIG values
	 * CONFIG.url = Show the URL
	 * CONFIG.id = Display the URL from the collection
	 */
	APP.log("debug", "extweb.handleData");

	$.handleNavigation();

	if (_data.id) {
		//Get all the URLs to the array
		var urlCollection = Alloy.Collections.url;
		urlCollection.fetch();
		var urls = urlCollection.toJSON();

		URLS = [];
		if (urls.length > 0) {
			for (var i in urls) {
				URLS.push(urls[i].url);
				if (_data.id == urls[i].alloy_id) {
					INDEX = i;
				}
			}
			$.webview.url = URLS[INDEX];
		}
	} else if (_data.url) {
		URLS = [];
		INDEX = 0;
		$.webview.url = _data.url;
	}

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

	if (APP.Device.isHandheld) {
		$.NavigationBar.showBack(function(_event) {
			APP.removeAllChildren();
		});
	}

	//TODO: Can we get the action to be CONVERT?
	//$.NavigationBar.showAction(function(_event) {
	//	SOCIAL.share(ACTION.url, $.NavigationBar.right);
	//});
};

/**
 * Handles detail navigation
 */
$.handleNavigation = function() {
	
	var navigation = Alloy.createWidget("com.mcongrove.detailNavigation", null, {
		color : APP.Settings.colors.theme == "dark" ? "white" : "black",
		down : function(_event) {
			if (INDEX == URLS.length - 1) {
				//Last document
				INDEX = 0;
			} else {
				INDEX += 1;
			}
			$.webview.url = URLS[INDEX];
		},
		up : function(_event) {
			if (INDEX == 0) {
				//First document
				INDEX = URLS.length - 1;
			} else {
				INDEX -= 1;
			}
			$.webview.url = URLS[INDEX];			
		}
	}).getView();

	$.NavigationBar.addNavigation(navigation);
};

/**
 * Initializes the navigation toolbar
 */
$.initToolbar = function() {
	APP.log("debug", "extweb.initToolbar");

	$.toolbar.visible = true;
	$.container.bottom = "44dp";

	var width = Math.floor($.toolbar.width / 4);
	//width = 50;
	APP.log("debug","extweb.Toolbar Width: calculated Width: "+ $.toolbar.width+":"+width);

	//$.containerBack.width = width + "dp";
	$.containerBack.visible = false;
	//$.containerForward.width = width + "dp";
	$.containerForward.visible = false;
	//$.containerRefresh.width = width + "dp";
	//$.containerStop.width = width + "dp";
	$.containerStop.left = 0 - width + "dp";
	$.containerStop.visible = false;
	//$.containerAction.width = width + "dp";
};

// Kick off the init
$.init();
