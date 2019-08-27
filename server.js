var express = require('express');
var bodyParser = require('body-parser');
var helpers = require('./helpers');
var app = express();
const port = 3000;

app.use( bodyParser.json());
app.use(bodyParser.urlencoded({  
  extended: true
})); 

app.get('/',  (req, res) => {
  res.send('Hello world');
});

app.post('/getthrivescore', (req, res) => {
  var cashFlow = req.body.cashFlow;
  var flag = 0;
  var period = req.body.period
  console.time('startTest');
  for(let runIndex =0; runIndex<5000; runIndex++) {
    var netWorthForOneSimulation = helpers.netWorthSimulation(cashFlow, period);
    if(netWorthForOneSimulation < 0) {
      flag = flag +1;
    }
    console.log("the networth in the "+ runIndex + "iteration is");
    console.log(netWorthForOneSimulation);
  }
  console.log("The value of the flag is");
  console.log(flag);
  var result = 1 - parseFloat(flag/5000);
  res.json({
    thriveScore: result
  });
  console.timeEnd('startTest');
});


app.listen(port, () => {
  console.log('Server listening');
});