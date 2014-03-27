/**
 * Controller for the URL History table row
 * 
 * @class Controllers.urlhistory.row
 * @uses core
 * 
 * CONFIG.path - native file path
 * CONFIG.index - index of the row reference to original array
 * CONFIG.heading - file name
 * CONFIG.subHeading - modification date
 * CONFIG.icon - icon file to display
 */
var APP = require("core");

var CONFIG = arguments[0] || {};

$.Wrapper.id = CONFIG.id || 0;
$.Wrapper.index = CONFIG.index || 0;
$.heading.text = CONFIG.heading || "";
$.subHeading.text = CONFIG.subHeading || "";
$.icon.image = CONFIG.icon || "";
