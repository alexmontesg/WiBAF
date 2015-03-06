/**
 * Singleton to deal with the server
 * 
 * @author Alejandro Montes Garcia
 */
var IndexedDBAPI = function() {
	var instance;

	function init(endpoint, callback) {
	    
	    if(!endpoint.endsWith("/")) {
	        endpoint += "/";
	    }
	    
	    var services = {
	        create: endpoint + "create",
	        read: endpoint + "read",
	        update: endpoint + "update",
	        remove: endpoint + "delete",
	        readAll: endpoint + "readAll",
	        removeAll: endpoint + "deleteAll"
	    };
	    
	    function getJSON(url, args, callback) {
	        $.getJSON(url.read, args).done(function(result) {
                callback(result);
            });
	    }
		
		function get(name, collection, callback) {
		    getJSON(services.read, {
			    name: name,
			    collection: collection
			}, function(result) {
			    if(callback) {
			        callback(result);
			    }
            });
		};

		function add(args, collection, callback) {
		    args.collection = collection;
			getJSON(services.create, args, function(result) {
                if(callback) {
                    callback(result);
                }
            });
		};

		function remove(name, collection, callback) {
			getJSON(services.remove, {
                name: name,
                collection: collection
            }, function(result) {
                if(callback) {
                    callback(result);
                }
            });
		};
		
		function update(name, field, new_value, collection, callback) {
			getJSON(services.update, {
                name: name,
                field: field,
                new_value: new_value,
                collection: collection
            }, function(result) {
                if(callback) {
                    callback(result);
                }
            });
		};
		
		function getAll(collection, callback) {
			getJSON(services.readAll, {
                collection: collection
            }, function(result) {
                if(callback) {
                    callback(result);
                }
            });
		};
	
		function removeAll(collection, callback) {
			getJSON(services.removeAll, {
                collection: collection
            }, function(result) {
                if(callback) {
                    callback(result);
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

	};

	return {
		getInstance : function(endpoint, callback) {
			if (!instance) {
				instance = init(endpoint, callback);
			} else if(callback){
				callback();
			}
			return instance;
		}
	};
};
