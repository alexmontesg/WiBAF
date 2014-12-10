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
    return this.value.domain && this.value.domain.toLowerCase() === data.domain.toLowerCase();
};