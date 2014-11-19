/**
 * Class that checks context variables
 * 
 * @author Alejandro Montes Garcia
 */
var ContextHelper = function() {
	var h, min, year, month, day, lat, lon, r;

	function setDate(date) {
		h = date.getHours();
		min = date.getMinutes();
		year = date.getFullYear();
		month = date.getMonth() + 1;
		day = date.getDate();
	}

	function resetPosition() {
		lat = -1;
		lon = -1;
		r = 0;
	}

	setDate(new Date());
	resetPosition();

	var contextHelper = {

		checkHour : function(hour) {
			hour = hour.toIntArray(".");
			if (hour.length != 2) {
				console.warn("Invalid hour detected");
				return false;
			}
			return (hour[0] < h || (h === hour[0] && hour[1] < min)) ? "min" : "max";
		},

		checkDate : function(date) {
			date = date.toIntArray("/");
			if (date.length != 3) {
				console.warn("Invalid date detected");
				return false;
			}
			return (date[2] < year || (year === date[2] && date[1] < month) || (year === date[2] && month === date[1] && date[0] < day)) ? "min" : "max";
		},

		min_hour : function(hour) {
			return this.checkHour(hour) === "min";
		},

		max_hour : function(hour) {
			return this.checkHour(hour) === "max";
		},

		date : function(date) {
			date = date.toIntArray("/");
			if (date.length != 3) {
				console.warn("Invalid date detected");
				return false;
			}
			return day == date[0] && month == date[1] && year == date[2];
		},

		min_date : function(date) {
			return this.checkDate(date) === "min";
		},

		max_date : function(date) {
			return this.checkDate(date) === "max";
		},

		weekday : function(days) {
			var validWeekdays = ["su", "m", "tu", "w", "th", "f", "sa"];
			var weekdays = days.split(";");
			for (var i = 0; i < weekdays.length; i++) {
				if (validWeekDays.indexOf(weekdays[i].toLowerCase().trim()) === this.d.getDay()) {
					return true;
				}
			}
			return false;
		},

		centre : function(coords) {
			coords = coords.split(";");
			lat = parseFloat(coords[0]);
			lon = parseFloat(coords[1]);
			return true;
		},

		radius : function(rad) {
			var radArr = rad.match(/(\d+)(\.\d+)?\s?(\w+)?/);
			var units = radArr[3] ? radArr[3] : "km";
			var value = radArr[2] ? parseFloat(radArr[1] + radArr[2]) : parseFloat(radArr[1]);
			r = toKm(value, units);
			return true;
		},
		
		getLat : function() {
			return lat;
		},
		
		getLon : function() {
			return lon;
		}, 
		getR : function() {
			return r;
		}
	};

	return {
		execute : function(name) {
			return contextHelper[name] && contextHelper[name].apply(contextHelper, [].slice.call(arguments, 1));
		}
	};
};
