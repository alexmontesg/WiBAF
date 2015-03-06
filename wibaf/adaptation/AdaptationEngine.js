/**
 * Class that applies wibaf rules, provides methods {hasRule} and {execute}
 * 
 * @author Alejandro Montes Garcia
 */
var AdaptationEngine = function() {
	function getContent(arg) {
		var div = $("<span>", {
			class : "wibafGenerated"
		});
		if (isUrl(arg)) {
			arg = arg.substring(4, arg.length);
			$.get(arg, function(content) {
				div.html(content);
			});
		} else {
			div.html(arg);
		}
		return div;
	}
	
	var adaptationEngine = {
	    /**
         * Inserts HTML code in the selected node (deletes the previous content).
         * 
         * @param {Object} selector
         * @param {Object} arg - A string with valid html or a url preceded by 'url:' where the code can be retrieved
         */
		insert : function(selector, arg) {
			$(selector).html(getContent(arg));
		},
		
		/**
         * Inserts the user model value of the specified variable in the selected node
         * 
         * @param {Object} selector
         * @param {Object} arg - Name of the user model variable
         */
		insert_um : function(selector, arg) {
			userModel.getInstance().get(arg, function(item) {
				$(selector).html(item.value);
			});
		},
		
        /**
         * Appends HTML code to the selected node.
         * 
         * @param {Object} selector
         * @param {Object} arg - A string with valid html or a url preceded by 'url:' where the code can be retrieved
         */
		append : function(selector, arg) {
			$(selector).append(getContent(arg));
		},
		
		/**
		 * Reorders links in the selected list according to a strategy
		 * 
         * @param {Object} selector
         * @param {Object} arg - strategy
		 */
		reorder_links : function(selector, arg) {
			// TODO Implement
		},
		
        /**
         * Reorders nodes across a second selector according to a strategy
         * 
         * @param {Object} selector
         * @param {Object} arg - in the format '"secondSelector" strategy' (without the single quotes)
         */
		reorder_across : function(selector, arg) {
			var strategies = {
				data_order : function(across, selector) {
					var nodes = [];
					var unorderedNodes = [];
					var acrossSize = [];
					$(across).each(function(index) {
						acrossSize[index] = $($(across)[index]).children(selector).length;
					});
					$(across).children(selector).each(function(index) {
						if ($(this).data("order")) {
							nodes[parseInt($(this).data("order")) - 1] = this.outerHTML;
						} else {
							unorderedNodes.push(this.outerHTML);
						}
					});
					$(across + " " + selector).remove();
					var i = 0;
					var total = $(across).length;
					nodes.forEach(function(item) {
						while ($($(across)[i % total]).children(selector).length == acrossSize[i % total]) {
							i++;
						}
						$(across)[i % total].innerHTML += item;
						i++;
					});
					unorderedNodes.forEach(function(item) {
						while ($($(across)[i % total]).children(selector).length == acrossSize[i % total]) {
							i++;
						}
						$(across)[i % total].innerHTML += item;
						i++;
					});
				}
			};
		
			arg = arg.split("\"");
			var strategy = arg[2].trim().toLowerCase().replace(/-/g, "_");
			if(strategies[strategy]) {
				strategies[strategy].apply(strategies, [arg[1].trim(), selector]);
			}
		},
		
		/**
         * Reorders the subnodes of the selected node according to a strategy
         * 
         * @param {Object} selector
         * @param {Object} arg - the strategy
         */
		reorder_nodes : function(selector, arg) {
			var strategies = {
				data_order : function(selector) {
					for (var i = 0; i < $(selector).length; i++) {
						var nodes = [];
						var unorderedNodes = [];
						$($(selector)[i]).children().each(function(index) {
							if ($(this).data("order")) {
								nodes[parseInt($(this).data("order")) - 1] = this.outerHTML;
							} else {
								unorderedNodes.push(this.outerHTML);
							}
						});
						var html = "";
						nodes.forEach(function(item) {
							html += item;
						});
						unorderedNodes.forEach(function(item) {
							html += item;
						});
						$($(selector)[i]).html(html);
					}
				}
			};
			
			var strategy = arg.trim().toLowerCase().replace(/-/g, "_");
			if(strategies[strategy]) {
				strategies[strategy].apply(strategies, [selector]);
			}	
		},
		
		/**
		 * Trims the selected text at a position
         * @param {Object} selector
         * @param {Object} arg - position
		 */
		trim_at : function(selector, arg) {
			$(selector).text($(selector).text().trim().slice(0, parseInt(arg)));
		},
		
		/**
         * Sets the degree-of-interest of the selected nodes
         * @param {Object} selector
         * @param {Object} arg - degree-of-interest
         */
		fisheye_doi : function(selector, arg) {
			// TODO Implement
		},
		
		/**
         * Updates the attribute of the selected nodes
         * @param {Object} selector
         * @param {Object} arg - attribute_name, new_value
         */
		update_attribute : function(selector, arg) {
			arg = arg.split(",");
			$(selector).attr(arg[0].trim(), arg[1].trim());
		},
		
		/**
         * Deletes the selected node
         * @param {Object} selector
         * @param {Object} arg - if true, keeps the content inside the node
         */
		delete_node : function(selector, arg) {
			if (arg.trim().toLowerCase() !== "true") {
				while($(selector).length > 0){
					$($(selector)[0]).replaceWith($($(selector)[0]).html());
				}
			} else {
				$(selector).remove();
			}
		},
		
		/**
         * Inserts a test in the selected node
         * @param {Object} selector
         * @param {Object} arg - url_to_the_questions number_of_questions user_model_variable submit_button_text;
         */
		insert_test : function(selector, arg) {
			var createAnswer = function(q, a, answer, type) {
				var div = document.createElement("div");
				div.className = "answer";
				var inputId = "q" + q + "a" + a;
				div.appendChild(createElement("input", {
					"name" : "question" + q,
					"type" : type,
					"data-correct" : answer.c,
					"data-feedback" : answer.f,
					"id" : inputId
				}));
				div.appendChild(createElement("label", {
					"for" : inputId
				}, answer.t));
				return div;
			};
		
			arg = arg.split(" ");
			$.post(arg[0].trim(), {
				n : parseInt(arg[1].trim())
			}, function(data) {
				var form = createElement("form", {
					"id" : arg[2].trim()
				});
				for (q in data) {
					var div = document.createElement("div");
					div.className = "question";
					var txt = document.createElement("p");
					txt.innerText = data[q].t;
					div.appendChild(txt);
					var multi = false;
					var one = false;
					for (a in data[q].a) {
						if(data[q].a[a].c && one) {
								multi = true;
								break;
						} else if(data[q].a[a].c) {
								one = true;
						}
					}
					for (a in data[q].a) {
						var type = multi ? "checkbox" : "radio";
						div.appendChild(createAnswer(q, a, data[q].a[a], type));
					}
					if(q != 0) {
						form.appendChild(document.createElement("hr"));
					}
					form.appendChild(div);
				}
				form.appendChild(createElement("a", {
					"id" : "button" + arg[2].trim(),
					"href" : "#",
					"class" : "button",
					"onclick" : "correctTest('" + arg[2].trim() + "');"
				}, arg[3].trim()));
				$(selector).append(form);
			});
		}
	};

	return {
		execute : function(name) {
			return adaptationEngine[name] && adaptationEngine[name].apply(adaptationEngine, [].slice.call(arguments, 1));
		},
		hasRule : function(name) {
		    return adaptationEngine[name] !== undefined;
		}
	};

};