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

/**
 * Global Functions
 */
Alloy.Globals.resumeObserver = function(e) {
	//TODO: Move to Functions
	//TODO: Analytics
	var args = Ti.App.getArguments();
	alert("in resumed");
	try {

		if (args.url !== undefined) {
			Alloy.Globals.url = args.url;

			var components = args.url.split('/');
			var url = args.url;
			var len = components.length;
			var parameters = {};

			//TODO: refresh document rows

			if (len > 0) {

				//Get the protocol and decide what to do
				switch(components[0].toLowerCase()) {
					case ('pdf:'):
					case ('pdfhttp:'):
						url = url.replace(components[0], 'http:');
						break;
					case('pdfs:'):
					case('pdfhttps:'):
						url = url.replace(components[0], 'https:');
						break;
				}
				alert(url);
				var APP = require("core");
				APP.addChild("web", {
					url : url
				}, false, false);
				APP = null;
			} else/*len > 0*/
			{
				return false;
			}
		} else {
			return false;
		}

	} catch(err) {
		//TODO: Catch
		Ti.API.error("Alloy.Globals.onResumed.Error:" + err);
	}
};
