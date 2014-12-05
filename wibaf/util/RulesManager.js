/**
 * Singleton to manipulate rules in the database.
 *
 * @author Alejandro Montes Garcia
 */
var rules = (function RulesManager() {

    var instance;

    function init() {

        function addRule(rule, callback) {
            settings.getInstance().get("privacyRules", function(rules) {
                if (!rules) {
                    settings.getInstance().add("privacyRules", [rule], callback);
                } else {
                    var ruleArr = rules.value;
                    var found = false;
                    for (var i = 0; i < ruleArr.length; i++) {
                        if (ruleArr[i].name === rule.name) {
                            found = true;
                            ruleArr[i] = rule;
                        }
                    }
                    if (!found) {
                        ruleArr.push(rule);
                    }
                    settings.getInstance().update("privacyRules", ruleArr, callback);
                }
            });
        }

        function deleteRule(name, callback) {
            settings.getInstance().get("privacyRules", function(rules) {
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
                    settings.getInstance().update("privacyRules", ruleArr, callback);
                } else if (callback) {
                    callback();
                }
            });
        }

        function getRule(name, callback) {
            settings.getInstance().get("privacyRules", function(rules) {
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
            settings.getInstance().get("privacyRules", function(rules) {
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
                    settings.getInstance().update("privacyRules", ruleArr, callback);
                } else if (callback) {
                    callback();
                }
            });
        }

        function getRulesByType(type, callback) {
            var matchingRules = [];
            settings.getInstance().get("privacyRules", function(rules) {
                if (rules) {
                    var ruleArr = rules.value;
                    for (var i = 0; i < ruleArr.length; i++) {
                        console.log(ruleArr[i].type === type);
                        if (ruleArr[i].type === type) {
                            matchingRules.push(ruleArr[i]);
                        }
                    }
                }
                if (callback) {
                    callback(matchingRules);
                }
            });
        }

        return {
            addRule : addRule,
            deleteRule : deleteRule,
            getRule : getRule,
            updateRule : updateRule,
            getRulesByType : getRulesByType
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
