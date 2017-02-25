var express = require('express');
var router = express.Router();
var socketManager = require("../libs/socketmanager.js");
var DBManager = require("../libs/DBManager.js");
var RequestQueue = require('../libs/RequestQueue.js');
var db = new DBManager();


/* GET home page. */
router.post('/book', function(req, res, next) {

	console.log(req.body);
  	if(req.body.email==""|| req.body.email==undefined){

  		res.json({code:400, message:"bad request"});
  		return;
  	}

  	//check if user exists
 
  	//if not, create user 


  	db.createUser({email: req.body.email, id:null}, function(userdata){

	  	if(userdata.data==null){
	  		//failed to create user
	  		res.json({code: 400 , message: userdata.message})
	  		return;
	  	}else{


	  		//create booking with status waiting 
	  		
	  		//add to db
	  		var userid = userdata.data.id;

	  		db.bookAuto(userid, function(data){

	  			if(data.status==null){
	  				//failed booking
	  				res.json({code:400, message:data.message});
	  				return;
	  			}

	  			//add to in-memory queue

	  			RequestQueue.set(data.bookingdata.id, data.bookingdata);
				
				//with user id send request to all drivers

	  			socketManager.sendMessage({destination:"all", type:"new-booking",data:{bookingid:data.bookingdata.id, requesttime: data.bookingdata.requesttime, userid: userid, status:"waiting"}});

	  			res.json({code:201, message:"created", data:data.bookingdata});
	  			return;

	  		});


	  		
	  		
	  	}

  	});



  	

  	
  	
});

router.post("/startjourney", function(req,res, next){
	//check if book is still pending

	if(RequestQueue.get(req.body.bookingid)!=null){


		//mark it as ongoing

		db.startTrip(req.body.bookingid, req.body.driverid, function(data){

			if(data.status==null){
				res.json({code:400, message: data.message})
				return;
			}

			//remove from queue

			RequestQueue.delete(req.body.bookingid);

			setTimeout(function(){

				db.completeJourney(req.body.bookingid, function(){});
				//notify  driver that its been completed
				socketManager.sendMessage({destination:"DRIVER_"+req.body.driverid, type:"booking-completed",data:{bookingid:req.body.bookingid, status:"completed"}});




			}, 5*60*1000);

			//notify all drivers that its been picked

			socketManager.sendMessage({destination:"BOOKING_"+req.body.bookingid, type:"booking-picked",data:{bookingid:req.body.bookingid, status:"ongoing", driver: req.body.driverid}});
			res.json({code:200, message: "done"});
				

		});
	
	}else{
		res.json({code:400, message: "already picked by other driver"})
				
	}

	
		
		




	//else reject request


});


router.get("/trips/:status/:driverid?", function(req,res, next){

		db.getTrips(req.params["status"], req.params["driverid"],function(data) {

			res.json(data);


		});

});



router.get("/sendmessage", function(req,res,next){

	socketManager.sendMessage(req.query.message)
	res.send("done");
});	
module.exports = router;

