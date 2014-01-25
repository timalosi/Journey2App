/**
 * Controller for the web view screen
 *
 * @class Controllers.web
 * @uses core
 */
var APP = require("core");

var CONFIG = arguments[0];

var currentUrl = "";

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "web.init | " + JSON.stringify(CONFIG));
	//create the extended functionality web view

	var SnackWebView = require("com.snackableapps.extwebview");
	$.webview = SnackWebView.createWebView({
		url : "http://www.google.com",
		top : "0dp",
	});
	$.container.add($.webview);

	if (CONFIG.url) {
		$.webview.url = CONFIG.url;
		$.webview.scalesPageToFit = true;
		$.webview.willHandleTouches = false;

		$.initToolbar();
	} else if (CONFIG.file) {
		$.webview.url = "/data/" + CONFIG.file;
	} else {
		$.webview.html = CONFIG.html;
	}

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

	// Move the UI down if iOS7+
	// NOTE: This is because of problems surrounding a vertical layout on the wrapper
	//       so we have to bump down the container (47dp normally, 67dp for iOS 7+)
	if (OS_IOS && APP.Device.versionMajor >= 7) {
		$.container.top = "67dp";
	}
};

/**
 * Initializes the navigation toolbar
 */
$.initToolbar = function() {
	APP.log("debug", "web.initToolbar");

	$.toolbar.visible = true;
	$.container.bottom = "44dp";

	var width = Math.floor(APP.Device.width / 4);

	$.containerBack.width = width + "dp";
	$.containerBack.visible = false;
	$.containerForward.width = width + "dp";
	$.containerForward.visible = false;
	$.containerRefresh.width = width + "dp";
	$.containerStop.width = width + "dp";
	$.containerStop.left = 0 - width + "dp";
	$.containerStop.visible = false;
	$.containerAction.width = width + "dp";
};

// Kick off the init
$.init();

// Event listeners
if (CONFIG.url) {
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
		var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
		$.webview.convertToPdf({
			filename : filename,
			path : file.nativePath,
			directory : Ti.Filesystem.applicationDataDirectory,
			papersize : 'letter'
		});

		//Ti.Platform.openURL(currentUrl);
	});
} else {
	Ti.App.addEventListener("APP:openTab", function(_event) {
		APP.log("debug", "web @openTab");

		APP.handleNavigation(_event.index);
	});
}

