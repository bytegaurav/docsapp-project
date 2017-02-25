var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


router.get('/driverapp/:driverid', function(req, res, next) {
  res.render('driverapp', {driverid: req.params["driverid"]});
});


router.get('/customerapp', function(req, res, next) {
  res.render('customerapp');
});


router.get('/dashboard', function(req, res, next) {
  res.render('dashboard');
});

module.exports = router;
