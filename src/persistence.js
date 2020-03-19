const
    fs = require('fs'),
    DBNAME = "orlanda",
    authorization = require('./authorization'),
    COLLECTIONNAME = "tokenAdministration";

var MongoClient = require('mongodb').MongoClient;
var MONGODB_URL = "mongodb://" + process.env.MONGODB_USER + ":" + encodeURIComponent(process.env.MONGODB_PASSWORD) +
    "@mongodb:27017/" + DBNAME;

function getToken(senderId, callback) {
    MongoClient.connect(MONGODB_URL, function(err, db) {
        if (err)
            throw err;
        var dbo = db.db(DBNAME);
        dbo.collection(COLLECTIONNAME).find({ "senderId": senderId }).sort({ expiry_date: 1 }).limit(1).toArray(function(err, results) {
            if (err)
                throw err;
            console.log(results);
            db.close();
            //ONLY FOR TESTING!!
            if (results[0] != undefined && results[0].expiry_date < Date.now()) {
                console.log("Token is not uptodate");
                refreshToken(results[0], function(err, tokens) {
                    if (err)
                        throw "Error while creating refreshToken.." + err;
                    console.log("Callback token 1");
                    callback(tokens);
                });
            } else {
                console.log("Callback token 2");
                callback(results[0]);
            }
        });
    });
}

function storeToken(token, callback) {
    console.log("URL: " + MONGODB_URL);
    console.log(JSON.stringify(token));

    MongoClient.connect(MONGODB_URL, function(err, db) {
        if (err)
            throw err;
        var dbo = db.db(DBNAME);
        dbo.collection(COLLECTIONNAME).insertOne(token, function(err, res) {
            if (err)
                callbakck(err);
            console.log("1 document inserted");
            db.close();
            callback();
        });
    });
}

function refreshToken(token, callback) {
    console.log("RefreshToken Method");
    authorization.refreshAccessToken(token, function(err, tokens) {
        if (err)
            throw err;
        // Refresh Token in mongodb
        MongoClient.connect(MONGODB_URL, function(err, db) {
            if (err)
                throw "Cannnot connect to db" + err;
            var dbo = db.db(DBNAME);
            dbo.collection(COLLECTIONNAME).update({ "senderId": token.senderId }, {
                "access_token": tokens.access_token,
                "refresh_token": tokens.refresh_token,
                "expiry_date": tokens.expiry_date,
                "senderId": token.senderId
            }, { upsert: true }, function(err, res) {
                if (err) throw err;
                console.log("1 document updated" + res);
                db.close();
                tokens["senderId"] = token.senderId;
                callback(err, tokens);
            });
        });
    });
}


module.exports = {
    getToken,
    storeToken,
    refreshToken
};