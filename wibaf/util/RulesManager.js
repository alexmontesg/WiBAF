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
                    var ruleArr = rules.value;
                    var index = -1;
                    for (var i = 0; i < ruleArr.length; i++) {
                        if (ruleArr[i].name === name) {
                            index = i;
                            break;
                        }
                    }
                    if (index > -1) {
                        ruleArr.splice(index, 1);
                    }
                    database.update("privacyRules", "value", ruleArr, "settings", callback);
                } else if (callback) {
                    callback();
                }
            });
        }

        function getRule(name, callback) {
            database.get("privacyRules", function(rules) {
                var rule;
                if (rules) {
                    var ruleArr = rules.value;
                    for (var i = 0; i < ruleArr.length; i++) {
                        if (ruleArr[i].name === name) {
                            rule = ruleArr[i];
                            break;
                        }
                    }
                }
                if (callback) {
                    callback(rule);
                }
            });
        }

        function updateRule(name, newValue, callback) {
            database.get("privacyRules", function(rules) {
                if (rules) {
                    var ruleArr = rules.value;
                    var index = -1;
                    for (var i = 0; i < ruleArr.length; i++) {
                        if (ruleArr[i].name === name) {
                            index = i;
                            break;
                        }
                    }
                    if (index > -1) {
                        ruleArr[index].value = newValue;
                    }
                    database.update("privacyRules", "value", ruleArr, "settings", callback);
                } else if (callback) {
                    callback();
                }
            });
        }

        return {
            addRule : addRule,
            deleteRule : deleteRule,
            getRule : getRule,
            updateRule : updateRule
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
