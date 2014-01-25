/**
 * Main application controller
 *
 * **NOTE: This controller is opened first upon application start and
 * initializes the core application code (`APP.init`). This controller
 * also sets UI elements to global scope for easy access.**
 *
 * @class Controllers.index
 * @uses core
 */

// Pull in the core APP singleton
var APP = require("core");
var FX = require("functions");

// Make sure we always have a reference to global elements throughout the APP singleton
APP.MainWindow = $.MainWindow;
APP.GlobalWrapper = $.GlobalWrapper;
APP.ContentWrapper = $.ContentWrapper;
APP.Tabs = $.Tabs;
APP.SlideMenu = $.SlideMenu;

//GoPDF App Specific Pre Init Function
FX.preInit(); 
// Start the APP
APP.init();
//GoPDF App Specific Post Init Function
FX.postInit(); 