/**
 * Singleton to manipulate the User Model in the database.
 *
 * @author Alejandro Montes Garcia
 */
var userModel = (function UMEngine() {

    var instance;

    function init() {
        function isServerVar(object) {
            //TODO Implement
            return false;
        }

        function showError(varName, callback) {
            console.error("Error " + varName + " not found");
            if (callback) {
                callback();
            }
        }

        function init(name, value, type, url, use, domain, callback) {
            name = name.replace(/\s+/g, "-").replace(/[()]/g, "").trim().toLowerCase();
            database.get(name, "user_model", function(stored) {
                if (!stored || stored === null) {
                    var object = {
                        name : name,
                        value : value,
                        url : url,
                        use : use,
                        domain : domain,
                        type : type
                    };
                    object["server"] = isServerVar(object);
                    database.add(object, "user_model", callback);
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

        function add(object, callback) {
            object.server = isServerVar();
            database.add(object, "user_model", callback);
        }

        return {
            inc : inc,
            dec : dec,
            update : update,
            add_obs : addObs,
            get : get,
            getAll : getAll,
            add : add,
            remove : remove,
            removeAll : removeAll,
            init : init
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
