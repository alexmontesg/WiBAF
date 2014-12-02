/**
 * Singleton to manipulate rules in the database.
 * 
 * @author Alejandro Montes Garcia
 */
var rules = (function RulesManager() {
	
	var instance;
	
	function init() {
	    
	    function addRule(rule) {
	        
	    }
		
		database.get("privacyRules", function(value) {
		    if(!value) {
		        database.add({
		            name : "privacyRules",
		            value : []
		        }, "settings");
		        addRule(new Rule("default", 1));
		    }
		});
		
		return {
			addRule : addRule,
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
