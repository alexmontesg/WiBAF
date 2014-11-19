// TODO This needs to be refactored and integrated in the library, maybe rewrite from 0

function fill_from_dm(concept, callback) {
	$.get(concept + ".jsonld", function(fileContent) {
		fileContent = fileContent.replace(/'/g, "\'");
		var concept = JSON.parse(fileContent);
		evaluateIfs(concept, function() {
			evaluateLoops(concept, function() {
				var tags =  document.documentElement.innerHTML.match(/{{.*?}}/g);
				tags = tags.filter(function(item, pos, self) {
					return self.indexOf(item) == pos;
				});
				for (i in tags) {
					var property = tags[i].replace(/[{}]/g, "");
					getValue(property, concept, function(value, args) {
						document.documentElement.innerHTML = document.documentElement.innerHTML.replace(new RegExp("{{" + args[0] + "}}", "g"), value);
						if(args[1] == tags.length -1 && callback) {
							callback();
						}
					}, [property, i]);
				}
			});
		});
	}, "html");
}

function evaluateIfs(concept, callback) {
	var ifs = document.documentElement.innerHTML.match(/{{\?.*}}/g);
	for (var i in ifs) {
		var expr = ifs[i];
		expr = expr.replace(/\..*/, "");
		var closeTag = "{{/?" + expr.replace(/[{\?\!}]/g, "") + "}}";
		var re = new RegExp(ifs[i].replace("\?", "\\\?") + "(.|\\n)*?" + closeTag.replace("\/", "\\\/").replace("\?", "\\\?"));
		var content = document.documentElement.innerHTML.match(re)[0];
		evaluateExpression(ifs[i].replace(/[{\?}]/g, ""), concept, function(value, executeCallback) {
			if (value) {
				document.documentElement.innerHTML = document.documentElement.innerHTML.replace(content, content.replace(ifs[i], "").replace(closeTag, "").trim());
			} else {
				document.documentElement.innerHTML = document.documentElement.innerHTML.replace(content, "");
			}
			if(executeCallback && callback) {
				callback();
			}
		}, false, i == ifs.length - 1);
	}
	if (ifs == undefined) {
	    if (callback) {
	        callback();
	    }
	}
}

function evaluateLoops(concept, callback) {
	var loops = document.documentElement.innerHTML.match(/{{#.*}}/g);
	if(loops && loops.length > 0) {
		for (var i in loops) {
			var loop = loops[i];
			var loopProp = loop.replace(/[{#}]/g, "").replace(/\..*/, "");
			var closeTag = "{{/#" + loopProp + "}}";
			var re = new RegExp(loop + "(.|\\n)*?" + closeTag.replace("\/", "\\\/"));
			var content = document.documentElement.innerHTML.match(re)[0];
			var innerContent = content.replace(loop, "").replace(closeTag, "").trim();
			getValue(loop.replace(/[{#}]/g, ""), concept, function(values) {
				replaceLoop(values, innerContent, loop, content, callback, i == loops.length - 1);
			});
		}
	} else {
		callback();
	}
}

function replaceLoop(values, innerContent, loop, content, callback, executeCallback) {
	var urlFinished = 0;
	for (var j in values) {
		var value = values[j];
		base = innerContent.replace("{{\.}}", value);
		properties = base.match(/{{.*?}}/g);
		if(properties.length > 0) {
			$.get(value, function(fileContent) {
				var loopConcept = JSON.parse(fileContent.replace(/'/g, "\'"));
				var newContent = base;
				var propertiesFinished = 0;
				for(var k in properties) {
					property = properties[k];
					getValue(property.replace(/[{}]/g, ""), loopConcept, function(value) {
						newContent = newContent.replace(property, value);
						propertiesFinished++;
						if(propertiesFinished == properties.length) {
							document.documentElement.innerHTML = document.documentElement.innerHTML.replace(loop, newContent + loop);
							urlFinished++;
							if(urlFinished == values.length) {
								document.documentElement.innerHTML = document.documentElement.innerHTML.replace(content, "");
								if(executeCallback) {
									callback();
								}
							}
						}
					});
				}
			});
		} else {
			document.documentElement.innerHTML = document.documentElement.innerHTML.replace(loop, base + loop);
			urlFinished++;
			if(urlFinished == values.length) {
				document.documentElement.innerHTML = document.documentElement.innerHTML.replace(content, "");
				if(executeCallback) {
					callback();
				}
			}
		}
	}
}

function evaluateExpression(expr, concept, callback, invertResult, executeCallback) {
	getValue(expr.split(" ")[0].trim().replace(/!/g, ""), concept, function(value, args) {
		var expr = args[0];
		var concept = args[1];
		var result;
		if (expr.indexOf("&gt;") > -1) {
			result = value > parseFloat(expr.split(" ")[2]);
		} else if (expr.indexOf("==") > -1) {
			result = value == parseFloat(expr.split(" ")[2]);
		} else if (expr.indexOf("&lt;") > -1) {
			result = value < parseFloat(expr.split(" ")[2]);
		} else if (expr.indexOf("!=") > -1) {
			result = value != parseFloat(expr.split(" ")[2]);
		} else if (expr.indexOf("!") == 0) {
			evaluateExpression(expr.replace("!", ""), concept, callback, !invertResult);
		} else {
			if (value) {
				result = ( value instanceof Array && value.length > 0) || (!( value instanceof Array) && value != "false");
			} else {
				result = false;
			}
		}
		invertResult ? callback(!result, executeCallback) : callback(result, executeCallback);
	}, [expr, concept]);
}

function getValue(expr, concept, callback, args) {
	var firstDot = expr.indexOf("\.");
	if (expr.indexOf("\.length") > -1 && expr.indexOf("\.length") == firstDot) {
		expr = expr.replace("\.length", "");
		if (concept[expr] && concept[expr] instanceof Array) {
			callback(concept[expr].length, args);
		} else {
			callback(null, args);
		}
	} else if (firstDot > -1) {
		var url = concept[expr.substring(0, firstDot)];
		var subexpr = expr.substring(firstDot + 1, expr.length);
		if (url) {
			$.get(url, function(fileContent) {
				fileContent = fileContent.replace(/'/g, "\'");
				getValue(subexpr, JSON.parse(fileContent), callback, args);
			});
		} else {
			callback(null, args);
		}
	} else {
		callback(concept[expr], args);
	}
}