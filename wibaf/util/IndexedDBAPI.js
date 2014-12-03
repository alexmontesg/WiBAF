/**
 * Singleton to deal with the Indexed DB
 * 
 * @author Alejandro Montes Garcia
 */
var IndexedDBAPI = function() {
	var instance;

	function init(callback) {
		var db;
		
		function get(name, collection, callback, opt) {
			db.transaction([collection], "readonly").objectStore(collection).get(name).onsuccess = function(e) {
				callback(e.target.result, opt);
			};
		};

		function add(args, collection, callback) {
			args.times_updated = 1;
			args.last_updated = new Date().getTime();
			var trans = db.transaction([collection], "readwrite");
			trans.objectStore(collection).add(args);
			trans.oncomplete = function() {
				if (callback) {
					callback();
				}
			};
		};

		function remove(name, collection, callback) {
			var trans = db.transaction([collection], "readwrite");
			trans.objectStore(collection).delete(name);
			trans.oncomplete = function() {
				if (callback) {
					callback();
				}
			};
		};
		
		function update(name, field, new_value, collection, callback) {
			get(name, collection, function(data) {
				data[field] = new_value;
				data.times_updated++;
				data.last_updated = new Date().getTime();
				trans = db.transaction([collection], "readwrite");
				trans.objectStore(collection).put(data);
				trans.oncomplete = function() {
					if (callback) {
						callback();
					}
				};
			});
		};
		
		function getAll(collection, callback) {
			if (callback) {
				var items = [];
				db.transaction([collection], "readonly").objectStore(collection).openCursor().onsuccess = function(e) {
					var cursor = e.target.result;
					if (cursor) {
						items.push(cursor.value);
						cursor.continue();
					} else {
						callback(items);
					}
				};
			}
		};
	
		function removeAll(collection, callback) {
			db.transaction([collection], "readwrite").objectStore(collection).clear().onsuccess = function(e) {
				if (callback) {
					callback();
				}
			};
		};
		
		function onError(e) {
			console.log(e);
			// TODO Implement
		};
		
		function createDB(callback) {
			var req = indexedDB.open("WiBAF", 1);
			req.onsuccess = function(e) {
				db = req.result;
				db.onerror = onError;
				callback();
			};
			req.onupgradeneeded = function(e) {
				if (!db) {
					db = req.result;
					callback();
				}
				var collections = ["user_model", "settings"];
				for(var i = 0; i < collections.length; i++) {
					var collection = collections[i];
					if (!db.objectStoreNames.contains(collection)) {
						db.createObjectStore(collection, {
							keyPath : "name"
						});
					}
				}
			};
			req.onerror = onError;
		};

		createDB(callback);

		return {
			add : add,
			remove : remove,
			update : update,
			get : get,
			getAll : getAll,
			removeAll : removeAll
		};

	};

	return {
		getInstance : function(callback) {
			if (!instance) {
				instance = init(callback);
			} else if(callback){
				callback();
			}
			return instance;
		}
	};
};
