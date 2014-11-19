/**
 * Singleton to create or get an instance of the database to use
 * 
 * @author Alejandro Montes Garcia
 */
var databaseFactory = (function DatabaseFactory() {
	var instance;
	
	function init(){
		return {
		    /**
		     * Creates or gets the intance of the database to be used
             * @param {Object} options Object containing the following:
             * - options.callback: Code to be executed after the creation of the database
             * - options.useIndexedDB: Indicates whether the IndexedDB should be used or not
		     */
			createDatabase: function(options) {
				return options.useIndexedDB ? IndexedDBAPI().getInstance(options.callback) : LocalStorageAPI().getInstance(options.callback);
			}
		};
	}
	
	return {
		getInstance: function() {
			if(!instance) {
				instance = init();
			}
			return instance;
		}
	};
})();