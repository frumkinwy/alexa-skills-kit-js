
'use strict';

var request = require('request');
var cheerio = require('cheerio');
var http = require('http');

var Wrapper = function(){
  this.forecastPage = "http://jhavalanche.org/viewTeton?template=teton_print.tpl.php";
  this.closurePage = "http://www.wyoroad.info/pls/Browse/WRR.CLOSURES";
  this.mountainWeather = "http://www.mountainweather.com/";
  this.init();
};
Wrapper.prototype.init = function(){
 
}

Wrapper.prototype.getPassReport = function(reportType, callback) {
  var advisory="";
    var pm =new Promise((resolve, reject) => { 
        request(this.closurePage, function (error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                var bodyText = $('body').text();
                if(bodyText.indexOf('Closure Reason')< 1){
                    resolve( "WYDOT IS DOWN");
                }
                else{
                    let openText="";
                    let advisoryText=""
                    let elem;
                    if(reportType=="canyon"){
                        elem=$("td.closurelocation:Contains(Between Alpine Jct and Hoback Jct)");
                    }
                    else{
                        elem=$("td.closurelocation:Contains(Wilson and the Idaho State Line)");
                    }
                    try{
                        openText = elem.next().html().replace("Road", "");
                        advisoryText= elem.next().next().html();
                        let isOpen = openText.indexOf("Open") > 0;

                        let reportText = "The " + reportType + " is " + openText + ".  It has " + advisoryText;
                        if(isOpen){
                            reportText = "Yes. " + reportText;
                        }
                        else{
                            reportText = "No. " + reportText;
                        }
                        resolve(reportText);
                    }
                    catch(e){
                        resolve("There was a problem reaching the Wyoming Department of Transportation. Sorry.");
                    }
                }


            }
        });
    });
    pm.then(value => {
    advisory = value;
    callback( value);
    // Work has completed successfully,
    // promise has been fulfilled with "value"
});

pm.catch(reason => {
    advisory= "error";
    callback("error");
    // Something went wrong,
    // promise has been rejected with "reason"
});
return;
}
Wrapper.prototype.getWeatherReport = function(reportType, callback) {
  var advisory="";
    var pm =new Promise((resolve, reject) => { 
        request(this.mountainWeather, function (error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                var bodyText = $('body').text();
                if(bodyText.indexOf('Weather in the Mountains')< 1){
                    resolve( "Can't get the weather sorry.");
                }
                else{
                    let openText="";
                    let advisoryText=""
                    let elem;
                
                        elem=$("div.gCAST_today_ql");
                
                    try{
                        openText = elem.text();
              
                        resolve(openText);
                    }
                    catch(e){
                        resolve("There was a problem reaching the Weather Page.");
                    }
                }


            }
        });
    });
    pm.then(value => {
    advisory = value;
    callback( value);
    // Work has completed successfully,
    // promise has been fulfilled with "value"
});

pm.catch(reason => {
    advisory= "error";
    callback("error");
    // Something went wrong,
    // promise has been rejected with "reason"
});
return;
}

Wrapper.prototype.getAvyReport = function(reportType, callback) {
  var advisory="hoisted";
    var pm =new Promise((resolve, reject) => { 
        request(this.forecastPage, function (error, response, html) {
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                var bodyText = $('body').text();
                if(bodyText.indexOf('Forecast not found')> 0){
                    resolve( "no forecast yet.  go back to sleep");
                }
                else{
                    if(reportType==="avyDanger"){
                        var highMorning = $("table.mtnWeather td:Contains(High)").next().text().split('-')[1].replace(/ /g,'');
                        var highAfternoon = $("table.mtnWeather td:Contains(High)").next().next().text().split('-')[1].replace(/ /g,'');;
                        var midMorning= $("table.mtnWeather td:Contains(Mid)").next().text().split('-')[1].replace(/ /g,'');;
                        var midAfternoon = $("table.mtnWeather td:Contains(Mid)").next().next().text().split('-')[1].replace(/ /g,'');;
                        var highText = "It is " + highMorning;
                        if( highMorning !== highAfternoon){
                            highText += " in the morning and " + highAfternoon + " in the afternoon above 9000 feet. "
                        }
                        else{
                            highText += " all day above 9000 feet. ";
                        }
                        highText += "Below 9000 feet it is " + midMorning
                        if( midMorning !== midAfternoon){
                            highText += " in the morning and " + midAfternoon + " in the afternoon."
                        }
                        else{
                            highText += " all day long.";
                        }
                        resolve(highText);
                    }
                    else if(reportType==="snow"){
                        var snowRaymer=$("table.mtnWeather td:Contains(Raymer Plot)").next().text().split('/')[0].replace(/ /g,'').replace(/"/g,' inches');
                        var snowToday = $("table.mtnWeather td:Contains(Snowfall Expected)").next().text().replace(/ /g,'');
                        var highText = "There were  " + snowRaymer + " of snow at the Raymer Plot over the last 24 hours. There is " + snowToday + " inches expected today";
                        resolve(highText);
                    }
                    else{
                    var advisoryText = $("div.forecast-element:contains('GENERAL AVALANCHE ADVISORY')").text();
                    //console.log("cheer");
                    resolve( advisoryText.replace("GENERAL AVALANCHE ADVISORY", ""));

                    }
                }
            }
            else{
                    resolve("generally bad stuff");
            }
        });
    });

pm.then(value => {
    advisory = value;
    callback( value);
    // Work has completed successfully,
    // promise has been fulfilled with "value"
});

pm.catch(reason => {
    advisory= "error";
    callback("error");
    // Something went wrong,
    // promise has been rejected with "reason"
});
return;
}


Wrapper.prototype.getTemperatureReport = function(reportType, callback) {

    var pm =new Promise((resolve, reject) => { 

    var url = 'http://jhweather.com/ajax/get-weather-stations.cfm';
    var resp="";
    http.get(url, function(res){
        var body = '';

        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            var weatherReport = JSON.parse(body);
            resp = StationReport(weatherReport.stations[0]) + StationReport(weatherReport.stations[2]) + StationReport(weatherReport.stations[5]) + StationReport(weatherReport.stations[11]);
            console.log("received " + resp);
            resolve(resp);
        });
        }).on('error', function(e){
            //console.log("Got an error: ", e);
            reject( "error reaching forecast");
        });
    });
    
pm.then(value => {
    callback( value);
    console.log("Work has completed successfully,");
    // promise has been fulfilled with "value"
});

pm.catch(reason => {
    callback("error");
    // Something went wrong,
    // promise has been rejected with "reason"
});
return;

}
var StationReport = function(stationInfo){
    let resp="";
    if(stationInfo.latestObs.vals.staqual ==="OK"){
        resp = "At " + stationInfo.name.replace("JACKSON HOLE-", "").replace("Jackson, ", "The ") + " it is " + stationInfo.latestObs.vals.t + " degrees";
        if(typeof stationInfo.latestObs.vals.wchl !== "undefined"){
            resp += " with a wind chill of " + String(stationInfo.latestObs.vals.wchl).replace('-', "minus ");
        } 
        resp += ". "
    }
    return resp;
}
module.exports =new Wrapper();


