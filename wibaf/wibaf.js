/**
 * Within Browser Adaptation Framework is a library that allows developers
 * to create adaptive applications responsive with user decisions regarding
 * privacy. To use it simply create a new wibaf object and call the {init}
 * method from your Javascript code.
 *
 * For more information go to http://wibaf.win.tue.nl
 *
 * @author Alejandro Montes Garcia
 */
var wibaf = function() {

    function supportIndexedDB() {
        return window.indexedDB;
    };

    function parseAdaptationFile(srcs, callback) {
        if (srcs && srcs.length > 0) {
            var src = srcs.pop();
            $.get(src, function(fileContent) {
                var partial = fileContent.replace(/#{.*}/g, function(str) {
                    // Evaluates the Javascript code inserted in the file
                    return new Function("return " + str.substring(2, str.length - 1) + ";").call();
                }).replace(/[{};()]/g, function(str) {
                    // Makes sure that special characters are treated as tokens
                    return " " + str + " ";
                });
                // Also spaces colons when those are not inside quotes
                var quotes = false;
                for (var i = 0; i < partial.length; i++) {
                    if (partial.charAt(i) == ":" && !quotes) {
                        partial = partial.substring(0, i) + " : " + partial.substring(i + 1, partial.length);
                        i += 2;
                    } else if (partial.charAt(i) == "\"") {
                        quotes = !quotes;
                    }
                }
                adaptationParser.getInstance().parse(partial.tokenize());
                parseAdaptationFile(srcs, callback);
            });
        } else {
            if (callback) {
                callback();
            }
            $("html").css("display", "block");
        }
    };

    function parseModellingFile(srcs, callback, amSrcs) {
        if (srcs && srcs.length > 0) {
            var src = srcs.pop();
            $.get(src, function(fileContent) {
                var tokens = fileContent.replace(/[`{}:;,]/g, function(str) {
                    // Makes sure that special characters are treated as tokens
                    return " " + str + " ";
                }).tokenize();
                parseModellingFile(srcs, callback, amSrcs);
                modellingParser.getInstance().parse(tokens);
            });
        } else {
            parseAdaptationFile(amSrcs, callback);
        }
    };

    function getSources(type) {
        var files = $("link[type='text/" + type + "']");
        var srcs = [];
        if (files && files.length > 0) {
            files.each(function() {
                srcs.push(this.getAttribute("href"));
            });
        }
        return srcs;
    }

    return {
        /**
         * Creates a {database} object dependant on the browser and
         * parses the user modeling and adaptation files.
         *
         * @param {Object} callback: Code to be executed after the files
         * are parsed
         */
        init : function(callback) {
            stringManipulator.addStringMethods();
            database = databaseFactory.getInstance().createDatabase({
                useIndexedDB : supportIndexedDB(),
                callback : function() {
                    parseModellingFile(getSources("umf"), callback, getSources("amf"));
                }
            });
        }
    };
};
