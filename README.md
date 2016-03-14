#WiBAF: Within Browser Adaptation Framework

[TOC]

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
