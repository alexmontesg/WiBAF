#WiBAF: Within Browser Adaptation Framework

##Introduction

The world wide web is an enormous hyperspace where users face the problem of information overload. Adaptive web based systems try to tackle this problem by displaying only the information that is really meaningful for the user. These systems need to collect data from the user in order to personalize the information. The set of information that the system has collected about a user is called the User Model.

User models in adaptive web base systems are typically stored on the server. However, this has some issues such as lack of privacy, server overload, band-width usage, limitation of events that can be tracked, lack of context awareness, etc... To solve this problem, some client side approaches have also been proposed. Still, client based user modeling has some other drawbacks. Typically the user has to install some piece of software, like a desktop application or a browser plugin, and techniques that rely on the comparison of several user profiles cannot be applied. P2P networks allow the analysis of several client user profiles at a time, but in that case the result will depend on the peers connected at the moment when the comparison is being performed.

WiBAF aims to balance these two approaches in a way that the advantages of both are maximized and the drawbacks minimized.

##Documentation
WiBAF has been designed for making it easy to develop adaptive web applications for people who already know how to develop web applications. In this tutorial we assume that you have some basic knowledge of HTML and CSS.

The first step is to link the `wibaf.js` file in the html and initialize it this can be done inserting following code before `</body>`:

    <body>
        ...
        <!-- Notice that wibaf.js depends on jQuery -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
        <script type="text/javascript" src="wibaf.js"></script>
        <script>
            ( function() {
                wibaf.getInstance().init(function() {
                    <!-- Code to be executed after the adaptation -->
                });
            }());
        </script>
    </body>
Once `wibaf.js` is linked to the webpage, the adaptation and user model have to be defined. Optionally, the domain model can be defined as well. In the next sections we will see how.

###Adaptation Model
The Adaptation Model consists of the rules that the adaptation will follow, i.e. the behaviour that the adaptation engine should have. The adaptation model also takes charge of what kind of users and in which contexts the adaptation will be defined.

In this tutorial we distinguish two sections namely, targeting and defining rules:
####Targeting
Targeting nodes is done with [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started/Selectors). Optionally, users and contexts can be also targeted. This is done using a syntax similar to the one used in [Media queries](https://developer.mozilla.org/es/docs/CSS/Media_queries).

    @user(art-knowledge-gt: 50 and art-knowledge-lt: 75) {
        #artworks {
            # Rules
        }
    }
Users can be targeted using `@user` . Several features can be specified between the parenthesis always separated by the keyword `and`. If all the features are correct, the code inside this targeting rule will be executed.

The user model is queried to check if the features are correct. WiBAF will check in the User Model for the value of the feature with the name that the developer specifies. If the feature is numeric, the `-lt` and `-gt` prefixes can be used before the name of a feature to check if the value in the User Model is lower or greater than the specified in the Adaptation Model.

    @context(date: 15/09/2014) {
        #artworks {
            # Rules
        }
    }

Context are targeted the same way as users. The only exception is that the number of features that can be specified is limited to the following set:

 - `min-hour: HH.MM` / `max-hour: HH.MM` : Hour in which the adaptation will start/stop to be executed.
 - `date: DD/MM/YYYY` : Date in which the adaptation will be executed.
 - `min-date: DD/MM/YYYY` / `max-date: DD/MM/YYYY` : Date in which the adaptation will start/stop to be executed.
 - `weekday: su|m|tu|w|th|f|sa` : Days of the week separated by semicolons ( ; ) in which the adaptation will be executed.
 - `centre: X.XXX;Y.YYY` : A point on the Earth in which the adaptation effect will be provided.
 - `radius: X.XX m|km|ft|mi` : How far a user can be from the previous point.

Support for extra features can be added in the `ContextHelper.js` file.

    @context(centre: 54.448;5.451 and radius: 5km) {
       @user (art-knowledge-gt: 50) {
          #artworks {
             # Rules
          }
       }
    }

If some rules are to be applied only for specific contexts **and** specific users, the selections of users and contexts can be nested.

    @user (knowledge-gt: 50), @context (max-hour: 18:00) {
      #artworks {
         # Rules
      }
    }

If some rules are to be applied only for specific contexts **or** specific users, the selections of users and contexts can be separated by commas.

