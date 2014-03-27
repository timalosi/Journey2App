// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

/*
 * Application Analytics
 * KPI = Each Successful PDF File Creation
 * Metric 1:
 * Metric 2:
 * Metric 3:
 * Metric 4:
 * Metric 5:
 */

/**
 * Global Functions and Variables
 */
/**
 * Create Singleton of the url Collection
 */
Alloy.Collections.url = Alloy.createCollection('url');
/**
 * Last URL passed to the App
 */
Alloy.Globals.url = '';
/**
 * Default directory to look for files
 */
Alloy.Globals.directoryPath = Ti.Filesystem.applicationDataDirectory;
