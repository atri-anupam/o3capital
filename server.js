var express = require('express');
var bodyParser = require('body-parser');
var helpers = require('./helpers');
var app = express();
const port = 3000;

var houseExp;
const homedownpayment = 0.1;
const homeloaninterest = 0.086;
const homeloanperiod = 180; //months
const retexp = 0.7;
const inf = 1.05;
const edinf = 1.1;
const salinc = 1.1;
const retinc = 1.08;
const savinc = 1.08;
const loaninc = 1.09;
const education = 2000000;
const edage = 18;
const ageFather = 30;
const retAge = 60;
const startAge = 21;
const houseAge = 35;
const lifeExpec = 100;
const houseToSalary = 50;
const ageEligibility = 45; // checking for potential customer
const salEligibility = 100000; // checking for potential customer
const savRound = 500;
const houseRound = 100000;

app.use( bodyParser.json());
app.use(bodyParser.urlencoded({  
  extended: true
})); 

function emi(P, R, N) {
  return ( (P * R * ((1+R)**N) ) / ( ((1+R)**N) -1) );
}

function sumGP(a, r, n) {
  return ( (a * ((r ** n) - 1) ) / (r-1) );
}

function nthGP(a, r, n) {
  return ( a * (r**(n-1)) );
}

function firstGP(nthterm, r, n) {
  return ( nthterm/ (r**(n-1)) );
}

function annualize(n) {
  return (n*12);
}

function deannualize(n) {
  return (n/12);
}

function roundOf(n, r) {
  n /= r;
  n = Math.round(n);
  return n * r;
}

//Start from 30, + 2 increment

function calcAgeAtGrad(age, noOfKids) {
  var ageAtGrads = new Array(noOfKids);
  for (i=0; i<noOfKids; i++) {
      ageAtGrads[i] = ageFather+edage+2*i;
  }
  return ageAtGrads;
}


//Considering 6 as the threshold for kids

function eduExp(age, noOfKids) {
  if (noOfKids >= 6){
      noOfKids = 6;
  }    
  var ageAtGrad = calcAgeAtGrad(age, noOfKids);
  var educExp = {};
  for (i=0; i<noOfKids; i++)
  {
      educExp[ageAtGrad[i]] = nthGP(education, edinf, ageAtGrad[i]-age+1);
  }
  return educExp;
}


