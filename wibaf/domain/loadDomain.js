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