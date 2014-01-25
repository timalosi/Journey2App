/**
 * @projectDescription Analytic Engine Functions
 * @author Timothy Alosi
 */
/*
 * Revision History
 * Date			Track	Description
 * 3/16/2012		53		Corrected URL on appinfo webservice
 * 3/17/2012				Added AE.response variable
 * 4/24/2012				Created sendUpdate function and changed initiation of function to be on any update
 * 4/29/2012				Added incrementMetric function
 * 5/5/2012				Updated to support server side generated UDID
 * 1/27/2013				Added confirmed when checking response.
 * 3/8/2013		4		Added Launch Time, setMetric, incrementAdSuccess, incrementAdFail, appResumed
 * 4/2/2013		6		Added Language to module
 * 8/1/2013		12		Added Environment argument ('dev' or 'prod')
 */
/**
 * @param {String} _env Environment either 'dev' or 'prod'
 * @projectDescription Analytics Engine Common Functions
 */
function AE(_env) {
	this.ENDPOINT = 'http://put your web service in here';
	this.createTime = new Date().getTime();
	if(_env !== undefined) {
		this.env = _env.substr(0, 4);
	} else {
		this.env = 'prod';
	}
};
module.exports = AE;

/**
 * @param {string} _message	String to log to the console
 */
AE.prototype.log = function(_message) {
	//Ti.API.info(_message);
	return false;
};

/**
 *
 */
AE.prototype.prepAppLaunch = function() {
	try {
		this.createTime = new Date().getTime();
	} catch(err) {
		throw('Error in AE.prepAppLaunch:' + err);
	}

};
/**
 *
 */
AE.prototype.completeAppLaunch = function() {
	try {
		var ms = (new Date().getTime()) - this.createTime;
		Ti.App.Properties.setInt('AE.launch.time', ms);
		this.createTime = 0;
	} catch(err) {
		throw('Error in AE.completeAppLaunch:' + err);
	}

};
/**
 *
 */
AE.prototype.appLaunch = function() {
	try {
		Ti.App.Properties.setInt('AE.launch', (Ti.App.Properties.getInt('AE.launch', 0) + 1));
		if(this.createTime > 0) {
			var ms = (new Date().getTime()) - this.createTime;
			Ti.App.Properties.setInt('AE.launch.time', ms);
			this.createTime = 0;
		}
		this.sendUpdate();
	} catch(err) {
		throw('Error in AE.appLaunch:' + err);
	}

};
/**
 *
 */
AE.prototype.appResumed = function() {
	try {
		Ti.App.Properties.setInt('AE.launch', (Ti.App.Properties.getInt('AE.launch', 0) + 1));
		this.sendUpdate();
	} catch(err) {
		throw('Error in AE.appResumed:' + err);
	}

};

AE.prototype.sendUpdate = function() {
	try {
		var expiration = this.getExpiration();
		var now = new Date();

		if(now > expiration) {

			var request = {};
			request.model = Ti.Platform.model;
			request.osname = Ti.Platform.osname;
			request.ostype = Ti.Platform.ostype;
			request.osversion = Ti.Platform.version;
			request.appname = Ti.App.name;
			request.appversion = Ti.App.version;
			request.appguid = Ti.App.guid;
			request.tid = Ti.Platform.id;
			request.installid = Ti.App.installId;
			request.udid = Ti.App.Properties.getString('AE.id', '');
			request.launch = Ti.App.Properties.getInt('AE.launch', 0);
			request.launchtime = Ti.App.Properties.getInt('AE.launch.time', 0);
			request.kpi = Ti.App.Properties.getInt('AE.kpi', 0);
			request.i1 = Ti.App.Properties.getInt('AE.metric.1', 0);
			request.i2 = Ti.App.Properties.getInt('AE.metric.2', 0);
			request.i3 = Ti.App.Properties.getInt('AE.metric.3', 0);
			request.i4 = Ti.App.Properties.getInt('AE.metric.4', 0);
			request.i5 = Ti.App.Properties.getInt('AE.metric.5', 0);
			request.adsuccess = Ti.App.Properties.getInt('AE.ad.success', 0);
			request.adfailure = Ti.App.Properties.getInt('AE.ad.failure', 0);
			request.language = Ti.Locale.currentLanguage;
			request.country = Ti.Locale.currentCountry;
			request.signature = Ti.Utils.md5HexDigest(request.udid + request.appguid);
			request.env = this.env;

			var xhr = Ti.Network.createHTTPClient();
			xhr.AE = this;
			xhr.onload = function() {
				try {
					this.AE.log('Success:' + this.responseText);
					this.AE.setExpiration(86400 * 1);
					if(this.status == 200) {
						if(request.udid == '') {
							var response = JSON.parse(this.responseText);
							Ti.App.Properties.setString('AE.id', response.udid);
						}
						if(Ti.App.Properties.getBool('AE.confirmed', false) == false) {
							this.AE.confirm();
						}
					}
					this.AE.response = 'Success:' + this.responseText;
				} catch(err1) {
					throw 'AE.sendUpdate.onLoad.Error:' + err1;
				}
			};
			xhr.onerror = function() {
				this.AE.log('Error:' + this.responseText);
				this.AE.response = 'Error:' + this.responseText;
			};
			// open the client
			xhr.open('POST', this.ENDPOINT);
			//Ticket: 53
			xhr.send(request);

			this.setExpiration(86400);
		}

	} catch(err) {
		throw('Error in AE.sendUpdate: ' + err);
	}
};

