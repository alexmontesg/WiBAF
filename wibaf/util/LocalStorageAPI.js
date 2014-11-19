/**
 * Singleton to deal with the localstorage in the browser. It is synchronous but
 * in order to keep the same interface as the {IndexedDBAPI} the methods use
 * callbacks and do not return anything.
 * 
 * @author Alejandro Montes Garcia
 */
var LocalStorageAPI = function() {
	
	var instance;
	
	function init(callback) {
		function add(args, collection, callback) {
			args.collection = collection;
			args.times_updated = 1;
			args.last_updated = new Date().getTime();
			localStorage[args.name] = JSON.stringify(args);
			if (callback) {
				callback();
			}
		}
		
		function remove(name, collection, callback) {
			item = localStorage[name];
			if(item && JSON.parse(item).collection === collection) {
				localStorage[name] = undefined;
			}
			if (callback) {
				callback();
			}
		}
		
		function update(name, field, new_value, collection, callback) {
			var item = localStorage[name];
			if (item) {
				item = JSON.parse(item);
				if(item.collection === collection) {
					item.times_updated++;
					item[field] = new_value;
					item.last_updated = new Date().getTime();
					localStorage[name] = JSON.stringify(item);
				}
			}
			if (callback) {
				callback();
			}
		};
		
		function get(name, collection, callback, opt) {
			var item = localStorage[name];
			if (item) {
				item = JSON.parse(item);
				if(item.collection !== collection) {
					item = null;
				}
			}
			callback(item, opt);
		};
		
		function getAll(collection, callback) {
			var items = [];
			var len = localStorage.length;
			for (var i = 0; i < len; ++i) {
				var item = JSON.parse(localStorage.getItem(localStorage.key(i)));
				if(item.collection === collection) {
					items.push(item);
				}
			}
			callback(items);
		};
		
		function removeAll(collection, callback) {
			getAll(collection, function(items) {
				for(var i = 0; i < items.length; i++){
					remove(items[i].name, collection);
				}
				if(callback) {
					callback();
				}
			});
		};
		return {
			add : add,
			remove : remove,
			update : update,
			get : get,
			getAll : getAll,
			removeAll : removeAll
		};
	}

	return {
		getInstance : function(callback) {
			if (!instance) {
				instance = init();
			}
			if(callback) {
				callback();
			}
			return instance;
		}
	};
}; 