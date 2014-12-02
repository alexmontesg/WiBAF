/**
 * Singleton to manipulate rules in the database.
 * 
 * @author Alejandro Montes Garcia
 */
var rules = (function RulesManager() {
	
	var instance;
	
	function init() {
	    
	    function addRule(rule) {
	        database.get("privacyRules", function(rules) {
                if(!rules) {
                    database.add({
                        name : "privacyRules",
                        value : [rule]
                    }, "settings");
                } else {
                    var ruleArr = rules.value;
                    ruleArr.push(value);
                    database.update("privacyRules", "value", ruleArr, "settings");
                }
            });
	    }
		
		addRule(new Rule("default", 1));
		
		return {
			addRule : addRule
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
