/**
 * Controller for the Convert screen
 *
 * @class Controllers.convert
 * @uses core
 * @uses FileManager
 * @uses functions
 */
var APP = require("core");
var FileManager = require("FileManager");
var FX = require("functions");

var CONFIG = arguments[0] || {};
var modal = CONFIG.modal || false;

$.init = function() {
	APP.log("debug", "convert | " + JSON.stringify(CONFIG));

	$.heading.color = APP.Settings.colors.hsb.primary.b > 70 ? "#000" : APP.Settings.colors.primary;
	$.footer.text = String.format(L('textDocumentsCreated'), FX.getPdfsConverted());

	Ti.App.addEventListener('document_change', function(e) {
		$.footer.text = String.format(L('textDocumentsCreated'), FX.getPdfsConverted());
	});

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

	$.gotoDocs.visible = FX.filesExist();
	Ti.App.addEventListener("APP.screen_change", doShowGotoDocs);
};

function doClick(e) {
	try {
		var url = $.address.value;
		if (url.indexOf("://") == -1) {
			url = "http://" + url;
		}
		APP.addChild("web", {
			url : url,
			isChild : true
		}, true);

	} catch(err) {
		APP.error({
			f : 'convert.doClick',
			err : err
		});
	}
};

function doGotoClick(e) {

	try {
		APP.closeSettings();
		APP.handleNavigation(0);
	} catch(err) {
		APP.error({
			f : 'convert.doGotoClick',
			err : err
		});
	}
};

function doShowGotoDocs(e) {

	try {
		$.gotoDocs.visible = FX.filesExist();
	} catch(err) {
		APP.error({
			f : 'convert.doShowGotoDocs',
			err : err
		});
	}
};

$.init();
