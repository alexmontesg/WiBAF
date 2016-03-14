/**
 * Class that applies wibaf rules, provides methods {hasRule} and {execute}
 * 
 * @author Alejandro Montes Garcia
 */
var AdaptationEngine = function() {
    function getContent(arg) {
        var div = $("<span>", {
            class : "wibafGenerated"
        });
        if (isUrl(arg)) {
            arg = arg.substring(4, arg.length);
            $.get(arg, function(content) {
                div.html(content);
            });
        } else {
            div.html(arg);
        }
        return div;
    }
    
    var adaptationEngine = {
        /**
         * Inserts HTML code in the selected node (deletes the previous content).
         * 
         * @param {Object} selector
         * @param {Object} arg - A string with valid html or a url preceded by 'url:' where the code can be retrieved
         */
        insert : function(selector, arg) {
            $(selector).html(getContent(arg));
        },
        
        /**
         * Inserts the user model value of the specified variable in the selected node
         * 
         * @param {Object} selector
         * @param {Object} arg - Name of the user model variable
         */
        insert_um : function(selector, arg) {
            userModel.getInstance().get(arg, function(item) {
                $(selector).html(item.value);
            });
        },
        
        /**
         * Inserts the user model value of the specified variable in the selected node
         * 
         * @param {Object} selector
         * @param {Object} arg - domain col_separator
         */
        insert_um_table : function(selector, arg) {
            arg = arg.split(" ");
            userModel.getInstance().getDomain(arg[0], arg[1], function(items) {
                var table = $(selector)[0];
                for(var i = 0; i < items.length; i++) {
                    var row = table.insertRow(-1);
                    var item = items[i];
                    for(var j = 0; j < item.value.length; j++) {
                        var cell = row.insertCell(-1);
                        cell.innerHTML = item.value[j];
                    }
                }
            });
        },
        
        /**
         * Appends HTML code to the selected node.
         * 
         * @param {Object} selector
         * @param {Object} arg - A string with valid html or a url preceded by 'url:' where the code can be retrieved
         */
        append : function(selector, arg) {
            $(selector).append(getContent(arg));
        },
        
        /**
         * Reorders links in the selected list according to a strategy
         * 
         * @param {Object} selector
         * @param {Object} arg - strategy
         */
        reorder_links : function(selector, arg) {
            // TODO Implement
        },
        
        /**
         * Reorders nodes across a second selector according to a strategy
         * 
         * @param {Object} selector
         * @param {Object} arg - in the format '"secondSelector" strategy' (without the single quotes)
         */
        reorder_across : function(selector, arg) {
            var strategies = {
                data_order : function(across, selector) {
                    var nodes = [];
                    var unorderedNodes = [];
                    var acrossSize = [];
                    $(across).each(function(index) {
                        acrossSize[index] = $($(across)[index]).children(selector).length;
                    });
                    $(across).children(selector).each(function(index) {
                        if ($(this).data("order")) {
                            nodes[parseInt($(this).data("order")) - 1] = this.outerHTML;
                        } else {
                            unorderedNodes.push(this.outerHTML);
                        }
                    });
                    $(across + " " + selector).remove();
                    var i = 0;
                    var total = $(across).length;
                    nodes.forEach(function(item) {
                        while ($($(across)[i % total]).children(selector).length == acrossSize[i % total]) {
                            i++;
                        }
                        $(across)[i % total].innerHTML += item;
                        i++;
                    });
                    unorderedNodes.forEach(function(item) {
                        while ($($(across)[i % total]).children(selector).length == acrossSize[i % total]) {
                            i++;
                        }
                        $(across)[i % total].innerHTML += item;
                        i++;
                    });
                }
            };
        
            arg = arg.split("\"");
            var strategy = arg[2].trim().toLowerCase().replace(/-/g, "_");
            if(strategies[strategy]) {
                strategies[strategy].apply(strategies, [arg[1].trim(), selector]);
            }
        },
        
        /**
         * Reorders the subnodes of the selected node according to a strategy
         * 
         * @param {Object} selector
         * @param {Object} arg - the strategy
         */
        reorder_nodes : function(selector, arg) {
            var strategies = {
                data_order : function(selector) {
                    for (var i = 0; i < $(selector).length; i++) {
                        var nodes = [];
                        var unorderedNodes = [];
                        $($(selector)[i]).children().each(function(index) {
                            if ($(this).data("order")) {
                                nodes[parseInt($(this).data("order")) - 1] = this;
                            } else {
                                unorderedNodes.push(this);
                            }
                        });
                        $($(selector)[i]).empty();
                        nodes.forEach(function(item) {
                          $($(selector)[i]).append(item);
                        });
                        unorderedNodes.forEach(function(item) {
                          $($(selector)[i]).append(item);
                        });
                    }
                }
            };
            
            var strategy = arg.trim().toLowerCase().replace(/-/g, "_");
            if(strategies[strategy]) {
                strategies[strategy].apply(strategies, [selector]);
            }   
        },
        
        /**
         * Trims the selected text at a position
         * @param {Object} selector
         * @param {Object} arg - position
         */
        trim_at : function(selector, arg) {
            $(selector).text($(selector).text().trim().slice(0, parseInt(arg)));
        },
        
        stretchtext : function(selector, arg) {
            args = arg.split(',');
            amount = parseInt(args[0].trim());
            handlerMore = args[1].trim();
            handlerLess = args[2].trim();
            classname = args[3].trim();
            hashAnchor = args[4].trim();
            var item = $(selector)[0];
            if(!item || item.children.length == 0) {
                return;
            }
            var children = item.children;
            for(var i = 0; i < children.length; i++) {
                var classNameToAdd = 'wibaf-stretchtext-' + classname;
                if(children[i].classList.contains(classNameToAdd) || children[i].classList.contains('wibaf-short-stretchtext-' + classname)) {
                    return;
                } else if(children[i].className.length > 0) {
                    classNameToAdd = ' ' + classNameToAdd;
                }
                children[i].className = children[i].className + classNameToAdd;
                children[i].style.display = 'none';
            }

            var shortText = $(selector).text();
            while (shortText.charAt(amount) != ' ') {
                amount++;
            }
            amount++;
            shortText = shortText.trim().slice(0, amount);
            var p = document.createElement('p');
            p.className = 'wibaf-short-stretchtext-' + classname;
            p.innerHTML = shortText;
            var a = document.createElement('a');
            a.setAttribute('data-altText', handlerLess);
            a.setAttribute('data-handlerFor', classname);
            a.innerHTML = handlerMore;
            a.href = '#' + hashAnchor;
            a.onclick = function() {
                var items = document.getElementsByClassName('wibaf-stretchtext-' + this.dataset.handlerfor);
                var shortItem = document.getElementsByClassName('wibaf-short-stretchtext-' + this.dataset.handlerfor)[0];
                if(items[0].style.display == 'none') {
                    for(var i = 0; i < items.length; i++) {
                        items[i].style.display = '';
                    }
                    shortItem.style.display = 'none';
                } else {
                    for(var i = 0; i < items.length; i++) {
                        items[i].style.display = 'none';
                    }
                    shortItem.style.display = '';
                }
                altText = this.dataset.alttext;
                a.setAttribute('data-altText', this.innerHTML);                
                this.innerHTML = altText;
            };
            $(selector).append(p);
            $(selector).append(a);
        },
        
        slide_view : function(selector, arg) {
            var nodes = [];
            var slides = arg.split(",");
            slides.forEach(function(val) {
                var node = $(selector + " #" + val.trim());
                if (node.length === 1) {
                    nodes.push(node);
                }
            });
            nodes.forEach(function(val, i) {
                if(nodes[i - 1]) {
                    val.hide();
                    if(val.children('.wibaf_slide_link_.prev').length === 0) {
                        val.append("<a href='#" + nodes[i - 1].attr('id') + "' class='wibaf_slide_link_ prev'>Previous</a>");
                    }
                }
                if(nodes[i + 1]) {
                    if(val.children('.wibaf_slide_link_.next').length === 0) {
                        val.append("<a href='#" + nodes[i + 1].attr('id') + "' class='wibaf_slide_link_ next'>Next</a>");
                    }
                }
            });
            $('.wibaf_slide_link_').click(function() {
                nodes.forEach(function(val) {
                    val.hide();
                });
                $($(this).attr('href')).show();
            });
        },
        
        /**
         * Sets the degree-of-interest of the selected nodes
         * @param {Object} selector
         * @param {Object} arg - degree-of-interest
         */
        fisheye_doi : function(selector, arg) {
            // TODO Implement
        },
        
        /**
         * Updates the attribute of the selected nodes
         * @param {Object} selector
         * @param {Object} arg - attribute_name, new_value
         */
        update_attribute : function(selector, arg) {
            arg = arg.split(",");
            $(selector).attr(arg[0].trim(), arg[1].trim());
        },
        
        add_class : function(selector, arg) {
            $(selector).addClass(arg.trim());
        },
        
        delete_class : function(selector, arg) {
            $(selector).removeClass(arg.trim());
        },
        
        /**
         * Deletes the selected node
         * @param {Object} selector
         * @param {Object} arg - if true, keeps the content inside the node
         */
        delete_node : function(selector, arg) {
            if (arg.trim().toLowerCase() !== "true") {
                while($(selector).length > 0){
                    $($(selector)[0]).replaceWith($($(selector)[0]).html());
                }
            } else {
                $(selector).remove();
            }
        },

                check_prerequisites : function(selector, arg) {
                    arg = arg.split(",");
                    selector = selector.trim();
            sel = arg[0].trim();
            suffix = arg[1].trim();
                    var i = 0;
            $.makeArray($(sel)).forEach(function(link) {
                i++;
                link.id = "pre_req_link-" + i;
                link = $(link);
                linkText = link.text().trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/gmi, "") + suffix + "-accessed";
                userModel.getInstance().get(linkText, function(val, arr) {
                    if(val && val.value > 0) {
                        $("#" + arr[0].trim()).remove();
                        if($(arr[1] + " " + arr[2]).length === 0) {
                            $(arr[1]).remove();
                        }
                    }
                }, [link.attr('id'), selector, sel]);
                
            });
        },
        
        /**
         * Inserts a test in the selected node
         * @param {Object} selector
         * @param {Object} arg - url_to_the_questions number_of_questions user_model_variable submit_button_text;
         */
        insert_test : function(selector, arg) {
            var createAnswer = function(q, a, answer, type) {
                var div = document.createElement("div");
                div.className = "answer";
                var inputId = "q" + q + "a" + a;
                div.appendChild(createElement("input", {
                    "name" : "question" + q,
                    "type" : type,
                    "data-correct" : answer.c,
                    "data-feedback" : answer.f,
                    "id" : inputId
                }));
                div.appendChild(createElement("label", {
                    "for" : inputId
                }, answer.t));
                return div;
            };
        
            arg = arg.split(" ");
            $.post(arg[0].trim(), {
                n : parseInt(arg[1].trim())
            }, function(data) {
                var form = createElement("form", {
                    "id" : arg[2].trim()
                });
                for (q in data) {
                    var div = document.createElement("div");
                    div.className = "question";
                    var txt = document.createElement("p");
                    txt.innerText = data[q].t;
                    div.appendChild(txt);
                    var multi = false;
                    var one = false;
                    for (a in data[q].a) {
                        if(data[q].a[a].c && one) {
                                multi = true;
                                break;
                        } else if(data[q].a[a].c) {
                                one = true;
                        }
                    }
                    for (a in data[q].a) {
                        var type = multi ? "checkbox" : "radio";
                        div.appendChild(createAnswer(q, a, data[q].a[a], type));
                    }
                    if(q != 0) {
                        form.appendChild(document.createElement("hr"));
                    }
                    form.appendChild(div);
                }
                form.appendChild(createElement("a", {
                    "id" : "button" + arg[2].trim(),
                    "href" : "#",
                    "class" : "button",
                    "onclick" : "correctTest('" + arg[2].trim() + "');"
                }, arg[3].trim()));
                $(selector).append(form);
            });
        }
    };

    return {
        execute : function(name) {
            return adaptationEngine[name] && adaptationEngine[name].apply(adaptationEngine, [].slice.call(arguments, 1));
        },
        hasRule : function(name) {
            return adaptationEngine[name] !== undefined;
        }
    };

};

