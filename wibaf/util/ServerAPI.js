/**
 * Singleton to deal with the server
 * 
 * @author Alejandro Montes Garcia
 */
var ServerAPI = function() {
	var instance;

	function init(endpoint, callback) {
	    
	    function getJSON(args, callback) {
	        $.ajax({
                type: "POST",
                url: endpoint,
                data: args
            }).done(function(result) {
                callback(JSON.parse(result));
            });
	    }
		
		function get(name, collection, callback, opt) {
		    getJSON({
		        method: 'getItem',
			    name: name
			}, function(result) {
			    if(callback) {
			        callback(result, opt);
			    }
            });
		};

		function add(args, collection, callback) {
		    args.method ='addItem';
			getJSON(args, function(result) {
                if(callback) {
                    callback(result);
                }
            });
		};

		function remove(name, collection, callback) {
			getJSON({
			    method: 'removeItem',
                name: name
            }, function(result) {
                if(callback) {
                    callback(result);
                }
            });
		};
		
		function update(name, field, new_value, collection, callback) {
			getJSON({
			    method: 'updateItem',
                name: name,
                valueName: field,
                newValue: new_value
            }, function(result) {
                if(callback) {
                    callback(result);
                }
            });
		};
		
		function getAll(collection, callback) {
			getJSON({
                method: 'getAll'
            }, function(result) {
                if(callback) {
                    callback(result);
                }
            });
		};
	
		function removeAll(collection, callback) {
			getJSON({
                method: 'removeAll'
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
				instance = init(endpoint);
			}
			if(callback) {
				callback();
			}
			return instance;
		}
	};
};
