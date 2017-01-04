

'use strict';
const avyGetter = require('./AvyGetter.js')
var AlexaSkill = require('./AlexaSkill'),
    recipes = require('./recipes');
var APP_ID =undefined;
//var APP_ID = 'amzn1.ask.skill.a94dda69-78b0-4728-a663-1b2b067c93b5'; //OPTIONAL: replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

/**
 * JacksonHoleInfo is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HowTo = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HowTo.prototype = Object.create(AlexaSkill.prototype);
HowTo.prototype.constructor = HowTo;

HowTo.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = "Welcome to  Jackson Hole Information and Activities. You can ask a question like, is the pass open?  what's the avalanche danger? What's the avalance report? ... Now, what can I help you with.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";
    response.ask(speechText, repromptText);
};

HowTo.prototype.intentHandlers = {
    "JacksonHoleMountainIntent": function (intent, session, response) {
        var avalancheReportSynonyms=['avy', 'avalanche','avi'];
        var avalancheDangerSynonyms=['avy danver', 'avalanche danger','avi danger','danger'];
        var temperatureSynonyms=['temp', 'temperature'];
        
        var placeSlot = intent.slots.Place,
            itemName,
            isPlace = false;
        if (placeSlot && placeSlot.value){
            itemName = placeSlot.value.toLowerCase();
            isPlace=true;
        }
        var replortSlot = intent.slots.ReportType;
        if (replortSlot && replortSlot.value){
            itemName = replortSlot.value.toLowerCase();
            isPlace=false;
        }   
        var cardTitle = "Recipe for " + itemName,
            recipe = recipes[itemName],
            speechOutput,
            repromptOutput;
        if(avalancheReportSynonyms.indexOf(itemName) > -1){
          avyGetter.getAvyReport("avyreport", function(report){

                cardTitle = "Avalanche Report",
                recipe = report,
                speechOutput,
                repromptOutput;

                speechOutput = {
                    speech: recipe,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.tellWithCard(speechOutput, cardTitle, recipe);
            });

        }
        else if(avalancheDangerSynonyms.indexOf(itemName) > -1){
          avyGetter.getAvyReport("avyDanger", function(report){

                cardTitle = "Avalanche Danger Report",
                recipe = report,
                speechOutput,
                repromptOutput;

                speechOutput = {
                    speech: recipe,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.tellWithCard(speechOutput, cardTitle, recipe);
            });

        }
        else if(temperatureSynonyms.indexOf(itemName) > -1){
          avyGetter.getTemperatureReport("temp", function(report){

                cardTitle = "Mountain Temperature Report",
                recipe = report,
                speechOutput,
                repromptOutput;

                speechOutput = {
                    speech: recipe,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.tellWithCard(speechOutput, cardTitle, recipe);
            });

        }
        else if(itemName === "snow"){
          avyGetter.getAvyReport("snow", function(report){

                cardTitle = "Local Jackson Hole Snowfall Report",
                recipe = report,
                speechOutput,
                repromptOutput;

                speechOutput = {
                    speech: recipe,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.tellWithCard(speechOutput, cardTitle, recipe);
            });

        }
        
        else if(itemName === "weather"){
          avyGetter.getWeatherReport("weather", function(report){

                cardTitle = "Weather Report",
                recipe = report,
                speechOutput,
                repromptOutput;

                speechOutput = {
                    speech: recipe,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.tellWithCard(speechOutput, cardTitle, recipe);
            });

        }
        else if (recipe) {
            speechOutput = {
                speech: recipe,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.tellWithCard(speechOutput, cardTitle, recipe);
        } else {
            var speech;
            if (itemName) {
                speech = "I'm sorry, I currently do not know the report for " + itemName + ". What else can I help with?";
            } else {
                speech = "I'm sorry, I currently do not know that report. What else can I help with?";
            }
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            repromptOutput = {
                speech: "What else can I help with?",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.ask(speechOutput, repromptOutput);
        }
    },
 "JacksonHoleRoadIntent": function (intent, session, response) {
        var itemSlot = intent.slots.Road,
            itemName,
            isItem = false;
        if (itemSlot && itemSlot.value){
            itemName = itemSlot.value.toLowerCase();
            isItem=true;
        } 
        var cardTitle = "Recipe for " + itemName,
            recipe = recipes[itemName],
            speechOutput,
            repromptOutput;
          avyGetter.getPassReport(itemName, function(report){

                cardTitle = "Road Report for the " + itemName,
                recipe = report,
                speechOutput,
                repromptOutput;

                speechOutput = {
                    speech: recipe,
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.tellWithCard(speechOutput, cardTitle, recipe);
            });
      
    },

    
 "JacksonHoleMovieIntent": function (intent, session, response) {
      
            response.tell("I'm sorry.  The feed is currently offline.");
      
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask questions such as, is the pass open, or, what is the temperature report, or, you can say exit... Now, what can I help you with?";
        var repromptText = "You can say things like, what's the avalanche danger, or you can say exit... Now, what can I help you with?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
};

/**
 * Function to handle the onLaunch skill behavior
 */

function getAvalancheForecast() {
    var advisory="";
    var forecastPage = "http://www.jhavalanche.org/viewTeton";
    nightmare(forecastPage)
    .then($ => {
        // your code goes here
        var advisoryText = $("div.forecast-element:contains('GENERAL AVALANCHE')").text();
        advisory = advisoryText.replace("GENERAL AVALANCHE ADVISORY", "");
    });
    return advisory;
    
}

exports.handler = function (event, context) {
    var howTo = new HowTo();
    howTo.execute(event, context);
};
