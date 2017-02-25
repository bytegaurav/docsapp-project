var express = require('express');
var router = express.Router();
var socketManager = require("../libs/socketmanager.js");

/* GET home page. */
router.get('/book', function(req, res, next) {
  	//check if user exists
 
  	//if not, create user 

  	

  	//update booking table with status pending
  	
  	//add to queue

  	//with user id send request to all drivers

});

router.get("/startjourney", function(req,res, next){

	//check if book is still pending

		//mark it as ongoing

		//remove from queue

		//start timer for 5mins

		//notify all drivers that its been picked



	//else reject request


});


router.get("/sendmessage", function(req,res,next){

	socketManager.sendMessage(req.query.message)
	res.send("done");
});	
module.exports = router;

