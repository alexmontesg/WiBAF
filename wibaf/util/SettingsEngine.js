/**
 * Singleton to manipulate settings in the database.
 * 
 * @author Alejandro Montes Garcia
 */
var settings = (function SettingsEngine() {
	
	var instance;
	
	function init() {
		function add(name, value, callback) {
			database.add({
				name : name,
				value : value
			}, "settings", callback);
		}
		
		function remove(name, callback) {
			database.remove(name, "settings", callback);
		}
		
		function get(name, callback) {
			database.get(name, "settings", callback);
		}
		
		function getAll(callback) {
			database.getAll("settings", callback);
		}
		
		return {
			add : add,
			remove : remove,
			get : get,
			getAll : getAll,
		};
	}
	
	return {
		getInstance : function() {
			if (!instance) {
				instance = init();
			}
			return instance;
		}
	};

})();
