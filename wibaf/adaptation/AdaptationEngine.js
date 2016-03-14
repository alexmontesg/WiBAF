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
         * Inserts the user model value of the specified variable in the selected node
         * 
         * @param {Object} selector
         * @param {Object} arg - domain col_separator
         */
        insert_um_table : function(selector, arg) {
            arg = arg.split(" ");
            userModel.getInstance().getDomain(arg[0], arg[1], function(items) {
                var table = $(selector)[0];
                for(var i = 0; i < items.length; i++) {
                    var row = table.insertRow(-1);
                    var item = items[i];
                    for(var j = 0; j < item.value.length; j++) {
                        var cell = row.insertCell(-1);
                        cell.innerHTML = item.value[j];
                    }
                }
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
                                nodes[parseInt($(this).data("order")) - 1] = this;
                            } else {
                                unorderedNodes.push(this);
                            }
                        });
                        $($(selector)[i]).empty();
                        nodes.forEach(function(item) {
                          $($(selector)[i]).append(item);
                        });
                        unorderedNodes.forEach(function(item) {
                          $($(selector)[i]).append(item);
                        });
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
		
		stretchtext : function(selector, arg) {
            args = arg.split(',');
            amount = parseInt(args[0].trim());
            handlerMore = args[1].trim();
            handlerLess = args[2].trim();
            classname = args[3].trim();
            hashAnchor = args[4].trim();
            var item = $(selector)[0];
            if(!item || item.children.length == 0) {
                return;
            }
            var children = item.children;
            for(var i = 0; i < children.length; i++) {
                var classNameToAdd = 'wibaf-stretchtext-' + classname;
                if(children[i].classList.contains(classNameToAdd) || children[i].classList.contains('wibaf-short-stretchtext-' + classname)) {
                    return;
                } else if(children[i].className.length > 0) {
                    classNameToAdd = ' ' + classNameToAdd;
                }
                children[i].className = children[i].className + classNameToAdd;
                children[i].style.display = 'none';
            }

            var shortText = $(selector).text();
            while (shortText.charAt(amount) != ' ') {
                amount++;
            }
            amount++;
            shortText = shortText.trim().slice(0, amount);
            var p = document.createElement('p');
            p.className = 'wibaf-short-stretchtext-' + classname;
            p.innerHTML = shortText;
            var a = document.createElement('a');
            a.setAttribute('data-altText', handlerLess);
            a.setAttribute('data-handlerFor', classname);
            a.innerHTML = handlerMore;
            a.href = '#' + hashAnchor;
            a.onclick = function() {
                var items = document.getElementsByClassName('wibaf-stretchtext-' + this.dataset.handlerfor);
                var shortItem = document.getElementsByClassName('wibaf-short-stretchtext-' + this.dataset.handlerfor)[0];
                if(items[0].style.display == 'none') {
                    for(var i = 0; i < items.length; i++) {
                        items[i].style.display = '';
                    }
                    shortItem.style.display = 'none';
                } else {
                    for(var i = 0; i < items.length; i++) {
                        items[i].style.display = 'none';
                    }
                    shortItem.style.display = '';
                }
                altText = this.dataset.alttext;
                a.setAttribute('data-altText', this.innerHTML);                
                this.innerHTML = altText;
            };
            $(selector).append(p);
            $(selector).append(a);
        },
        
        slide_view : function(selector, arg) {
            var nodes = [];
            var slides = arg.split(",");
            slides.forEach(function(val) {
                var node = $(selector + " #" + val.trim());
                if (node.length === 1) {
                    nodes.push(node);
                }
            });
            nodes.forEach(function(val, i) {
                if(nodes[i - 1]) {
                    val.hide();
                    if(val.children('.wibaf_slide_link_.prev').length === 0) {
                        val.append("<a href='#" + nodes[i - 1].attr('id') + "' class='wibaf_slide_link_ prev'>Previous</a>");
                    }
                }
                if(nodes[i + 1]) {
                    if(val.children('.wibaf_slide_link_.next').length === 0) {
                        val.append("<a href='#" + nodes[i + 1].attr('id') + "' class='wibaf_slide_link_ next'>Next</a>");
                    }
                }
            });
            $('.wibaf_slide_link_').click(function() {
                nodes.forEach(function(val) {
                    val.hide();
                });
                $($(this).attr('href')).show();
            });
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
        
        add_class : function(selector, arg) {
            $(selector).addClass(arg.trim());
        },
        
        delete_class : function(selector, arg) {
            $(selector).removeClass(arg.trim());
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
		
        check_prerequisites : function(selector, arg) {
            arg = arg.split(",");
            selector = selector.trim();
            sel = arg[0].trim();
            suffix = arg[1].trim();
            var i = 0;
            $.makeArray($(sel)).forEach(function(link) {
                i++;
                link.id = "pre_req_link-" + i;
                link = $(link);
                linkText = link.text().trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/gmi, "") + suffix + "-accessed";
                userModel.getInstance().get(linkText, function(val, arr) {
                    if(val && val.value > 0) {
                        $("#" + arr[0].trim()).remove();
                        if($(arr[1] + " " + arr[2]).length === 0) {
                            $(arr[1]).remove();
                        }
                    }
                }, [link.attr('id'), selector, sel]);
                
            });
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