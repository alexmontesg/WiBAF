/**
 * Parser for the Adaptation Modelling Files
 * 
 * @author Alejandro Montes Garcia
 */
var adaptationParser = (function AdaptationParser() {

    var instance;

    function init() {

        var adaptation = new AdaptationEngine();

        function addToQueue(token, args) {
            args.queue.push(token);
            return 1;
        }

        function addToExpr(token, args) {
            args.expr.push(token);
            return 1;
        }
        
        function evalUsrExpr(token, args) {
            var subTokens = getContent(args.tokens);
            var consumed = subTokens.length;
            // We divide the expression to be checked in subexpressions sepparated by or
            var orExpressions = args.expr.join(" ").trim().split(" or ");
            args.expr = [];
            var oneTrue = false;
            var orExpressionsChecked = 0;
            var totalOrExpressions = orExpressions.length;
            function orChecker() {
                // At least one of the expressions in a or is true in order for the subtokens to be parsed
                if(++orExpressionsChecked === totalOrExpressions && oneTrue) {
                    adaptationParser.getInstance().parse(subTokens);
                }
            }
            for(var i = 0; i < totalOrExpressions; i++) {
                // Each 'or' subexpression is divided in 'and' subexpressions
                var features = getFeatures(orExpressions[i]);
                var trueExpressions = 0;
                var totalAndExpressions = Object.keys(features).length;
                var andExpressionsChecked = 0;
                for (var feature in features) {
                    var umFeature = feature;
                    if (feature.endsWith("-lt") || feature.endsWith("-gt")) {       // Need to remove last 3 characters
                        umFeature = feature.substring(0, feature.length - 3);
                    }
                    userModel.getInstance().get(umFeature, function(val, args) {
                        var feature = args["feature"];
                        var featureValue = args["featureValue"];
                        var value = 0;
                        if (val) {
                            value = parseInt(val.value);
                        }
                        if ((feature.endsWith("-gt") && value > featureValue) ||
                                (feature.endsWith("-lt") && value < featureValue) ||
                                (value == featureValue && !feature.endsWith("-lt") && !feature.endsWith("-gt"))) {      // The expression is true
                            // All the expressions from the and are true therefore the or containing it can be executed
                            if (++trueExpressions === totalAndExpressions) {
                                oneTrue = true;
                            }
                        }
                        // All the expressions from the and are have been checked so now we have to increment the or parts checked
                        if (++andExpressionsChecked === args["totalAnd"]) {
                            orChecker();
                            andExpressionsChecked = 0;
                        }
                    }, {feature : feature, featureValue : parseInt(features[feature]), totalAnd : totalAndExpressions});
                }
            }
            return consumed;
        }
        
        function getContent(tokens) {
            var curliesOpened = 0;
            for (var i = 1; i < tokens.length; i++) {
                if (tokens[i] == "{") {
                    curliesOpened++;
                } else if (tokens[i] == "}") {
                    if (curliesOpened == 0) {
                        break;
                    }
                    curliesOpened--;
                }
            }
            return tokens.slice(1, i);
        }

        function evalCtxExpr(token, args) {
            var subTokens = getContent(args.tokens);
            var consumed = subTokens.length;
            // We divide the expression to be checked in subexpressions sepparated by or
            var orExpressions = args.expr.join(" ").trim().split(" or ");
            args.expr = [];
            var oneTrue = false;
            var orExpressionsChecked = 0;
            var totalOrExpressions = orExpressions.length;
            function orChecker() {
                // At least one of the expressions in a or is true in order for the subtokens to be parsed
                if(++orExpressionsChecked === totalOrExpressions && oneTrue) {
                    var lat = ctx.execute("getLat");
                    var lon = ctx.execute("getLon");
                    var r = ctx.execute("getR");
                    if (lat === -1 || lon === -1) {
                        adaptationParser.getInstance().parse(subTokens);
                    } else {         // If adaptation depends on position
                        navigator.geolocation.getCurrentPosition(function(pos) {
                            // Calculate distance with Haversine formula
                            var R = 6371;
                            var lat2 = pos.coords.latitude;
                            var dLat = deg2rad(lat2 - lat);
                            var dLon = deg2rad(pos.coords.longitude - lon);
                            var a = Math.pow(Math.sin(dLat / 2), 2) + 
                                    Math.cos(deg2rad(lat)) * Math.cos(deg2rad(lat2)) * Math.pow(Math.sin(dLon / 2), 2);
                            var d = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                            if (d <= r) {
                                adaptationParser.getInstance().parse(subTokens);
                            }
                        }, function(error) {
                            console.error("Error retrieving position: (" + error.code + ") " + error.message);
                        }, {
                            enableHighAccuracy : true
                        });
                    }
                }
            }
            var ctx = ContextHelper();
            for(var i = 0; i < totalOrExpressions; i++) {
                // Each 'or' subexpression is divided in 'and' subexpressions
                var features = getFeatures(orExpressions[i]);
                var trueExpressions = 0;
                var totalAndExpressions = Object.keys(features).length;
                var andExpressionsChecked = 0;
                for (var feature in features) {
                    if (ctx.execute(feature.replace("-", "_"), features[feature])) {
                        if (++trueExpressions === totalAndExpressions) {
                            // All the expressions from the and are true therefore the or containing it can be executed
                            oneTrue = true;
                        }
                    }
                    if (++andExpressionsChecked === totalAndExpressions) {
                        // All the expressions from the and are have been checked so now we have to increment the or parts checked
                        orChecker();
                        andExpressionsChecked = 0;
                    }
                }
            }
            return consumed;
        }

        function applyInstruction(token, args) {

            function isWibafRule(rule) {
                var ruleArr = rule.toLowerCase().split(":");
                if (ruleArr.length > 1) {
                    return adaptation.hasRule(ruleArr[0].trim().toLowerCase().replace("-", "_"));
                } else {
                    console.warn("Invalid rule detected: " + rule);
                    return false;
                }
            }

            function applyWibafRule(selector, rule) {
                var n = rule.indexOf(":");
                if (n < rule.length && n > 0) {
                    var ruleName = rule.substring(0, n);
                    var arg = rule.substring(n + 1, rule.length).trim().replace(" : ", ":");
                    adaptation.execute(ruleName.trim().toLowerCase().replace("-", "_"), selector, arg);
                } else {
                    console.warn("Invalid rule detected: " + rule);
                }
            }

            function applyCSSRule(selector, rule) {
                sheet = window.document.styleSheets[window.document.styleSheets.length - 1];
                sheet.insertRule(selector + "{" + rule + "}", sheet.cssRules.length);
            }

            var rule = args.queue.join(" ");
            var selectors = args.cssSelectors.join(" ").split(",");
            args.queue = [];
            for (var i = 0; i < selectors.length; i++) {
                isWibafRule(rule) ? applyWibafRule(selectors[i], rule) : applyCSSRule(selectors[i], rule);
            }
            return 1;

        }

        function openCSSSelector(token, args) {
            args.cssSelectors.push(args.queue.join(" "));
            args.queue = [];
            return 1;
        }

        function closeCSSSelector(token, args) {
            args.cssSelectors.pop();
            return 1;
        }

        var automata = {
            "new_expr" : new State({
                "@user" : new Transition(null, "usr"),
                "@context" : new Transition(null, "ctx"),
                "}" : new Transition(closeCSSSelector, "new_expr"),
                "*" : new Transition(addToQueue, "css_or_inst")
            }),
            "usr" : new State({
                "{" : new Transition(evalUsrExpr, "new_expr"),
                "*" : new Transition(addToExpr, "usr")
            }),
            "ctx" : new State({
                "{" : new Transition(evalCtxExpr, "new_expr"),
                "*" : new Transition(addToExpr, "ctx")
            }),
            "css_or_inst" : new State({
                ";" : new Transition(applyInstruction, "new_expr"),
                "{" : new Transition(openCSSSelector, "new_expr"),
                "*" : new Transition(addToQueue, "css_or_inst")
            })
        };

        return {
            parse : function(tokens, callback, arg, nonRep) {
                var state = "new_expr";
                var args = {
                    queue : [],
                    expr : [],
                    cssSelectors : [],
                    tokens : tokens
                };
                while (args.tokens.length > 0) {
                    var token = args.tokens[0];
                    if (token.length > 0) {
                        result = automata[state].executeTransition(token, args);
                        state = result.newState;
                    }
                    args.tokens = args.tokens.slice(result.consumedTokens, args.tokens.length);       // Removes the tokens consumed
                }
                if (callback) {
                    callback(arg);
                }
            }
        };
    };

    return {
        getInstance : function() {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };

})();