AE.prototype.confirm = function() {
	try {

		var request = {};
		request.udid = Ti.App.Properties.getString('AE.id', '');
		request.appname = Ti.App.name;
		request.appguid = Ti.App.guid;
		request.confirmed = 1;
		request.signature = Ti.Utils.md5HexDigest(request.udid + request.appguid);

		var xhr = Ti.Network.createHTTPClient();
		xhr.AE = this;
		xhr.onload = function() {
			try {
				this.AE.log('Success:' + this.responseText);
				if(this.status == 200) {
					var response = JSON.parse(this.responseText);
					if(response.status == 'success') {
						//Confirm was successful
						Ti.App.Properties.setBool('AE.confirmed', true);
					}
				}
			} catch(err1) {
				throw 'AE.confirm.onLoad.Error:' + err1;
			}
		};
		xhr.onerror = function() {
			this.AE.log('Error:' + this.responseText);
			this.AE.response = 'Error:' + this.responseText;
		};
		// open the client
		xhr.open('POST', this.ENDPOINT);
		xhr.send(request);

	} catch(err) {
		throw('Error in AE.confirm: ' + err);
	}
};

AE.prototype.getExpiration = function() {
	return new Date(Ti.App.Properties.getString('AE.expiration'));
};

AE.prototype.incrementKpi = function() {
	try {
		Ti.App.Properties.setInt('AE.kpi', (Ti.App.Properties.getInt('AE.kpi', 0) + 1));
		this.sendUpdate();
	} catch(err) {
		throw('AE.incrementKpi.error:' + err);
	}

};
/**
 * @param {integer}	_index Metric number to increment.  Valid range 1 - 5
 */
AE.prototype.incrementMetric = function(_index) {
	try {
		Ti.App.Properties.setInt('AE.metric.' + _index, (Ti.App.Properties.getInt('AE.metric.' + _index, 0) + 1));
	} catch(err) {
		throw('AE.incrementMetric.error:' + err);
	}
};
/**
 * @param {integer}	_index Metric number to increment.  Valid range 1 - 5
 * @param {integer}	_value	The new value of the metric
 */
AE.prototype.setMetric = function(_index, _value) {
	try {
		Ti.App.Properties.setInt('AE.metric.' + _index, _value);
	} catch(err) {
		throw('AE.setMetric.error:' + err);
	}
};
AE.prototype.setExpiration = function(_ttl) {
	try {
		var d = new Date();
		d.setSeconds(d.getSeconds() + _ttl);
		Ti.App.Properties.setString('AE.expiration', d.toString());
	} catch(err) {
		throw('AE.incrementKpi.error:' + err);
	}

};
/**
 *
 */
AE.prototype.incrementAdSuccess = function() {
	try {
		Ti.App.Properties.setInt('AE.ad.success', (Ti.App.Properties.getInt('AE.ad.success', 0) + 1));
	} catch(err) {
		throw('AE.incrementAdSuccess.error:' + err);
	}
};
/**
 *
 */
AE.prototype.incrementAdFailure = function() {
	try {
		Ti.App.Properties.setInt('AE.ad.failure', (Ti.App.Properties.getInt('AE.ad.failure', 0) + 1));
	} catch(err) {
		throw('AE.incrementAdFailure.error:' + err);
	}
};