// --- file[js_file_1] ---

/**
 * Class that checks context variables
 * 
 * @author Alejandro Montes Garcia
 */
var ContextHelper = function() {
    var h, min, year, month, day, lat, lon, r;

    function setDate(date) {
        h = date.getHours();
        min = date.getMinutes();
        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();
    }

    function resetPosition() {
        lat = -1;
        lon = -1;
        r = 0;
    }

    setDate(new Date());
    resetPosition();

    var contextHelper = {

        checkHour : function(hour) {
            hour = hour.toIntArray(".");
            if (hour.length != 2) {
                console.warn("Invalid hour detected");
                return false;
            }
            return (hour[0] < h || (h === hour[0] && hour[1] < min)) ? "min" : "max";
        },

        checkDate : function(date) {
            date = date.toIntArray("/");
            if (date.length != 3) {
                console.warn("Invalid date detected");
                return false;
            }
            return (date[2] < year || (year === date[2] && date[1] < month) || (year === date[2] && month === date[1] && date[0] < day)) ? "min" : "max";
        },

        min_hour : function(hour) {
            return this.checkHour(hour) === "min";
        },

        max_hour : function(hour) {
            return this.checkHour(hour) === "max";
        },

        date : function(date) {
            date = date.toIntArray("/");
            if (date.length != 3) {
                console.warn("Invalid date detected");
                return false;
            }
            return day == date[0] && month == date[1] && year == date[2];
        },

        min_date : function(date) {
            return this.checkDate(date) === "min";
        },

        max_date : function(date) {
            return this.checkDate(date) === "max";
        },

        weekday : function(days) {
            var validWeekdays = ["su", "m", "tu", "w", "th", "f", "sa"];
            var weekdays = days.split(";");
            for (var i = 0; i < weekdays.length; i++) {
                if (validWeekDays.indexOf(weekdays[i].toLowerCase().trim()) === this.d.getDay()) {
                    return true;
                }
            }
            return false;
        },

        centre : function(coords) {
            coords = coords.split(";");
            lat = parseFloat(coords[0]);
            lon = parseFloat(coords[1]);
            return true;
        },

        radius : function(rad) {
            var radArr = rad.match(/(\d+)(\.\d+)?\s?(\w+)?/);
            var units = radArr[3] ? radArr[3] : "km";
            var value = radArr[2] ? parseFloat(radArr[1] + radArr[2]) : parseFloat(radArr[1]);
            r = toKm(value, units);
            return true;
        },
        
        getLat : function() {
            return lat;
        },
        
        getLon : function() {
            return lon;
        }, 
        getR : function() {
            return r;
        }
    };

    return {
        execute : function(name) {
            return contextHelper[name] && contextHelper[name].apply(contextHelper, [].slice.call(arguments, 1));
        }
    };
};


