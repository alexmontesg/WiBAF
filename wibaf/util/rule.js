/**
 * Represents a privacy rule
 * 
 * @param {String} name
 * @param {Object} value
 * @param {Object} filters
 * @author Alejandro Montes Garcia
 */
var Rule = function(name, value, filters) {
    this.name = name;
    this.value = value;
    this.filters = filters;
};

Rule.prototype.checkIfApplies = function(data) {
    // TODO Check if data matches filters
};