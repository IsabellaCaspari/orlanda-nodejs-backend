'use strict';
const
    PATHINDEXFILE = "/opt/src//static/index.html",
    message = require('./res/messages'),
    constance = require('./res/constance'),
    express = require('express'),
    bodyParser = require('body-parser'),
    rp = require('request-promise'),
    app = express().use(bodyParser.json()), // creates express http server
    google = require('googleapis'),
    authorization = require('./authorization'),
    https = require('https'),
    fs = require('fs'),
    moment = require('moment'),
    persistence = require('./persistence');


// Sets server port and logs message on success
app.listen(process.env.PORT || 1335, () => console.log('webhook is listening'));

app.get('/oauth2callback', (req, res) => {
    var code = req.query.code;
    console.log("DER CODE: " + code);
    fs.readFile(PATHINDEXFILE, function(err, html) {
        if (err) {
            if (!fs.existsSync(PATHINDEXFILE)) {
                console.log("File not found");
            }
            throw err;
        }
        res.write(html);
        res.end();
    });

});

app.get('/', (req, res) => {
    console.log("Open webui");
    res.write("Hello, I'm Orlanda :-)");
    res.end();
});

app.post('/webhook', (req, res) => {
    var body = req.body;
    var intentId = req.body.result.metadata.intentId;
    console.log('Die Intentid lautet:' + intentId);

    switch (intentId) {
        case constance.intentId_welcomeEvent:
            welcomeEvent(req, res);
            break;
        case constance.intentID_receiveCode:
            receiveAuthcode(req, res);
            break;
        case constance.intentId_addEvent:
            createGoogleEvent(req, res);
            break;
        case constance.intentID_listEvent:
            listEvents(req, res);
            break;
        default:
            welcomeEvent(req, res);
            break;
    }
});

function welcomeEvent(req, res) {
    var senderId = req.body.originalRequest.data.sender.id;
    persistence.getToken(senderId, function(token) {
        console.log("Token: " + token);
        if (token == undefined) {
            authorization.getAuthUrl(function(authUrl) {
                var response = new Object({
                    speech: message.text.welcomeEvent.speech,
                    displayText: message.text.welcomeEvent.displayText,
                    "data": {
                        "facebook": {
                            "attachment": {
                                "type": "template",
                                "payload": {
                                    "template_type": "generic",
                                    "elements": [{
                                        "title": message.text.welcomeEvent.button.title,
                                        "subtitle": message.text.welcomeEvent.button.subtitle,
                                        "buttons": [{
                                            "type": "web_url",
                                            "url": authUrl,
                                            "title": message.text.welcomeEvent.button.buttonText
                                        }]
                                    }]
                                }
                            }
                        }
                    }
                });
                res.setHeader('Content-Type', 'application/json');
                return res.send(JSON.stringify(response));
            });
        } else {
            console.log(JSON.stringify(token));
            var response = new Object({
                'speech': message.text.comeAgainEvent.speech,
                'displayText': message.text.comeAgainEvent.displayText,
                'messages': [{
                    'title': message.text.comeAgainEvent.quickReplay.title,
                    'replies': [message.text.comeAgainEvent.quickReplay.replie[0].text,
                        message.text.comeAgainEvent.quickReplay.replie[1].text,
                        message.text.comeAgainEvent.quickReplay.replie[2].text
                    ],
                    'type': 2
                }],
            });
            res.setHeader('Content-Type', 'application/json');
            return res.send(JSON.stringify(response));
        }
    });
}

function receiveAuthcode(req, res) {
    var code = req.body.result.resolvedQuery;
    var senderid = req.body.originalRequest.data.sender.id;
    authorization.getToken(code, senderid, function(token) {
        persistence.storeToken(token, function(err) {
            if (err)
                throw err;

            var response = new Object({
                speech: message.text.receiveAuthcode.speech,
                displayText: message.text.receiveAuthcode.displayText,
                'messages': [{
                    'title': message.text.receiveAuthcode.quickReplay.title,
                    'replies': [message.text.receiveAuthcode.quickReplay.replie[0].text,
                        message.text.receiveAuthcode.quickReplay.replie[1].text,
                        message.text.receiveAuthcode.quickReplay.replie[2].text
                    ],
                    'type': 2
                }],
            });
            res.setHeader('Content-Type', 'application/json');
            return res.send(JSON.stringify(response));

        });
    });
}

