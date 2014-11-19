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