// --- file[js_file_2] ---

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
                            value = val.value;
                        }
                        if ((feature.endsWith("-gt") && parseInt(value) > parseInt(featureValue)) ||
                                (feature.endsWith("-lt") && parseInt(value) < parseInt(featureValue)) ||
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
                    }, {feature : feature, featureValue : features[feature], totalAnd : totalAndExpressions});
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


// --- file[js_file_3] ---

/**
 * Converts degrees into radians
 * 
 * @param {Object} deg
 */
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Converts a distance unit into kilometers
 * 
 * @param {Object} value
 * @param {Object} unit - valid values are km, m, mi and ft
 */
function toKm(value, unit) {
    var conversor = {
        km : 1,
        m : 0.001,
        mi : 1.60934,
        ft : 0.0003048
    };
    return value * conversor[unit];
}

/**
 * Checks whether str is a url or not
 * 
 * @param {Object} str
 */
function isUrl(str) {
    return str.startsWith("url:");
}

/**
 * Gets a string feature and converts it into a feature set object
 * 
 * @param {Object} featureString
 */
function getFeatures(featureString) {
    var featuresArray = featureString.match(/\(.*?\)/g);
    featuresArray = featuresArray.map(function(match) {
        return match.slice(1, -1);
    });
    var features = {};
    for (var i = 0; i < featuresArray.length; i++) {
        var andFeatures = featuresArray[i].toLowerCase().split(" and ");
        for (var j = 0; j < andFeatures.length; j++) {
            var feature = andFeatures[j].toLowerCase().split(":");
            if (feature.length === 2) {
                features[feature[0].trim()] = feature[1].trim();
            } else {
                console.warn("Invalid feature detected: " + featuresArray[i]);
            }
        }
    }
    return features;
}

/**
 * Creates a DOM element
 * 
 * @param {Object} type
 * @param {Object} attributes
 * @param {Object} innerText
 */
