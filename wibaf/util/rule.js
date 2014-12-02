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
    // TODO Check if data matches filters
};