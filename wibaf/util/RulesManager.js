/**
 * Singleton to manipulate rules in the database.
 *
 * @author Alejandro Montes Garcia
 */
var rules = (function RulesManager() {

    var instance;

    function init() {

        function addRule(rule, callback) {
            database.get("privacyRules", function(rules) {
                if (!rules) {
                    database.add({
                        name : "privacyRules",
                        value : [rule]
                    }, "settings", callback);
                } else {
                    var ruleArr = rules.value;
                    ruleArr.push(value);
                    database.update("privacyRules", "value", ruleArr, "settings", callback);
                }
            });
        }

        function deleteRule(name, callback) {
            database.get("privacyRules", function(rules) {
                if (rules) {
                    var oldArr = rules.value;
                    var newArr = [];
                    var j = 0;
                    for (var i = 0; i < oldArr.length; i++) {
                        if (oldArr[i].name !== name) {
                            newArr[j++] = oldArr[i];
                        }
                    }
                    database.update("privacyRules", "value", newArr, "settings", callback);
                }
            });
        }
        
        function getRule(name, callback) {
            database.get("privacyRules", function(rules) {
                if (rules) {
                    var oldArr = rules.value;
                    var newArr = [];
                    var j = 0;
                    for (var i = 0; i < oldArr.length; i++) {
                        if (oldArr[i].name === name) {
                            newArr[j++] = oldArr[i];
                        }
                    }
                    callback(newArr);
                } else {
                    callback([]);
                }
            });
        }

        addRule(new Rule("default", 1));

        return {
            addRule : addRule,
            deleteRule : deleteRule,
            getRule : getRule
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
