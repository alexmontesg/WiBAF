/**
 * Parser for the Domain Modelling Files
 * 
 * @author Alejandro Montes Garcia
 */
var domainParser = (function DomainParser() {
    var instance;
    
    function getIterableLength(concept, iterable, callback, forContent) {
        var loopLength = 10; // TODO Calculate properly
        callback(loopLength, forContent, iterable);
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
    
    function getContentInsideFor(text, startPosition, callback) {
        var closeTagLength = "{{/for}}".length;
        var content = "";
        var openedFors = 0;
        for(var i = startPosition; i < text.length - closeTagLength; i++){
            var substr = text.substring(i, i + closeTagLength);
            if(substr === "{{/for}}") {
                if(openedFors === 0) {
                    break;
                } else {
                    openedFors--;
                }
            }
            substr = text.substring(i, i + "{{for ".length);
            if(substr === "{{for ") {
                openedFors++;
            }
            content += text[i];
        }
        return content;
    }
    
    function expandLoops(concept, callback) {
        var regexp = /{{for\s.+?}}/;
        var text = document.body.innerHTML;
        if(regexp.test(text)) {
            var loop = text.match(regexp)[0];
            var index = text.search(regexp);
            var iterable = loop.replace(/^{{for\s+/, "").replace(/\s*}}$/, "").trim();
            getIterableLength(concept, iterable, function(loopLength, forContent, iterable) {
                var toReplace = "";
                for(var i = 0; i < loopLength; i++) {
                    toReplace += addIndexToLabels(forContent, iterable, i);
                }
                var newHTML = document.body.innerHTML.replace(loop + forContent + "{{/for}}", toReplace);
                document.body.innerHTML = newHTML;
            }, getContentInsideFor(text, index + loop.length));
        }
    }
    
    function init() {
        return {
            loadData : function(conceptURL, callback) {
                $.get(conceptURL, function(fileContent) {
                    var concept = JSON.parse(fileContent);
                    expandLoops(concept);
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

