var needle = require('needle');
global.allSchemes = {};
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    else {
    var dbo = db.db("mydb2");
    needle.get('http://o3securitiesapis.cmots.com/Market.svc/AMC-Master?responsetype=json',
        async function(err, resp, body){
            var amclist = await JSON.parse(body).response.data.AMCMasterlist.AMCMaster;
            for (var key in amclist) {
                smurl = "http://o3securitiesapis.cmots.com/Market.svc/AMFI-Master/" + amclist[key].mf_cocode + "?responsetype=json";
                needle.get(smurl,
                    async function(err, resp, body){
                        var schemelist = await JSON.parse(body).response.data.schemelist.isinmaster;
                        for (var key1 in schemelist) {
                            (function (myobj) {
                                //var myobj = schemelist[key1]; //{ name: "Company Inc", address: "Highway 37" };
                                dbo.collection("schemes_cmots").findOne({ReinvestedISIN: schemelist[key1].ReinvestedISIN, $or: [{payout_ISIN: schemelist[key1].payout_ISIN}]}, function(err, res) {
                                    if (err) throw err;
                                    if (res == null){
                                        dbo.collection("schemes_cmots").insertOne(myobj, function(err, res) {
                                            if (err) throw err;
                                        });
                                    }
                                });
                            })(schemelist[key1]);
                        }
                    });
            }
    }); 
    }
});
