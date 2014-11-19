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
		var feature = featuresArray[i].toLowerCase().split(":");
		if (feature.length === 2) {
			features[feature[0].trim()] = feature[1].trim();
		} else {
			console.warn("Invalid feature detected: " + featuresArray[i]);
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
	userModel.getInstance().update(formId, (correct / total).toFixed(2));
	return false;
}