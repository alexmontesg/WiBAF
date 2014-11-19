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