####Adaptation rules
Once the DOM nodes (and optionally users and contexts) are targeted, it is the time to define the adaptation rules to achieve the desired adaptation effect. This is also done with CSS syntax i.e. `property: value;`. Any [CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference) is valid. However these have some limitations, that is why we are extending this list of properties with the ones shown in the following table:

Property Name | Possible Values | Description
----------|----------|----------
`add-class`|class|Adds the specified class to the selected nodes.
`append`|HTML code or a url preceeded by `url:` that contains a valid HTML code|Appends HTML code to the selected node.
`check_prerequisites`|prerequisiteSelector, suffix|For each node selected by prerequisiteSelector, checks if its textual content + suffix has been accessed and if so it is removed.
`delete-class`|class|Deletes the specified class from the selected nodes.
`delete-node`|boolean|Deletes the selected node, the boolean indicate whether the content inside the node should be kept (`true`) or deleted (`false`).
`insert`|HTML code or a url preceeded by `url:` that contains a valid HTML code|Similar to `append`, but it replaces the previous content of the node.
`insert-um`|Name of the user model variable|Inserts the user model value of the specified variable in the selected node.
`reorder-nodes`|Nodes reordering strategy|Reorders the subnodes of the selected node according to a strategy.
`stretchtext`|Integer, handlerMore, handlerLess, classname, hashAnchor|Applies stretchtext to the selected node. It takes one number of characters to show in the first parameter, then it requires two handlers in which the user can click to expand or contract the rest of the content. It also requires a classname to add to the hidden content so that the system can automatically hide/show it. Finally it needs the hash part of the url that will be linked by the handler.
`trim-at`|Integer|Trims the text contained in the node at a specified position.
`update-attribute`|attr, val|Sets the attribute named `attr` to be equal to `val` in the selected node.

The following table explains the reordering strategies implemented so far.

Strategy Name | Description
----------|----------
`data-order`|Reorders using a numeric value specified in the data-order attribute of the elements to be reordered. Notice that the [data-* attributes](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_data_attributes) are valid for every element since HTML5.

####Other important considerations
After the adaptation file has been defined, it has to be linked to the HTML. To do so the following line has to be added before `</head>`

    <head>
        ...
        <link href="adaptation.amf" rel="prefetch" type="text/amf" />
        ...
    </head>
Several adaptation files could be linked to one webpage. As with CSS, they would be interpreted in order.

The adaptation files are cached by the browser. Keep it in mind when you are developing, if you make any changes and they do not appear when you refresh the webpage, you can refresh or clear the cache.

Javascript code can be inserted into the adaptation file. To do so it should be placed between curly brackets and with a hash as a prefix. The code will be executed before the interpretation of the file starts and the fragment code will be replaced for its result.

    @user(#{document.title.replace(/\s+/g, "-").replace(/[\.\(\);;,\"]/g, "").trim().toLowerCase()}-accessed-lt: 2) {
        # Code
    }
This code would be interpreted in a page with title *Hello world* as

    @user(hello-world-accessed-lt: 2) {
        # Code
    }

