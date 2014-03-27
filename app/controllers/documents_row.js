/**
 * Controller for the documents table row
 * 
 * @class Controllers.documents.row
 * 
 * CONFIG.path - native file path
 * CONFIG.index - index of the row reference to original array
 * CONFIG.heading - file name
 * CONFIG.subHeading - modification date
 * CONFIG.icon - icon file to display
 */

var CONFIG = arguments[0] || {};

$.Wrapper.path = CONFIG.path || 0;
$.Wrapper.index = CONFIG.index || 0;
$.heading.text = CONFIG.heading || "";
$.subHeading.text = CONFIG.subHeading || "";
$.icon.image = CONFIG.icon || "";
