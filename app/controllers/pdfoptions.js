/**
 * Controller for the Convert screen
 *
 * @class Controllers.convert
 * @uses core
 * @uses FileManager
 *
 * CONFIG.url - remote URL to load
 * CONFIG.file - local File to load
 * CONFIG.html - HTML String to load
 */
var APP = require("core");
var FileManager = require("FileManager");

var CONFIG = arguments[0] || {};
var modal = CONFIG.modal || false;

/**
 * Initializes the controller
 */
$.init = function() {
	try {
		APP.log("debug", "pdfoptions.init | " + JSON.stringify(CONFIG));

		$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

		//Set the default filename
		if (CONFIG.url == undefined) {
			$.options.fireEvent("cancel", {
				error : "No URL Passed"
			});
			return;
		}
		var url = CONFIG.url;
		//Remove the query string parameter (if ther is one)
		var urlarray1 = url.split("?");
		//Check to see if there is a trailing "/"
		var i = (urlarray1[0].substr(urlarray1[0].length - 1) == "/") ? 2 : 1;
		var urlarray2 = urlarray1[0].split("/");
		//extract the filename
		var filename = Ti.Network.encodeURIComponent(urlarray2[urlarray2.length - i]);
		filename += ".pdf";
		filename = filename.toLowerCase();
		$.filename.value = filename;
		
		var file = Ti.Filesystem.getFile(Alloy.Globals.directoryPath,filename);
		$.filewarning.visible = file.exists();

		//Set the paper value from the app properties
		switch (Ti.App.Properties.getString("paper","letter")) {
			case "a4":
				$.a4.hasCheck = true;
				$.letter.hasCheck = false;
				Ti.App.Properties.setString("paper", "a4");
				break;
			default:
				$.a4.hasCheck = false;
				$.letter.hasCheck = true;
				Ti.App.Properties.setString("paper", "letter");
				break;
		}
	} catch(err) {
		APP.error({
			f : 'pdfoptions.init',
			err : err
		});
	}
};

function doTableViewClick(e) {
	try {
		switch (e.row.id) {
			case "a4":
				$.a4.hasCheck = true;
				$.letter.hasCheck = false;
				Ti.App.Properties.setString("paper", "a4");
				break;
			default:
				$.a4.hasCheck = false;
				$.letter.hasCheck = true;
				Ti.App.Properties.setString("paper", "letter");
				break;
		}
	} catch(err) {
		APP.error({
			f : 'pdfoptions.doTableViewClick',
			err : err
		});
	}
};
function doSave(e) {
	try {
		//Check the filename
		var filename = $.filename.value;
		if (filename.indexOf(".pdf") == -1) {
			filename += ".pdf";
		}
		if ($.a4.hasCheck) {
			var paper = "a4";
		} else {
			var paper = "letter";
		}
		//Fire the Event
		$.options.fireEvent("save", {
			filename : filename,
			paper : paper
		});
	} catch(err) {
		APP.error({
			f : 'pdfoptions.doSave',
			err : err
		});
	}
};

function doCancel(e) {
	try {
		//Fire the Event
		$.options.fireEvent("cancel", {});
		return;
	} catch(err) {
		APP.error({
			f : 'pdfoptions.doCancel',
			err : err
		});
	}
};

function doFileCheck(e) {
	try {
		//Check to see if the file exists
		var filename = $.filename.value;
		filename = filename.toLowerCase();
		var file = Ti.Filesystem.getFile(Alloy.Globals.directoryPath,filename);
		$.filewarning.visible = file.exists();
		return;
	} catch(err) {
		APP.error({
			f : 'pdfoptions.doCancel',
			err : err
		});
	}
};

$.init();
