/**
 * Controller for the Extended Web Browser
 *
 * @class Controllers.extweb
 * @uses core
 * @uses functions
 * @uses com.snackableapps.extwebview
 * @uses Widgets.com.mcongrove.detailNavigation
 *
 * CONFIG.url - the URL to open in the browser
 */
var APP = require("core");
var FX = require("functions");

var CONFIG = arguments[0] || {};
var ACTION = {};
var URLS = [];
var INDEX = 0;
var currentUrl = "";

//TODO: Up and down arrows throw an error
//TODO: New Action Icon
//TODO: PDF Icon

/**
 * Initializes the controller
 */
$.init = function() {
	try {
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

		$.handleNavigation();

		$.handleData(CONFIG);

		$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

		if (APP.Device.isHandheld) {
			$.NavigationBar.showBack(function(_event) {
				APP.removeAllChildren();
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

		$.containerAction.addEventListener("click", doConvert);
		
		//Set App Wide Listeners
		Ti.App.addEventListener("history_change", $.refresh);
	} catch(err) {
		APP.error({
			f : 'extweb.init',
			err : err
		});
	}
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
	try {
		APP.log("debug", "extweb.handleData");

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

	} catch(err) {
		APP.error({
			f : 'extweb.handleData',
			err : err
		});
	}

};

/**
 * Handles detail navigation
 */
$.handleNavigation = function() {

	try {
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
	} catch(err) {
		APP.error({
			f : 'extweb.handleNavigation',
			err : err
		});
	}
};

/**
 * Initializes the navigation toolbar
 */
$.initToolbar = function() {
	try {
		APP.log("debug", "extweb.initToolbar");

		$.toolbar.visible = true;
		$.container.bottom = "44dp";

		var width = Math.floor($.toolbar.width / 4);
		//width = 50;
		APP.log("debug", "extweb.Toolbar Width: calculated Width: " + $.toolbar.width + ":" + width);

		//$.containerBack.width = width + "dp";
		$.containerBack.visible = false;
		//$.containerForward.width = width + "dp";
		$.containerForward.visible = false;
		//$.containerRefresh.width = width + "dp";
		//$.containerStop.width = width + "dp";
		$.containerStop.left = 0 - width + "dp";
		$.containerStop.visible = false;
		//$.containerAction.width = width + "dp";
	} catch(err) {
		APP.error({
			f : 'extweb.initToolbar',
			err : err
		});
	}
};

function doConvert(e) {
	try {
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
			f : 'extweb.doConvert',
			err : err
		});
	}
};

// Navigation Management
$.refresh = function(index) {
	try {
		$.handleData(CONFIG);
	} catch(err) {
		//Do Nothing
	}
};

// Kick off the init
$.init();
