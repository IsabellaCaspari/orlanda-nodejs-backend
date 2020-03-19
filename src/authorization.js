var fs = require('fs');
var googleAuth = require('google-auth-library');
var readline = require('readline');
var auth = new googleAuth();
const CLIENTSECRETPATH = "/opt/src/res/client_secret.json";
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];


function initialOauth2Client(callback) {
    console.log("Initial authclient");
    fs.readFile(CLIENTSECRETPATH, function(err, content) {
        if (err) {
            throw new Error('Error loading client secret file: ' + err);
        }
        var credentials = JSON.parse(content);
        var clientSecret = credentials.web.client_secret;
        var clientId = credentials.web.client_id;
        var redirectUrl = credentials.web.redirect_uris[0];
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        callback(err, oauth2Client);
    });

}

function authorize(token, callback) {
    initialOauth2Client(function(err, oauth2Client) {
        if (err)
            console.log('Error while creating the oauth2Client', err);
        oauth2Client.credentials = token;
        callback(oauth2Client);
    });
}

function getToken(code, senderId, callback) {
    initialOauth2Client(function(err, oauth2Client) {
        if (err)
            console.log('Error while creating the oauth2Client', err);
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            //Add senderId to token
            token["senderId"] = senderId;
            oauth2Client.credentials = token;
            callback(token);
        });
    });
}

function refreshAccessToken(token, callback) {
    initialOauth2Client(function(err, oauth2Client) {
        if (err)
            console.log('Error while creating the oauth2Client', err);
        oauth2Client.credentials = token;
        oauth2Client.refreshAccessToken(function(err, tokens) {
            if (err)
                console.log('Error while trying to refresh access token', err);
            oauth2Client.credentials = tokens;
            callback(err, tokens);
        });

    });
}

function getAuthUrl(callback) {
    fs.readFile(CLIENTSECRETPATH, function processClientSecrets(err, content) {
        if (err) {
            throw new Error('Error loading client secret file: ' + err);
        }
        credentials = JSON.parse(content);
        var authUrl = credentials.web.auth_url;
        callback(authUrl);
    });
}


module.exports = {
    initialOauth2Client,
    authorize,
    getAuthUrl,
    getToken,
    refreshAccessToken
};