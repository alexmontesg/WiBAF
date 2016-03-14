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