###User Model
To create a user model, a different file is used. To express how the user model should be built, a extended subset of [DiMML](http://www.dimml.io/) is used. In this tutorial we will distinguish two parts namely, event definition and event operations.
####Event definition
The most basic definition of an event will consist on the keyword `event` followed by the javascript code to select where the event will be applied and the name of the event.

    event simple_click = `document.getElementsByTagName('button').click`
Sometimes, the value of a variable has to be collected, in the code below we show how to capture, for instance, the id of the clicked button.

    event collection_click = `document.getElementsByTagName('button').click` => `{btn_id: this.id}`
Finally, conditional execution of events can also be specified if and only if no variables are collected. This is done as shown in the code below (notice that there are no curly brackets).

    event condition_click = `document.getElementsByTagName('button').click` => `this.id == 'button1'`
####Event operations
After a event is defined, the operations that should be done when such event is triggered can be coded. This is done as shown in the example below.

    on collection_click {
        inc btn_id; # Increments by one the UM variable with the name collected in btn_id
        add #var, 15; # Increments the UM variable named "var" by 15
        sub #var, 15; # Decrements the UM variable named "var" by 15
        dec #var1; # Decrements by 1 the UM variable named "var1"
        update #var2, 2; # Sets to 2 the value of the UM variable named "var2"
        add_obs #var3, 3; # Adds the ovservation 3 to the UM variable named "var3".
                          # The value of "var3" is the average of all the observations.
        init #var4, btn_id, "text", "http://example.com/wibaf", "Feedback", "Group";
            # Initializes the variable named "var4"
            # to the value collected in btn_id".
            # "text" is the type of variable.
            # The url is an identifier.
            # "Feedback" represents feedback given to the user about the variable
            # "Group" is the domain of the variable.
    }
The operation `init` has two alternatives: `init_if_blank`, which will only initialize the variable if it does not exist or `init_update`, which will initialize the variable if it does not exist or update it if it does. In real applications, you will prefer `init_if_blank` or `init_update` over `init` because of its more expressive power.

####Other important considerations
After the user modelling file has been coded, it has to be linked to the HTML. To do so the following line has to be added before `</head>`

    <head>
        ...
        <link href="modelling.umf" rel="prefetch" type="text/umf" />
        ...
    </head>

As it happened with adaptation files, several adaptation files could be linked to one webpage and those would be interpreted in order.

If a `document.load` event is defined, this will be executed as soon as possible, but its execution is not guaranteed to finish before the adaptation starts. However, if you need to keep track of the accessed webpages, you do not need to do it in the user modelling file, as this is done automatically by `wibaf.js` , and it is guaranteed to be updated before the adaptation starts.

The user model is stored in the IndexedDB of your browser or in the local storage if IndexedDB is not supported. You can check it at everytime using your browser's developer tools.

The modelling file is cached by the browser. Keep it in mind when you are developing, if you make any changes and they do not appear when you refresh the webpage, you can refresh or clear the cache.

###Domain Model
The definition of a domain model is not yet fully developed, nor in functionality neither integrated with `wibaf.js`. If you take a look at the milkyway example, you can see all the functionality that is currently implemented but we pretend to go further.

To express the domain model any JSON file would work for now. However, you are encouraged to use [JSON-LD](http://www.w3.org/TR/json-ld/) as it extends the capabilities of JSON and is recommended by the [W3C](http://www.w3.org/).

In the HTML template you can use `{{JSON_key}}`. This will be replaced by the value of that key in the JSON file. If that value is a URL to another jsonld file, you can use the . operator to access to a property of that jsonld file, for instance `parent.title`.

Conditional fragments are also allowed as well as the operators `!` , `==` , `!=` , `&gt;` and `&lt;` . The following piece of code will check if the key `description_advanced` exists. If it does it will be inserted, otherwise the key `description` will be placed. Notice the question mark before the curly brackets to open the condition and the slash and question mark to close it.

    {{?description_advanced}}
        {{description_advanced}}
    {{/?description_advanced}}
    {{?!description_advanced}}
        {{description}}
    {{/?description_advanced}}

Similarly, loops can be inserted using a hash simbol instead of a question mark. They have the limitation of being only possible to iterate over lists of URLs to other jsonld files. The tags inside a loop will refer to the jsonld file contained in the list, not to the global one. The code below will create a list with the titles of the jsonld files contained in the list `hasPart`.

    <ul>
        {{#hasPart}}
            <li>{{title}}</li>
        {{/#hasPart}}
    </ul>

It is intended loops and conditions could be nested in the future. However, this is not yet possible with the exception of nesting a loop inside of a condition.

For the domain model to be loaded you will need to specify the path to the jsonld file (without the file extension) and call the function `fill_from_dm`. In this function you can also specify what to do after the data from the domain has been loaded in the template. Usually, it is interesting to initialize `wibaf.js` in this point and not before. If you take a look at the milkyway example there is more code, which is used to create the reading data from another file. However, the simplest piece of code to initialize `wibaf.js` when using templates is the following one.

    <body>
        ...
        <!-- Notice that wibaf.js depends on jQuery -->
        <script type="text/javascript" src=//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
        <script type="text/javascript" src="wibaf.js"></script>
        <script>
            ( function() {
                fill_from_dm(concept, function() {
                    wibaf.getInstance().init(function() {
                        <!-- Code to be executed after the adaptation -->
                    });
                }
            }());
        </script>
    </body>
