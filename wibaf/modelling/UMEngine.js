/**
 * Singleton to manipulate the User Model in the database.
 *
 * @author Alejandro Montes Garcia
 */
var userModel = (function UMEngine() {

    var instance;

    function init() {
        function toServerProperties(object, callback) {
            rules.getInstance().getRule("default", function(generalRule) {
                if (generalRule) {
                    switch (generalRule.value) {
                    case "1":
                        object["server"] = false;
                        if (callback) {
                            callback(object);
                        }
                        break;
                    case "2":
                        var ruleSet = rules.getInstance().getRulesByType("toServer", function(ruleSet) {
                            var accuracy = Number.MAX_VALUE;
                            var use = Number.MAX_VALUE;
                            var server = false;
                            for (var i = 0; i < ruleSet.length; i++) {
                                var rule = new Rule(ruleSet[i].name, ruleSet[i].value, ruleSet[i].type);
                                if (rule.checkIfApplies(object)) {
                                    server = true;
                                    accuracy = rule.value.accuracy < accuracy ? rule.value.accuracy : accuracy;
                                    use = rule.value.use < use ? rule.value.use : use;
                                }
                            }
                            if (callback) {
                                object["server"] = {
                                    send : server,
                                    accuracy : accuracy,
                                    use : use
                                };
                                callback(object);
                            }
                        });
                        break;
                    case "3":
                        object["server"] = {
                            send : true,
                            accuracy : 100,
                            use : 4
                        };
                        if (callback) {
                            callback(object);
                        }
                        break;
                    }
                } else {
                    object["server"] = false;
                    if (callback) {
                        callback(object);
                    }
                }
            });
        }

        function showError(varName, callback) {
            console.error("Error " + varName + " not found");
            if (callback) {
                callback();
            }
        }

        function init(name, value, type, url, feedback, domain, callback) {
            name = name.replace(/\s+/g, "-").replace(/[()]/g, "").trim().toLowerCase();
            database.get(name, "user_model", function(stored) {
                if (!stored || stored === null) {
                    var object = {
                        name : name,
                        value : value,
                        url : url,
                        feedback : feedback,
                        domain : domain,
                        type : type
                    };
                    toServerProperties(object, function(object) {
                        database.add(object, "user_model", callback);
                    });
                }
            });
        }

        function inc(UMvar, callback) {
            database.get(UMvar, "user_model", function(item) {
                if (item) {
                    database.update(UMvar, "value", item.value + 1, "user_model", callback);
                } else {
                    showError(UMvar, callback);
                }
            });
        }

        function dec(UMvar, callback) {
            database.get(UMvar, "user_model", function(item) {
                if (item) {
                    database.update(UMvar, "value", item.value - 1, "user_model", callback);
                } else {
                    showError(UMvar, callback);
                }
            });
        }

        function update(UMvar, newVal, callback) {
            database.get(UMvar, "user_model", function(item) {
                if (item) {
                    database.update(UMvar, "value", newVal, "user_model", callback);
                } else {
                    showError(UMvar, callback);
                }
            });
        }

        function addObs(UMvar, value, callback) {
            database.get(UMvar, function(item) {
                if (item) {
                    database.update(UMvar, "value", (item.value * item.times_updated + value) / (item.times_updated + 1), "user_model", callback);
                } else {
                    showError(UMvar, callback);
                }
            });
        }

        function get(name, callback, opt) {
            database.get(name, "user_model", callback, opt);
        }

        function getAll(callback) {
            database.getAll("user_model", callback);
        }

        function remove(itemName, callback) {
            database.remove(itemName, "user_model", callback);
        }

        function removeAll(callback) {
            database.removeAll("user_model", callback);
        }

        function updateServerValues(callback) {
            getAll(function(vars) {
                var total = vars.length;
                var done = 0;
                function checker() {
                    if (callback && ++done === total) {
                        callback();
                    }
                }

                for (var i = 0; i < vars.length; i++) {
                    var umvar = vars[i];
                    toServerProperties(umvar, function(object) {
                        database.update(object.name, "server", object.server, "user_model", checker);
                    });
                }
            });
        }

        return {
            inc : inc,
            dec : dec,
            update : update,
            add_obs : addObs,
            get : get,
            getAll : getAll,
            remove : remove,
            removeAll : removeAll,
            init : init,
            updateServerValues : updateServerValues
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