function createGoogleEvent(req, res) {
    var senderId = req.body.originalRequest.data.sender.id;
    persistence.getToken(senderId, function(token) {
        if (token == undefined) {
            // Ask for token..
        }
        authorization.authorize(token, function(oauth2Client) {
            var mail = "";
            var event;
            var respObj = req.body.result.parameters;
            var dps = respObj.date;
            var startTime = dps + "" + respObj.time;
            startTime = moment(startTime, "YYYY-MM-DDhh:mm:ss").format();
            startTime = startTime.replace("+", "-");

            var endTime = dps + "" + respObj.endTime;
            endTime = moment(endTime, "YYYY-MM-DDhh:mm:ss").format();
            endTime = endTime.replace("+", "-");
            console.log("Timeformat" + endTime);

            if (validateEmail(respObj.email)) {
                event = {
                    'summary': respObj.title,
                    'description': respObj.title,
                    'start': {
                        'dateTime': startTime,
                        'timeZone': 'Europe/London',
                    },
                    'end': {
                        'dateTime': endTime,
                        'timeZone': 'Europe/London',
                    },
                    'attendees': [
                        { 'email': respObj.email }
                    ],
                    'reminders': {
                        'useDefault': false,
                    },
                };
            } else {
                event = {
                    'summary': respObj.title,
                    'description': respObj.title,
                    'start': {
                        'dateTime': startTime,
                        'timeZone': 'Europe/London',
                    },
                    'end': {
                        'dateTime': endTime,
                        'timeZone': 'Europe/London',
                    },
                    'reminders': {
                        'useDefault': false,
                    },
                };
            }
            console.log(event);

            var calendar = google.calendar('v3');
            calendar.events.insert({
                auth: oauth2Client,
                calendarId: 'primary',
                resource: event,
            }, function(err, event) {
                if (err) {
                    console.log(message.text.createGoogleEvent.error.speech + err);
                    var response = new Object({
                        speech: message.text.createGoogleEvent.error.speech,
                        displayText: message.text.createGoogleEvent.error.displayText
                    });
                    res.setHeader('Content-Type', 'application/json');
                    return res.send(JSON.stringify(response));
                } else {
                    console.log('Event created: %s', event.htmlLink);
                    var response = new Object({
                        speech: "Danke, der Termin wurde unter " + respObj.title + " gespeichert. Hier findest du dein Event: " + event.htmlLink,
                        displayText: "Danke, der Termin wurde unter " + respObj.title + " gespeichert Hier findest du dein Event: " + event.htmlLink,
                        "data": {
                            "facebook": {
                                "attachment": {
                                    "type": "template",
                                    "payload": {
                                        "template_type": "generic",
                                        "elements": [{
                                            "title": message.text.createGoogleEvent.button.title,
                                            "subtitle": "Danke, der Termin wurde unter " + respObj.title + " gespeichert",
                                            "buttons": [{
                                                "type": "web_url",
                                                "url": event.htmlLink,
                                                "title": message.text.createGoogleEvent.button.buttonText
                                            }]
                                        }]
                                    }
                                }
                            }
                        }
                    });
                    res.setHeader('Content-Type', 'application/json');
                    return res.send(JSON.stringify(response));
                }

            });
        });
    });
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function listEvents(req, res) {
    var senderId = req.body.originalRequest.data.sender.id;
    var number = req.body.result.parameters.number;
    var response;
    persistence.getToken(senderId, function(token) {
        if (token == undefined) {
            welcomeEvent(req, res);
        }
        authorization.authorize(token, function(oauth2Client) {
            var calendar = google.calendar('v3');
            calendar.events.list({
                auth: oauth2Client,
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: number,
                singleEvents: true,
                orderBy: 'startTime'
            }, function(err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                }
                var events = response.items;
                var arraylist = [];
                if (events.length == 0) {
                    var response = new Object({
                        speech: message.text.listEvents.error.speech,
                        displayText: message.text.listEvents.error.displayText,
                        data: {},
                        contextOut: []
                    });
                    res.setHeader('Content-Type', 'application/json');
                    return res.send(JSON.stringify(response));
                } else {
                    var speech = "Die nächsten " + number + " bevorstehende Events: \n";
                    for (var i = 0; i < events.length; i++) {
                        var event = events[i];
                        var start = event.start.dateTime || event.start.date;
                        start = moment(start).format('lll');
                        var obj = {};
                        obj['title'] = event.summary;
                        obj['subtitle'] = start;
                        arraylist.push(obj);
                        console.log(" %s - %s", start, event.summary);
                        speech += start + "-" + event.summary + "\n";
                    }
                    var response = new Object({
                        speech: speech,
                        displayText: speech,
                        data: {},
                        contextOut: [],
                        "data": {
                            "facebook": {
                                "attachment": {
                                    "type": "template",
                                    "payload": {
                                        "template_type": "generic",
                                        "elements": arraylist
                                    }
                                }
                            }
                        }
                    });
                    console.log(JSON.stringify(response));
                    res.setHeader('Content-Type', 'application/json');
                    return res.send(JSON.stringify(response));
                }
            });

        });

    });
}