function createElement(type, attributes, innerText) {
    var element = document.createElement(type);
    for (key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    if (innerText) {
        element.innerText = innerText;
    }
    return element;
}

/**
 * Corrects a test and stores the result in the user model
 * 
 * @param {Object} formId
 */
function correctTest(formId) {
    var form = $(document.getElementById(formId));
    $(".feedback").remove();
    var questions = $("#" + formId + " .question");
    var correct = 0;
    var total = $("#" + formId + " > .question > .answer > input[data-correct=true]").length;
    form.find("input:checked").each(function(i, e) {
        var label = $(e).siblings("label")[0];
        var feedback = createElement("span", {
            "class" : "feedback"
        }, e.getAttribute("data-feedback"));
        if (e.getAttribute("data-correct") === "true") {
            correct++;
        }
        e.parentNode.appendChild(feedback);
    });
    userModel.getInstance().get(formId, function(item, value) {
                if(item) {
                    userModel.getInstance().update(formId, value);
                } else {
                    userModel.getInstance().init(formId, value, "numeric"); //TODO Add the other parameters
                }
            }, (correct / total).toFixed(2));
    return false;
}

// --- file[js_file_4] ---

/**
 * Parser for the Domain Modelling Files
 * 
 * @author Alejandro Montes Garcia
 */
var domainParser = (function DomainParser() {
    var instance;
    
    function substituteTags(concept, callback){
        var text = document.documentElement.innerHTML;
        var tags = text.match(/{{.+?}}/g);
        var uniqueTags = tags.filter(function(item, pos) {
            return tags.indexOf(item) == pos;
        });
        var tagsDone = 0;
        for(i in uniqueTags) {
            var tag = uniqueTags[i].replace(/^{{/, "").replace(/}}$/, "");
            getPropertyValue(concept, tag, function(propertyValue, callbackArgs) {
                var tag = callbackArgs["tag"].replace("\[", "\\\[").replace("\]", "\\\]");
                document.documentElement.innerHTML = document.documentElement.innerHTML.replace(new RegExp(tag, "g"), propertyValue);
                if(++tagsDone === uniqueTags.length && callback) {
                    callback();
                }
            }, {
                tag: uniqueTags[i]
            });
        }
    }
    
    function evaluateIfs(concept, callback) {
        // TODO Check ors, ands, gt, lt, etc...
        var regexp = /{{if\s.+?}}/;
        var text = document.documentElement.innerHTML;
        if(regexp.test(text)) {
            var conditional = text.match(regexp)[0];
            var index = text.search(regexp);
            var condition = conditional.replace(/^{{if\s+/, "").replace(/\s*}}$/, "").trim();
            getPropertyValue(concept, condition, function(propertyValue, callbackArgs) {
                var newHTML = document.documentElement.innerHTML;
                var condition = callbackArgs["condition"];
                var conditional = callbackArgs["conditional"];
                while(condition.startsWith("!")) {
                    condition = condition.replace("!", "");
                    propertyValue = !propertyValue;
                }
                if(propertyValue) {
                    newHTML = newHTML.replace(conditional, "").replace("{{/if}}", "");
                } else {
                    newHTML = newHTML.replace(conditional + callbackArgs["ifContent"] + "{{/if}}", "");
                }
                document.documentElement.innerHTML = newHTML;
                evaluateIfs(concept, callback);
            }, {
                ifContent: getContentInsideBlock("if", text, index + conditional.length),
                conditional: conditional,
                condition: condition
            });
        } else {
            substituteTags(concept, callback);
        }
    }
    
    function getSubpropertyValue(newConcept, property, callback, callbackArgs) {
        var firstDot = property.indexOf("\.");
        var subexpr = property.substring(firstDot + 1, property.length);
        if (typeof newConcept === "string") {
            // If it is a string, we assume that it is a URL
            $.get(newConcept, function(fileContent) {
                fileContent = fileContent.replace(/'/g, "\'");
                getPropertyValue(JSON.parse(fileContent), subexpr, callback, callbackArgs);
            });
        } else {
            // Otherwise we assume that is JSON
            getPropertyValue(newConcept, subexpr, callback, callbackArgs);
        }
    }

    function getPropertyValue(concept, property, callback, callbackArgs) {
        var firstDot = property.indexOf("\.");
        var firstBrackets = property.search(/\[\d+\]/);
        if(firstDot === -1 && firstBrackets === -1) {
            callback(concept[property], callbackArgs);
        } else if (firstDot > -1 && firstBrackets > firstDot || firstDot > -1 && firstBrackets === -1) {
            var newConcept = concept[property.substring(0, firstDot)];
            getSubpropertyValue(newConcept, property, callback, callbackArgs);
        } else {
            var list = concept[property.substring(0, firstBrackets)];
            var index = parseInt(property.match(/\[\d+\]/)[0].replace(/\D/g, ""));
            var newConcept = list[index];
            if(firstDot === -1) {
                callback(newConcept, callbackArgs);
            } else {
                getSubpropertyValue(newConcept, property, callback, callbackArgs);
            }
        }
    }

    
    function getIterableLength(concept, iterable, callback, forContent) {
        getPropertyValue(concept, iterable, function(propertyValue, callbackArgs) {
            callback(propertyValue.length, callbackArgs["forContent"], callbackArgs["iterable"]);
        }, {
            forContent: forContent,
            iterable: iterable
        });
    }
    
    function addIndexToLabels(forContent, iterable, index) {
        var tags = forContent.match(/{{.*?}}/g);
        for(var i in tags) {
            var tagContent = tags[i].replace(/[{}]/g, "").trim();
            if(!tagContent.startsWith("/")) {
                var replacement = "{{";
                if(tagContent.startsWith("for ")){
                    replacement += "for ";
                    tagContent = tagContent.replace(/^for\s+/, "");
                } else if(tagContent.startsWith("if ")) {
                    replacement += "if ";
                    tagContent = tagContent.replace(/^if\s+/, "");
                }
                replacement += iterable + "[" + index + "]." + tagContent + "}}";
                forContent = forContent.replace(tags[i], replacement);
            }
        }
        return forContent;
    }
    
    function getContentInsideBlock(blockType, text, startPosition, callback) {
        var closeTagLength = ("{{/" + blockType + "}}").length;
        var content = "";
        var openedBlocks = 0;
        for(var i = startPosition; i < text.length - closeTagLength; i++){
            var substr = text.substring(i, i + closeTagLength);
            if(substr === "{{/" + blockType + "}}") {
                if(openedBlocks === 0) {
                    break;
                } else {
                    openedBlocks--;
                }
            }
            substr = text.substring(i, i + ("{{" + blockType + " ").length);
            if(substr === "{{" + blockType + " ") {
                openedBlocks++;
            }
            content += text[i];
        }
        return content;
    }
    
    function expandLoops(concept, callback) {
        var regexp = /{{for\s.+?}}/;
        var text = document.documentElement.innerHTML;
        if(regexp.test(text)) {
            var loop = text.match(regexp)[0];
            var index = text.search(regexp);
            var iterable = loop.replace(/^{{for\s+/, "").replace(/\s*}}$/, "").trim();
            getIterableLength(concept, iterable, function(loopLength, forContent, iterable) {
                var toReplace = "";
                for(var i = 0; i < loopLength; i++) {
                    toReplace += addIndexToLabels(forContent, iterable, i);
                }
                var newHTML = document.documentElement.innerHTML.replace(loop + forContent + "{{/for}}", toReplace);
                document.documentElement.innerHTML = newHTML;
                expandLoops(concept, callback);
            }, getContentInsideBlock("for", text, index + loop.length));
        } else {
            evaluateIfs(concept, callback);
        }
    }
    
    function init() {
        return {
            loadData : function(conceptURL, callback) {
                $.get(conceptURL, function(fileContent) {
                    var concept = JSON.parse(fileContent);
                    expandLoops(concept, callback);
                }, "html");
            }
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

// --- file[js_file_5] ---

/**
 * Parser for the User Modelling Files
 * 
 * @author Alejandro Montes Garcia
 */
var modellingParser = (function ModellingParser() {

    var instance;

    function init() {
        var Event = function() {
            this.trigger = "";
            this.condition = "";
            this.valCollection = "";
        };

        function addToQueue(token, args) {
            args.queue.push(token);
            return 1;
        }

        function addVarToQueue(token, args) {
            args.queue.push("var");
            return 1;
        }

        function addFunctionNameToQueue(token, args) {
            args.queue.push("userModel.getInstance()." + token + "(");
            return 1;
        }

        function addFunctionNameToQueueAsVar(token, args) {
            args.queue.push(token + " = function(");
            return 1;
        }

        function addOpenFunctionToQueue(token, args) {
            args.queue.push("){");
            return 1;
        }

        function addCloseFunctionToQueue(token, args) {
            args.queue.push("}");
            writeQueue(token, args);
            return 1;
        }

        function addCloseTriggerFunctionToQueue(token, args) {
            args.queue.push("}");
            if (args.currentEvent.trigger.trim() === "document.load") {
                args.eventsToCall.push(args.eventFunctionName);
            }
            writeQueue(token, args);
            return 1;
        }

        function createEvent(token, args) {
            args.currentEvent = token;
            args.events[token] = new Event();
            return 1;
        }

        function concatTrigger(token, args) {
            args.events[args.currentEvent].trigger += token + " ";
            return 1;
        }

        function concatCondition(token, args) {
            args.events[args.currentEvent].condition += token + " ";
            return 1;
        }

        function concatCollection(token, args) {
            args.events[args.currentEvent].valCollection += token + " ";
            return 1;
        }

        function notConsumeToken(token, args) {
            return 0;
        }

        function getEvent(token, args) {
            args.currentEvent = args.events[token];
            return 1;
        }
        
        function addConditionOrCollection(toAdd, isCondition) {
            if (toAdd && toAdd.trim().length > 0) {
                toAdd = toAdd.replace(/(^|[\s+\.\[\]])this./g, function(str) {
                    return str.replace(/this/g, "e.currentTarget");
                }).trim();
                return isCondition ? "if(!(" + toAdd + ")) return;" : toAdd.replace(/:/g, "=") + ";";
            }
            return "";
        }
        
        function addEventListenerToNode(jsSelector, args, eventListener) {
            var domNode = new Function("return " + jsSelector + ";").call();
            if (Object.prototype.toString.call(domNode) === "[object HTMLCollection]" || Object.prototype.toString.call(domNode) === "[object NodeList]") {
                for (var i = 0; i < domNode.length; i++) {
                    args.queue.push(jsSelector + "[" + i + "].addEventListener(" + eventListener + ");");
                }
            } else if (Object.prototype.toString.call(domNode) !== "[object Null]") {
                args.queue.push(jsSelector + ".addEventListener(" + eventListener + ");");
            }
        }

        function addTriggerToQueue(token, args) {
            var arr = args.currentEvent.trigger.split(".");
            var eventTrigger = arr.pop().trim();         // E.g. click, mouseover, load, etc...
            var jsSelector = arr.join(".");              // Javascript selector
            args.eventFunctionName = ("_event" + (jsSelector + eventTrigger).hashCode() + "_" + args.nEvents).replace("-", "_");
            args.nEvents++;
            addEventListenerToNode(jsSelector, args, "'" + eventTrigger + "', function(e){" + args.eventFunctionName + "(e);}, false");
            args.queue.push("var " + args.eventFunctionName + " = function(e){");
            var toPush = [addConditionOrCollection(args.currentEvent.condition, true), addConditionOrCollection(args.currentEvent.valCollection, false)];
            for(var i = 0; i < toPush.length; i++) {
                if(toPush[i] && toPush[i].trim().length > 0) {
                    args.queue.push(toPush[i]);
                }
            }
            return 1;
        }

        function addEndFunctionCallToQueue(token, args) {
            args.queue.push(", function(){wibaf.getInstance().refresh();}");
            args.queue.push(");");
            return 1;
        }

        function addUMVarToQueue(token, args) {
            token = token.trim();
            if (token.charAt(0) === '#') {
                args.queue.push(token.replace("#", "'") + "'");
            } else {
                args.queue.push(token);
            }
            return 1;
        }

        function writeQueue(token, args) {
            args.script.innerHTML += args.queue.join(" ") + ";";
            args.queue.length = 0;
            return 1;
        }

        var automata = {
            "new_inst" : new State({
                "val" : new Transition(addVarToQueue, "val1"),
                "def" : new Transition(addVarToQueue, "def1"),
                "event" : new Transition(null, "event1"),
                "on" : new Transition(null, "on1")
            }),
            "val1" : new State({
                "*" : new Transition(addToQueue, "val2")
            }),
            "val2" : new State({
                "=" : new Transition(addToQueue, "val3")
            }),
            "val3" : new State({
                "`" : new Transition(null, "val4")
            }),
            "val4" : new State({
                "`" : new Transition(writeQueue, "new_inst"),
                "*" : new Transition(addToQueue, "val4")
            }),
            "def1" : new State({
                "*" : new Transition(addFunctionNameToQueueAsVar, "def2")
            }),
            "def2" : new State({
                "=" : new Transition(null, "def3")
            }),
            "def3" : new State({
                "`" : new Transition(addOpenFunctionToQueue, "def4"),
                "*" : new Transition(addToQueue, "def5")
            }),
            "def4" : new State({
                "`" : new Transition(addCloseFunctionToQueue, "new_inst"),
                "*" : new Transition(addToQueue, "def4")
            }),
            "def5" : new State({
                "=>" : new Transition(null, "def3"),
                "*" : new Transition(addToQueue, "def5")
            }),
            "event1" : new State({
                "*" : new Transition(createEvent, "event2")
            }),
            "event2" : new State({
                "=" : new Transition(null, "event3")
            }),
            "event3" : new State({
                "`" : new Transition(null, "event4")
            }),
            "event4" : new State({
                "`" : new Transition(null, "event5"),
                "*" : new Transition(concatTrigger, "event4")
            }),
            "event5" : new State({
                "=>" : new Transition(null, "event6"),
                "*" : new Transition(notConsumeToken, "new_inst")
            }),
            "event6" : new State({
                "`" : new Transition(null, "event7")
            }),
            "event7" : new State({
                "{" : new Transition(null, "event9"),
                "*" : new Transition(concatCondition, "event8")
            }),
            "event8" : new State({
                "`" : new Transition(null, "new_inst"),
                "*" : new Transition(concatCondition, "event8")
            }),
            "event9" : new State({
                "*" : new Transition(concatCollection, "event10")
            }),
            "event10" : new State({
                "}" : new Transition(null, "event11"),
                "*" : new Transition(concatCollection, "event10")
            }),
            "event11" : new State({
                "`" : new Transition(null, "new_inst")
            }),
            "on1" : new State({
                "*" : new Transition(getEvent, "on2")
            }),
            "on2" : new State({
                "{" : new Transition(addTriggerToQueue, "on3")
            }),
            "on3" : new State({
                "}" : new Transition(addCloseTriggerFunctionToQueue, "new_inst"),
                "inc" : new Transition(addFunctionNameToQueue, "op"),
                "dec" : new Transition(addFunctionNameToQueue, "op"),
                "update" : new Transition(addFunctionNameToQueue, "op"),
                "add_obs" : new Transition(addFunctionNameToQueue, "op"),
                "init" : new Transition(addFunctionNameToQueue, "op"),
                "init_if_blank" : new Transition(addFunctionNameToQueue, "op"),
                "init_update" : new Transition(addFunctionNameToQueue, "op"),
                "add" : new Transition(addFunctionNameToQueue, "op"),
                "sub" : new Transition(addFunctionNameToQueue, "op"),
            }),
            "op" : new State({
                ";" : new Transition(addEndFunctionCallToQueue, "on3"),
                "*" : new Transition(addUMVarToQueue, "op")
            })
        };

        return {
            parse : function(tokens, callback) {
                var state = "new_inst";
                var script = document.createElement("script");      // This script will be inserted into the HTML
                script.async = true;
                var args = {
                    queue : [],
                    tokens : tokens,
                    events : {},
                    currentEvent : null,
                    eventFunctionName : null,
                    eventsToCall : [],
                    script : script,
                    nEvents : 0
                };
                while (args.tokens.length > 0) {
                    var token = args.tokens[0];
                    if (token.length > 0) {
                        result = automata[state].executeTransition(token, args);
                        state = result.newState;
                    }
                    args.tokens = args.tokens.slice(result.consumedTokens, args.tokens.length);       // Removes the tokens consumed
                }
                document.body.appendChild(args.script);
                for (var i = 0; i < args.eventsToCall.length; i++) {
                    window[args.eventsToCall[i]].apply(window);        // The onLoad events are executed inmediately
                }
            }, 
            addVisit : function(callback) {
                var varName = (document.title + "-accessed").replace(/\s+/g, "-").replace(/[^a-z0-9-]/gmi, "").trim().toLowerCase();
                userModel.getInstance().get(varName, function(value) {
                    if(value) {
                        userModel.getInstance().inc(varName, callback);
                    } else {
                        // TODO Define proper use and url
                        userModel.getInstance().init(varName, 1, "numeric", document.URL, null, "access", callback);
                    }
                });
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


// --- file[js_file_6] ---

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
            setServer : setServer
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


// --- file[js_file_7] ---

/**
 * Singleton to create or get an instance of the database to use
 * 
 * @author Alejandro Montes Garcia
 */
var databaseFactory = (function DatabaseFactory() {
    var instance;
    
    function init(){
        return {
            /**
             * Creates or gets the intance of the database to be used
             * @param {Object} options Object containing the following:
             * - options.callback: Code to be executed after the creation of the database
             * - options.useIndexedDB: Indicates whether the IndexedDB should be used or not
             */
            createDatabase: function(options) {
                if(!options.useIndexedDB) {
                    database = LocalStorageAPI().getInstance();
                }
                return options.useIndexedDB ? IndexedDBAPI().getInstance(options.callback) : LocalStorageAPI().getInstance(options.callback);
            }
        };
    }
    
    return {
        getInstance: function() {
            if(!instance) {
                instance = init();
            }
            return instance;
        }
    };
})();

// --- file[js_file_8] ---

/**
 * Singleton to deal with the Indexed DB
 * 
 * @author Alejandro Montes Garcia
 */
var IndexedDBAPI = function() {
    var instance;

    function init(callback) {
        var db;
        
        function get(name, collection, callback, opt) {
            db.transaction([collection], "readonly").objectStore(collection).get(name).onsuccess = function(e) {
                callback(e.target.result, opt);
            };
        };

        function add(args, collection, callback) {
            args.times_updated = 1;
            args.changed = true;
            args.last_updated = new Date().getTime();
            var trans = db.transaction([collection], "readwrite");
            trans.objectStore(collection).add(args);
            trans.oncomplete = function() {
                if (callback) {
                    callback();
                }
            };
        };

        function remove(name, collection, callback) {
            var trans = db.transaction([collection], "readwrite");
            trans.objectStore(collection).delete(name);
            trans.oncomplete = function() {
                if (callback) {
                    callback();
                }
            };
        };
        
        function update(name, field, new_value, collection, callback) {
            get(name, collection, function(data) {
                data[field] = new_value;
                data.times_updated++;
                data.changed = true;
                data.last_updated = new Date().getTime();
                trans = db.transaction([collection], "readwrite");
                trans.objectStore(collection).put(data);
                trans.oncomplete = function() {
                    if (callback) {
                        callback();
                    }
                };
            });
        };
        
        function getDomain(domain, separator, collection, callback) {
            if (callback) {
                var items = [];
                db.transaction([collection], "readonly").objectStore(collection).openCursor().onsuccess = function(e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        var item = cursor.value;
                        if(item.domain === domain) {
                            item.value = item.value.split(separator);
                            items.push(item);
                        }
                        cursor.continue();
                    } else {
                        callback(items);
                    }
                };
            }
        };
        
        function getAll(collection, callback) {
            if (callback) {
                var items = [];
                db.transaction([collection], "readonly").objectStore(collection).openCursor().onsuccess = function(e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        items.push(cursor.value);
                        cursor.continue();
                    } else {
                        callback(items);
                    }
                };
            }
        };
    
        function removeAll(collection, callback) {
            db.transaction([collection], "readwrite").objectStore(collection).clear().onsuccess = function(e) {
                if (callback) {
                    callback();
                }
            };
        };
        
        function onError(e) {
            console.log(e);
            // TODO Implement
        };
        
        function createDB(callback) {
            var req = window.indexedDB.open("WiBAF", 1);
            req.onsuccess = function(event) {
                db = req.result;
                db.onerror = onError;
                callback();
            };
            req.onupgradeneeded = function(e) {
                if (!db) {
                    db = req.result;
                }
                var collections = ["user_model", "settings"];
                for(var i = 0; i < collections.length; i++) {
                    var collection = collections[i];
                    if (!db.objectStoreNames.contains(collection)) {
                        db.createObjectStore(collection, {
                            keyPath : "name"
                        });
                    }
                }
            };
            req.onerror = onError;
        };

        createDB(callback);

        return {
            add : add,
            remove : remove,
            update : update,
            get : get,
            getDomain : getDomain,
            getAll : getAll,
            removeAll : removeAll
        };

    };

    return {
        getInstance : function(callback) {
            if (!instance) {
                instance = init(callback);
            } else if(callback){
                callback();
            }
            return instance;
        }
    };
};


// --- file[js_file_9] ---

/**
 * Singleton to deal with the localstorage in the browser. It is synchronous but
 * in order to keep the same interface as the {IndexedDBAPI} the methods use
 * callbacks and do not return anything.
 * 
 * @author Alejandro Montes Garcia
 */
var LocalStorageAPI = function() {
    
    var instance;
    
    function init(callback) {
        function add(args, collection, callback) {
            args.collection = collection;
            args.times_updated = 1;
            args.last_updated = new Date().getTime();
            localStorage[args.name] = JSON.stringify(args);
            if (callback) {
                callback();
            }
        }
        
        function remove(name, collection, callback) {
            item = localStorage[name];
            if(item && JSON.parse(item).collection === collection) {
                localStorage[name] = undefined;
            }
            if (callback) {
                callback();
            }
        }
        
        function update(name, field, new_value, collection, callback) {
            var item = localStorage[name];
            if (item) {
                item = JSON.parse(item);
                if(item.collection === collection) {
                    item.times_updated++;
                    item[field] = new_value;
                    item.last_updated = new Date().getTime();
                    localStorage[name] = JSON.stringify(item);
                }
            }
            if (callback) {
                callback();
            }
        };
        
        function get(name, collection, callback, opt) {
            var item = localStorage[name];
            if (item) {
                item = JSON.parse(item);
                if(item.collection !== collection) {
                    item = null;
                }
            }
            callback(item, opt);
        };
        
        function getDomain(domain, separator, collection, callback) {
            var items = [];
            var len = localStorage.length;
            for (var i = 0; i < len; ++i) {
                var item = JSON.parse(localStorage.getItem(localStorage.key(i)));
                if(item.collection === collection && item.domain == domain) {
                    item.value = item.value.split(separator);
                    items.push(item);
                }
            }
            callback(items);
        };
        
        function getAll(collection, callback) {
            var items = [];
            var len = localStorage.length;
            for (var i = 0; i < len; ++i) {
                var item = JSON.parse(localStorage.getItem(localStorage.key(i)));
                if(item.collection === collection) {
                    items.push(item);
                }
            }
            callback(items);
        };
        
        function removeAll(collection, callback) {
            getAll(collection, function(items) {
                for(var i = 0; i < items.length; i++){
                    remove(items[i].name, collection);
                }
                if(callback) {
                    callback();
                }
            });
        };
        return {
            add : add,
            remove : remove,
            update : update,
            get : get,
            getDomain : getDomain,
            getAll : getAll,
            removeAll : removeAll
        };
    }

    return {
        getInstance : function(callback) {
            if (!instance) {
                instance = init();
            }
            if(callback) {
                callback();
            }
            return instance;
        }
    };
}; 

// --- file[js_file_10] ---

/**
 * Represents a privacy rule
 * 
 * @param {String} name
 * @param {Object} value
 * @param {Object} type
 * @author Alejandro Montes Garcia
 */
var Rule = function(name, value, type) {
    this.name = name;
    this.value = value;
    this.type = type;
};

Rule.prototype.checkIfApplies = function(data) {
    //TODO Only a match by domain is checked, there could be more possibilities
    return this.value.domain && data.domain && this.value.domain.toLowerCase() === data.domain.toLowerCase();
};

// --- file[js_file_11] ---

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


// --- file[js_file_12] ---

/**
 * Singleton to deal with the server
 * 
 * @author Alejandro Montes Garcia
 */
var ServerAPI = function() {
    var instance;

    function init(endpoint, callback) {
        
        function getJSON(args, callback) {
            $.ajax({
                type: "POST",
                url: endpoint,
                data: args
            }).done(function(result) {
                callback(JSON.parse(result));
            });
        }
        
        function get(name, collection, callback, opt) {
            getJSON({
                method: 'getItem',
                name: name
            }, function(result) {
                if(callback) {
                    callback(result, opt);
                }
            });
        };

        function add(args, collection, callback) {
            args.method ='addItem';
            getJSON(args, function(result) {
                if(callback) {
                    callback(result);
                }
            });
        };

        function remove(name, collection, callback) {
            getJSON({
                method: 'removeItem',
                name: name
            }, function(result) {
                if(callback) {
                    callback(result);
                }
            });
        };
        
        function update(name, field, new_value, collection, callback) {
            getJSON({
                method: 'updateItem',
                name: name,
                valueName: field,
                newValue: new_value
            }, function(result) {
                if(callback) {
                    callback(result);
                }
            });
        };
        
        function getAll(collection, callback) {
            getJSON({
                method: 'getAll'
            }, function(result) {
                if(callback) {
                    callback(result);
                }
            });
        };
    
        function removeAll(collection, callback) {
            getJSON({
                method: 'removeAll'
            }, function(result) {
                if(callback) {
                    callback(result);
                }
            });
        };
        

        return {
            add : add,
            remove : remove,
            update : update,
            get : get,
            getAll : getAll,
            removeAll : removeAll
        };

    };

    return {
        getInstance : function(endpoint, callback) {
            if (!instance) {
                instance = init(endpoint);
            }
            if(callback) {
                callback();
            }
            return instance;
        }
    };
};


// --- file[js_file_13] ---

/**
 * Singleton to manipulate settings in the database.
 * 
 * @author Alejandro Montes Garcia
 */
var settings = (function SettingsEngine() {
    
    var instance;
    
    function init() {
        function add(name, value, callback) {
            database.add({
                name : name,
                value : value
            }, "settings", callback);
        }
        
        function remove(name, callback) {
            database.remove(name, "settings", callback);
        }
        
        function get(name, callback) {
            database.get(name, "settings", callback);
        }
        
        function getAll(callback) {
            database.getAll("settings", callback);
        }
        
        function update(name, newValue, callback) {
            database.update(name, "value", newValue, "settings", callback);
        }
        
        return {
            add : add,
            remove : remove,
            get : get,
            getAll : getAll,
            update : update
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


// --- file[js_file_14] ---

/**
 * Represents a state in an automata as a set of transitions.
 * 
 * @param {Object} transitions
 * @author Alejandro Montes Garcia
 */
var State = function(transitions) {
    this.transitions = transitions;
};

/**
 * Given a state a and a token, the transition to be executed is
 * selected and executed.
 * 
 * @param {Object} token
 * @param {Object} args
 * @return {Object} A Object with two properties namely, {consumedTokens}: the
 * tokens consumed from the automata during this transition, {newState}: the new
 * state in which the automata will end.
 * @author Alejandro Montes Garcia
 */
State.prototype.executeTransition = function(token, args) {
    var transitionToken = token;
    if(!this.transitions[token] && this.transitions["*"]) {
        transitionToken = "*";
    }
    if(this.transitions[transitionToken]) {
        consumedTokens = this.transitions[transitionToken].execute(token, args);
        return {
            consumedTokens : consumedTokens,
            newState : this.transitions[transitionToken].newState
        };
    }
    console.error("No transition for current state and token " + token);
};

/**
 * A transition is represented as an action to be executed and a new state
 * for the automata.
 * 
 * @param {Object} action
 * @param {Object} newState
 * @author Alejandro Montes Garcia
 */
var Transition = function(action, newState) {
    this.action = action;
    this.newState = newState;
};

/**
 * Executes the action specified in the transaction, given a token.
 * 
 * @param {Object} token
 * @param {Object} args
 * @return {int} The number of tokens consumed
 * @author Alejandro Montes Garcia
 */
Transition.prototype.execute = function(token, args) {
    return this.action ? this.action(token, args) : 1; 
};


// --- file[js_file_15] ---

/**
 * This object adds methods to manipulate strings. More specifically, it adds
 * the {String.hashCode}, {String.tokenize}, {String.toIntArray},
 * {String.endsWith} and {String.startsWith}.
 *
 * Usage: {stringManipulator.addStringMethods}.
 * 
 * @author Alejandro Montes Garcia
 */
var stringManipulator = (function() {
    var methodsAdded = false;

    return {

        /**
         * Adds the following methods to the String prototype:
         *
         * {String.hashCode}: Calculates a hash code for the string.
         *
         * {String.tokenize}: Separates the tokens of the string by
         * whitespaces and returns the resulting array.
         *
         * {String.toIntArray}(separator): Splits a string containing ints
         * separated by "separator" and returns an array containing those
         * integers.
         * 
         * {String.endsWith}(suffix): Checks if the string ends with the
         * suffix.
         * 
         * {String.startsWith}(prefix): Checks if the string starts with
         * the prefix.
         */
        addStringMethods : function() {
            if (!methodsAdded) {
                if (!String.prototype.hashCode) {
                    String.prototype.hashCode = function() {
                        var hash = 0;
                        for (var i = 0; i < this.length; i++) {
                            hash = ((hash << 5) - hash) + this.charCodeAt(i);
                            hash |= 0;
                        }
                        return hash;
                    };
                }
                if (!String.prototype.tokenize) {
                    String.prototype.tokenize = function() {
                        return this.replace(/\s+/g, " ").trim().split(" ");
                    };
                }
                if (!String.prototype.toIntArray) {
                    String.prototype.toIntArray = function(separator) {
                        var arr = this.split(separator);
                        for (var i = 0; i < arr.length; i++) {
                            arr[i] = parseInt(arr[i]);
                        }
                        return arr;
                    };
                }
                if (!String.prototype.endsWith) {
                    String.prototype.endsWith = function(suffix) {
                        return this.indexOf(suffix, this.length - suffix.length) !== -1;
                    };
                }
                if (!String.prototype.startsWith) {
                    String.prototype.startsWith = function(prefix) {
                        return this.slice(0, prefix.length) === prefix;
                    };
                }
            }
        }
    };
})();


// --- file[js_file_16] ---

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
var wibaf = (function() {
    
    var instance;
    
    function init() {
        function supportIndexedDB() {
        var isSafari = navigator.vendor.indexOf("Apple")==0 && /\sSafari\//.test(navigator.userAgent);
            return window.indexedDB && !isSafari;
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
                //$("html").css("display", "block");
            }
        };
    
        function parseModellingFile(srcs, callback, amSrcs) {
            if (srcs && srcs.length > 0) {
                var src = srcs.pop();
                $.get(src, function(fileContent) {
                    var tokens = fileContent.replace(/[`{}:;,]/g, function(str) {
                        // Makes sure that special characters are treated as
                        // tokens
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
             * @param {String} conceptURL: URL to the jsonld file containing the
             * domain model
             */
            init : function(callback, conceptURL, serverURL) {
                stringManipulator.addStringMethods();
                database = databaseFactory.getInstance().createDatabase({
                    useIndexedDB : supportIndexedDB(),
                    callback : function() {
                        window.serverAPI = ServerAPI().getInstance(serverURL, function() {
                            if (conceptURL) {
                                domainParser.getInstance().loadData(conceptURL, function() {
                                    /*
                                     * The visited counter is updated here because the onload events are not
                                     * granted to finish before the execution of the callback.
                                     */
                                    modellingParser.getInstance().addVisit(function() {
                                        parseModellingFile(getSources("umf"), callback, getSources("amf"), true);
                                    });
                                });
                            } else {
                                modellingParser.getInstance().addVisit(function() {
                                    parseModellingFile(getSources("umf"), callback, getSources("amf"));
                                });
                            }
                        });
                    }
                });
            },
            
            refresh : function() {
                parseAdaptationFile(getSources("amf"));
            }
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