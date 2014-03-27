/**
 * Controller for the web view screen
 *
 * @class Controllers.web
 * @uses core
 * @uses functions
 * @uses com.snackableapps.extwebview
 *
 * CONFIG.url - remote URL to load
 * CONFIG.file - local File to load
 * CONFIG.html - HTML String to load
 */
var APP = require("core");
var FX = require("functions");

var CONFIG = arguments[0] || {};
var modal = CONFIG.modal || false;

var currentUrl = "";

//TODO: Need a Title
//TODO: Add Action Button to navigation
//TODO: Autoclose the window on success?

/**
 * Initializes the controller
 */
$.init = function() {
	try {
		APP.log("debug", "web.init | " + JSON.stringify(CONFIG));

		//create the extended functionality web view
		var SnackWebView = require("com.snackableapps.extwebview");
		$.webview = SnackWebView.createWebView({
			url : "",
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
				APP.removeChild(modal);
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

		$.NavigationBar.showAction(function(e) {
			var dialog = Ti.UI.createOptionDialog({
				options : [L('titleConvertToPDF'), L('titleOpenInSafari'), L('cancel')],
				cancel : 2,
				selectedIndex : 2
			});

			dialog.addEventListener("click", function(_event) {
				switch(_event.index) {
					case 0:
						doConvert();
						break;
					case 1:
						Ti.Platform.openURL($.webview.url);
						break;
				}
			});

			if (APP.Device.isHandheld) {
				dialog.show();
			} else {
				dialog.show({
					view : $.NavigationBar.right
				});
			}
		});

		// Move the UI down if iOS7+
		// NOTE: This is because of problems surrounding a vertical layout on the wrapper
		//       so we have to bump down the container (47dp normally, 67dp for iOS 7+)
		if (OS_IOS && APP.Device.versionMajor >= 7) {
			$.addressbar.top = "67dp";
			$.container.top = "111dp";
		}

		// Event listeners
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
			$.address.value = _event.url;
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

		$.containerAction.addEventListener("click", doConvert);

	} catch(err) {
		APP.error({
			f : 'web.init',
			err : err
		});
	}
};

/**
 * Initializes the navigation toolbar
 */
$.initToolbar = function() {
	try {
		APP.log("debug", "web.initToolbar");

		$.toolbar.visible = true;
		$.container.bottom = "44dp";

		//TODO: Convert to % for width

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
	} catch(err) {
		APP.error({
			f : 'web.initToolbar',
			err : err
		});
	}
};

/**
 * Handle a user typing in a new address
 * @param {Object} e
 */
function doClick(e) {
	try {
		var url = $.address.value;
		if (url.indexOf("://") == -1) {
			url = "http://" + url;
		}
		$.webview.url = url;
	} catch(err) {
		APP.error({
			f : 'web.doClick',
			err : err
		});
	}
};

function doConvert(e) {
	try {
		//TODO: Do we remove this child?
		//APP.removeChild(false);

		//Create a window for options to display to the user
		var win = Alloy.createController('pdfoptions', {
			url : $.webview.url
		}).getView();

		//Listen for the Cancel button to be pressed
		win.addEventListener('cancel', function(e) {
			try {
				win.close();
				win = null;
			} catch(err) {
				APP.error({
					f : 'win.cancel',
					err : err
				});
			}
		});
		//Listen for the Save button to be pressed
		win.addEventListener('save', function(e) {
			try {
				win.close();
				win = null;
				//Create the PDF File
				FX.convertToPDF($.webview, e.filename, e.paper);
			} catch(err) {
				APP.error({
					f : 'win.save',
					err : err
				});
			}
		});

		//Open the window ... slide up from the bottom
		win.open({
			modal : true,
			modalTransitionStyle : Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
			modalStyle : Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET
		});

	} catch(err) {
		APP.error({
			f : 'web.doConvert',
			err : err
		});
	}
};

// Kick off the init
$.init();
