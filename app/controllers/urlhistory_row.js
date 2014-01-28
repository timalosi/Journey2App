/**
 * Controller for the Facebook post table row
 * 
 * @class Controllers.facebook.row
 * @uses core
 */
var APP = require("core");

var CONFIG = arguments[0] || {};

$.Wrapper.id = CONFIG.id || 0;
$.Wrapper.row_type = "original";
$.heading.text = CONFIG.heading || "";
$.subHeading.text = CONFIG.subHeading || "";
$.icon.image = CONFIG.icon || "";
