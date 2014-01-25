/*
 * Modifed:
 * 02 JAN 14	Added Logfile functionality
 *
 *
 * Notes:
 * Ti.FileSystem.applicationDataDirectory = file:///.../Documents/
 */

var logFileName = undefined;

/**
 * @description	FileManager CommonJS Module
 * @version 1.1
 */
function FileManager() {
};

module.exports = FileManager;

/**
 * @description	Create a new text file from a string
 * @param {String} _text Text to write to file
 * @param {Object} _options _options.filename; _options.directory
 * @return {Object} 	The file created
 */
FileManager.prototype.createTextFileFromText = function(_text, _options) {
	try {
		if (_options !== undefined) {
			var filename = (_options.filename !== undefined) ? _options.filename : 'text-' + new Date().getTime() + '.txt';
			var directory = (_options.directory !== undefined) ? _options.directory : Titanium.Filesystem.applicationDataDirectory;
		} else {
			var filename = 'text-' + new Date().getTime() + '.txt';
			var directory = Titanium.Filesystem.applicationDataDirectory;
		}
		var textfile = Titanium.Filesystem.getFile(directory, filename);
		textfile.write(_text);
		return textfile;
	} catch(err) {
		var msg = 'FileManager.createTextFileFromText.error:' + err;
		throw msg;
	}

};

FileManager.prototype.createFileFromBlob = function(_blob, _options) {
	try {
		if (_options !== undefined) {
			var filename = (_options.filename !== undefined) ? _options.filename : 'data-' + new Date().getTime() + '.blob';
			var directory = (_options.directory !== undefined) ? _options.directory : Titanium.Filesystem.applicationDataDirectory;
		} else {
			var filename = 'data-' + new Date().getTime() + '.blob';
			var directory = Titanium.Filesystem.applicationDataDirectory;
		}
		var datafile = Titanium.Filesystem.getFile(directory, filename);
		datafile.write(_blob);
		return datafile;
	} catch(err) {
		var msg = 'FileManager.createFileFromBlob.error:' + err;
		throw msg;
	}

};

FileManager.prototype.deleteFile = function(_path, _options) {
	try {
		if (_options !== undefined) {
			var directory = (_options.directory !== undefined) ? _options.directory : Titanium.Filesystem.applicationDataDirectory;
		}

		var file = Ti.Filesystem.getFile(_path);
		if (file.exists()) {
			file.deleteFile();
		}

	} catch(err) {
		var msg = 'FileManager.deleteFile.error:' + err;
		throw msg;
	}

};
FileManager.prototype.initializeLogFile = function(_filename) {
	try {
		var logfile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, _filename);
		logFileName = _filename;
		if (logfile.exists()) {
			return true;
		} else {
			return logfile.createFile();
		}
	} catch(err) {
		var msg = 'FileManager.initializeLogFile.error:' + err;
		throw msg;
	}

};
FileManager.prototype.resetLogFile = function(_filename) {
	try {
		var logfile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, _filename);
		if (logfile.exists()) {
			logfile.deleteFile();
		}
		return logfile.createFile();
	} catch(err) {
		var msg = 'FileManager.deleteFile.error:' + err;
		throw msg;
	}

};
FileManager.prototype.logFileEntry = function(_filename, _message) {
	try {
		var logfile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, _filename);
		if (!logfile.exists()) {
			this.initializeLogFile(_filename);
		}
		var now = new Date().toISOString();
		var result = logfile.append(now + '\t' + _message + '\n');
		logfile = null;
		return result;
	} catch(err) {
		var msg = 'FileManager.logFileEntry.error:' + err;
		throw msg;
	}

};
/**
 * Iterate through a directory
 * @param {string} _directory Path of the directory to iterate
 */
FileManager.prototype.ls = function(_directory) {
	try {
		if (_directory !== undefined) {
			var directory = Titanium.Filesystem.getFile(_directory);
		} else {
			var directory = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory);
		}
		var results = {};
		if (directory.exists() && directory.isDirectory()) {
			results.directory = directory.name;
			results.nativePath = directory.nativePath;
			results.files = [];
			var listings = directory.getDirectoryListing();
			Ti.API.info(listings);
			if (listings !== null) {
				for (var i in listings) {
					var file = Ti.Filesystem.getFile(results.nativePath + listings[i]);
					if (file.exists()) {
						results.files.push({
							name : listings[i],
							nativePath : file.nativePath,
							isDirectory : file.isDirectory(),
							isFile : file.isFile(),
							hidden : file.hidden,
							extension : file.extension(),
							created : file.createTimestamp(),
							modified : file.modificationTimestamp()
						});
					} else {
						Ti.API.info("File Did Not Exist:" + listings[i]);
					}
				}
			}
		}
		return results;

	} catch(err) {
		var msg = 'FileManager.ls.error:' + err;
		throw msg;
	}
};
/**
 * Creates a Directory
 * @param {Object} _directory The name of the directory to create
 * @param {Object} _baseDirectory A directory to create the new directory in
 */
FileManager.prototype.createDirectory = function(_directory, _baseDirectory) {
	try {
		if (_directory === undefined) {
			throw "FileManager.createDirectory.Error: Missing Directory Name";
		}
		if (_baseDirectory === undefined) {
			var directory = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, _directory);
		} else {
			var directory = Titanium.Filesystem.getFile(_baseDirectory, _directory);
		}
		if (directory.exists()) {
			if (directory.isFile()) {
				throw "FileManager.createDirectory.Error: Requested name exists and is a file";
			} else {
				return directory;
			}
		} else {
			directory.createDirectory();
			return directory;
		}
	} catch(err) {
		var msg = 'FileManager.createDirectory.error:' + err;
		throw msg;
	}
};