// New logic
function house(sal) {
  var salAt35 = deannualize(nthGP(sal, salinc, houseAge-startAge+1));
  if(salAt35 >= 100000) {
      return ((salAt35) * houseToSalary)}
  else {
      return 0; }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function idealSavings(age, noOfKids, salary){
  if (salary < 50000 || age > 59 || age < 21 || noOfKids < 0) {
      return("Reject at front-end");
  }
  var yearsOfEmi = 0;
  var educationExp = eduExp(age, noOfKids);

  sal = new Array(retAge-startAge + 1)
  regExp = new Array(retAge-startAge + 1)
  savings = new Array(retAge-startAge + 1)

  if (age != startAge) {
      sal[0] = annualize( firstGP(salary, salinc, (age-startAge+1) ) );
  }
  else {
      sal[0] = annualize(salary);
  }

  houseExp = house(sal[0]);
  var houseDownpay = homedownpayment * houseExp;
  var houseEmi = annualize(emi(houseExp-houseDownpay, homeloaninterest/12, homeloanperiod));

  regExp[0] = sal[0]; // 
  savings[0] = [-regExp[0], sal[0]]; // 

  //from startAge to retAge
  for(i=1; i<retAge-startAge+1; i++) {
      sal[i] = sal[i-1] * salinc; // 
      regExp[i] = regExp[i-1] * retinc; // 
      savings [i] = [savings[i-1][0] * savinc, savings[i-1][1] * savinc]; //
      savings [i][0] -= regExp[i];
      savings [i][1] += sal[i];
      if ((i+startAge) == houseAge) {
          yearsOfEmi = homeloanperiod/12;
          savings[i][1] -= houseDownpay;
      }
      if (yearsOfEmi>0) {
          savings [i][1] -= houseEmi;
          yearsOfEmi--;
      }
      if ( (i+startAge) in educationExp) {
          savings[i][1] -= educationExp[(i+startAge)];
      }
  }

  regExp[retAge-startAge+1] = regExp[retAge-startAge] * retinc * retexp;
  savings[retAge-startAge+1] = [savings[retAge-startAge][0] * savinc, savings[retAge-startAge][1] * savinc];

  //from retAge to lifeExpec
  for (i=retAge-startAge+2; i<lifeExpec-startAge+1; i++)
  {
      regExp[i] = regExp[i-1] * retinc;
      savings [i] = [savings[i-1][0] * savinc, savings[i-1][1] * savinc];
      savings [i][0] -= regExp[i];
  }

  //Expected value of R
  var R = -savings[lifeExpec-startAge][1] / savings[lifeExpec-startAge][0];
  if (R < 0) {
      return ("Error, Savings > Income");
  }
  if (sal[ageEligibility-startAge] < annualize(salEligibility)) {
      return ("Not a potential customer");
  }

  else {
      //Check for loans
      savings_R = new Array(retAge-startAge + 1)

      do {
          R *= 0.99
          regExp[0] = R*sal[0]; // 
          savings_R[0] = -regExp[0] + sal[0]; // 
          //from startAge to retAge
          for(i=1; i<retAge-startAge+1; i++) {
              regExp[i] = regExp[i-1] * retinc; // 
              if (savings_R[i-1] > 0) {
                  savings_R [i] = savings_R[i-1] * savinc;
              }
              else {
                  savings_R [i] = savings_R[i-1] * loaninc;
              }
              savings_R [i] -= regExp[i];
              savings_R [i] += sal[i];
      
              if ((i+startAge) == houseAge) {
                  yearsOfEmi = homeloanperiod/12;
                  savings_R[i] -= houseDownpay;
              }
  
              if (yearsOfEmi>0) {
                  savings_R [i] -= houseEmi;
                  yearsOfEmi--;
              }
      
              if ( (i+startAge) in educationExp) {
                  savings_R[i] -= educationExp[(i+startAge)];
              }
          }

          regExp[retAge-startAge+1] = regExp[retAge-startAge] * retinc * retexp;
          if (savings_R[retAge-startAge] > 0) {
              savings_R [retAge-startAge+1] = savings_R[retAge-startAge] * savinc;
          }
          else {
              savings_R [retAge-startAge+1] = savings_R[retAge-startAge] * loaninc;
          }

          //from retAge to lifeExpec
          for (i=retAge-startAge+2; i<lifeExpec-startAge+1; i++)
          {
              regExp[i] = regExp[i-1] * retinc;
              savings_R [i] = savings_R[i-1] * savinc;
              savings_R [i] -= regExp[i];
          }
      }
      while(savings_R[lifeExpec-startAge] < 0)



      //return the new adjusted R
      return deannualize(annualize(salary) - regExp[age-startAge] );
  }
}

app.post
(
  '/idealSavings', (req, res) =>
  {
      var data = {"monthly_savings" : (roundOf(idealSavings(parseFloat(req.body.age), parseFloat(req.body.noOfKids), parseFloat(req.body.salary)), savRound)).toString(), "recc_house" : roundOf(houseExp, houseRound).toString()};
      res.writeHead('200');
      res.write(JSON.stringify(data));
      return res.end();
  }
)
app.post
(
  '/extraCash', (req, res) =>
  {
      var data = (extraCash(parseFloat(req.body.bal), parseFloat(req.body.exp), parseFloat(req.body.dayofm))).toString();
      res.writeHead('200');
      res.write(data);
      return res.end();
  }
)

function extraCash(bal, exp, dayOfMonth) {
  if (bal-recBal(exp) >= 0) {
      return (bal-recBal(exp));
  }
  else {
      return 0;
  }
}

function recBal(exp) {
  return exp*1.5;
}


app.get('/',  (req, res) => {
  res.send('Hello world');
});

app.post('/getthrivescore', (req, res) => {
  var cashFlow = req.body.cashFlow;
  var flag = 0;
  var period = req.body.period
  for(let runIndex =0; runIndex<8000; runIndex++) {
    var netWorthForOneSimulation = helpers.netWorthSimulation(cashFlow, period);
    if(netWorthForOneSimulation < 0) {
      flag = flag +1;
    }
  }
  var result = 1 - parseFloat(flag/8000);
  res.json({
    thriveScore: result
  });
});


app.listen(port, () => {
  console.log('Server listening');
});