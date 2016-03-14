/**
 * Singleton to manipulate the User Model in the database.
 *
 * @author Alejandro Montes Garcia
 */
var userModel = (function UMEngine() {

    var instance;

    function init() {
        
        function distortValue(accuracy, value) {
            accuracy = accuracy / 100;
            var distorsion = Math.random() * (1 - accuracy) + accuracy;
            return distortedValue = value * distorsion;
        }
        
        function doUpdate(UMvar, callback, newValue, operation) {
            database.get(UMvar, "user_model", function(item) {
                if (item) {
                    switch (operation) {
                        case "+":
                            newValue = item.value + newValue;
                            break;
                        case "-":
                            newValue = item.value - newValue;
                            break;
                        case "avg":
                            newValue = (item.value * item.times_updated + newValue) / (item.times_updated + 1);
                    }
                    if (item.server.send) {
                        serverAPI.update(UMvar, "value", distortValue(item.server.accuracy, newValue));
                    }
                    database.update(UMvar, "value", newValue, "user_model", callback);
                } else {
                    showError(UMvar, callback);
                }
            });
            
        }
        
        function toServerProperties(object, callback) {
            rules.getInstance().getRule("default", function(generalRule) {
                if (generalRule) {
                    switch (generalRule.value.toString()) {
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
            name = name.replace(/\s+/g, "-").replace(/[^a-z0-9-]/gmi, "").trim().toLowerCase();
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
                        if(object.server.send && object.type === "numeric") {
                            serverAPI.add({
                                name : name,
                                value : distortValue(object.server.accuracy, value),
                                url : url,
                                type : type,
                                use: object.server.use
                            });
                        }
                        database.add(object, "user_model", callback);
                    });
                }
            });
        }

        function inc(UMvar, callback) {
            add(UMvar, 1, callback);
        }

        function dec(UMvar, callback) {
            sub(UMvar, 1, callback);
        }

        function update(UMvar, newVal, callback) {
            doUpdate(UMvar, callback, newVal);
        }


        function add(UMvar, val, callback) {
            doUpdate(UMvar, callback, val, "+");
        }
        
        function sub(UMvar, val, callback) {
            doUpdate(UMvar, callback, val, "-");
        }

        function addObs(UMvar, value, callback) {
            doUpdate(UMvar, callback, value, "avg");
        }

        function get(name, callback, opt) {
            database.get(name, "user_model", callback, opt);
        }
        
        function getDomain(domain, separator, callback) {
            database.getDomain(domain, separator, "user_model", callback);
        }

        function getAll(callback) {
            database.getAll("user_model", callback);
        }

        function remove(itemName, callback) {
            serverAPI.remove(itemName);
            database.remove(itemName, "user_model", callback);
        }

        function removeAll(callback) {
            serverAPI.removeAll();
            database.removeAll("user_model", callback);
        }
        
        function initUpdate(name, value, type, url, feedback, domain, callback) {
            get(name, function(item, opt) {
                if(item) {
                    update(name, value, callback);
                } else {
                    init(name, value, type, url, feedback, domain, callback);
                }
            });
        }
        
        function initIfBlank(name, value, type, url, feedback, domain, callback) {
            get(name, function(item, opt) {
                if(!item) {
                    init(name, value, type, url, feedback, domain, callback);
                }
            });
        }
        
        function setServer(UMvar, value, callback) {
            database.update(UMvar, "server", value, "user_model", callback);
            if(value) {
                database.get(UMvar, "user_model", function(item) {
                    if (item) {
                        serverAPI.add(item);
                    }
                });
            } else {
                serverAPI.remove(UMvar);
            }
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
                            serverAPI.get(object.name, null, function(json, obj) {
                                if(obj.server.send && json.result === "ERR") {
                                    serverAPI.add(obj);
                                } else if (send) {
                                    serverAPI.update(obj.name, "value", distortValue(obj.server.accuracy, obj.value));
                                } else {
                                    serverAPI.remove(obj.name);
                                }
                            }, object);
                        database.update(object.name, "server", object.server, "user_model", checker);
                    });
                }
            });
        }
        
        function setUnchanged(item) {
            database.update(item, "changed", false, "user_model");
        }

        return {
            inc : inc,
            dec : dec,
            add : add,
            sub : sub,
            update : update,
            add_obs : addObs,
            get : get,
            getAll : getAll,
            getDomain : getDomain,
            remove : remove,
            removeAll : removeAll,
            init : init,
            init_update : initUpdate,
            init_if_blank : initIfBlank,
            updateServerValues : updateServerValues,
            setServer : setServer,
            setUnchanged: setUnchanged
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
