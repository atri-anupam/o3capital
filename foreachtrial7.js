var needle = require('needle');
var async = require('async');
var Papa = require('papaparse');
global.all_mfs;
var mapping = {};
var unmapped_dir = [];
global.allSchemes = {};
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';


async.waterfall([

    function (callback) {
        needle.get('https://api.kite.trade/mf/instruments', 
            function(err, resp, body){
                callback(null, resp);
            }
        );
    },


    function (resp, callback) {
        global.all_mfs = Papa.parse(resp.body, {header: true}).data;
        global.all_mfs.pop();
        var new_mfs = [];
        (global.all_mfs).forEach(function(item) {
            if (item.redemption_allowed != '0') {
                item.name = (item.name).replace(" - Direct Plan", "").trim();
                item.name = (item.name).replace("- Direct P", "").trim();
                item.name = (item.name).replace("- Direct", "").trim();
                item.name = (item.name).replace("-DirectP", "").trim();
                item.name = (item.name).replace(" - Regular Plan", "").trim();
                item.name = (item.name).replace(" - Regular Savings Plan", "").trim();
                item.name = (item.name).replace(" - Retail Plan", "").trim();
                item.name = (item.name).replace(" - Institutional Plan", "").trim();
                item.isin = item.tradingsymbol;
                item.zerodha_scheme_type = item.scheme_type;
                new_mfs.push(item);
            }
        });
        callback(null, new_mfs);
    },


    function (all_mfs, callback) {
        all_mfs.forEach(function(item) {
            delete item.scheme_type;
            delete item.tradingsymbol;
            delete item.purchase_allowed;
            delete item.redemption_allowed;
            delete item.purchase_amount_multiplier;
            var direct_avl = false;
            if (item.plan == 'regular') {
                all_mfs.forEach(function(item1) {
                    if(item.name==item1.name && item.dividend_type==item1.dividend_type && item1.plan == 'direct') {
                        item.alternate_dir_isin = item1.isin;
                        direct_avl = true;
                    }
                });
            }
            if (!direct_avl) {
                item.alternate_dir_isin = null;
            }
        });
        callback(null, all_mfs)
    },


    function (all_mfs, callback){
        MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb2");
            dbo.collection("schemes_cmots").find({}).toArray(function(err, res) {
                if (err) throw err;
                var cmots = res;
                callback(null, all_mfs, cmots);
            });
        });
    },


    function (all_mfs, cmots, callback){
        all_mfs.forEach(function(item) {
            var obj = cmots.find(data => data.payout_ISIN === item.isin);
            if (obj == undefined) {
                obj = cmots.find(data => data.ReinvestedISIN === item.isin);
            }
            if(obj != undefined) {
                item.exp_ratio = obj.ExpenseRatio;
                item.aum = obj.Aum;
                item.period = obj.Periodicity;
                item.cmots_scheme_type = obj.Category;
            }
            else {
                item.exp_ratio = null;
                item.aum = null;
                item.period = null;
                item.cmots_scheme_type = null;
            }
        });
        callback(null, all_mfs);
    },


    function (all_mfs, callback) {
        fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), all_mfs, readToxicFunds);
});

function authorize(credentials, all_mfs, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, all_mfs, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, all_mfs);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client, all_mfs);
    });
  });
}
var toxic_funds = [];
function readToxicFunds(auth, all_mfs) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1f6VJ-dEXaA8EhEgnKjXpNotEQDSEpAIfjykog89fHbs',
    range: 'blacklisted_funds',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    all_mfs.forEach(function(item) {
        var toxic = false;
        rows.forEach(function(item1) {
        if(item.isin==item1[0]) {
            item.is_toxic = true;
            toxic = true;
        }
        });
        if(!toxic){
            item.is_toxic = false;
        }
    });
        callback(null, all_mfs);
  });
}
    },


    function (all_mfs, callback){
        MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb2");
            all_mfs.forEach(function(item) {
                dbo.collection("schemes_zerodha").deleteOne({isin: item.isin}, function(err3, obj) {
                    if (err3) throw err3;
                    dbo.collection("schemes_zerodha").insertOne(item, function(err4, res4) {
                        if (err4) throw err4;
                    });
                });
            });
        });
        callback();
    }
],


    function () {
        //process.exit(1);;
    }
);
