var DBManager = function(){

	var mysql   = require('mysql');
	
	var pool       =    mysql.createPool({
	  host     : 'docsappdb.czqgxz8ouqa0.ap-southeast-1.rds.amazonaws.com',
	  user     : 'gauravk',
	  password : 'GKpassword321',
	  database : 'docsappdb'
	}); 
	var that = this;


	this.createUser = function(userdata, callback){

		console.log(userdata);

			that.getUser(userdata, function(user){
			console.log(user);
			if(user.id!=null){
				callback({data: {id:user.id, email:user.email}});
				return;
			}

			var query = "insert into customer(email) values(?)";
			query = mysql.format(query, [userdata.email]);

			pool.getConnection(function(err, connection){
				console.log(err);
				if(err){
					connection.release();
					callback({data:null, message:"connection error"});
					return;
				}
				connection.query(query, function(queryerr, result, fields){
					connection.release();
					if(queryerr!=null){
						callback({data:null, message:"query error"});
						return;
					}

					callback({data: {id:result.insertId, email:userdata.email}});

					return;


				});


			});

		});
		





	}



	
	this.getUser = function(userdata, callback){

		var query = "select * from customer where email=? or id=?";
		query = mysql.format(query, [userdata.email, userdata.id]);

		console.log(query);
		pool.getConnection(function(err, connection){
			if(err){
				console.log(err);
				connection.release();
				callback({id:null, message:"connection error"});
				return;
			}

			connection.query(query, function(queryerr, rows, fields){
				connection.release();

				if(queryerr){
					console.log("query error in get user");
					console.log(queryerr);
					callback({id:null, message:"query error"});
					return;
				}
				if(rows.length>0){
					//user found
					callback({id: rows[0].id, email: rows[0].email});

				}else{
					
					//not found
					callback({id:null, message:"user not found"});
				
				}
				return;


			});


		});



	}
	//creates a booking with status avaited, returns booking id
	this.bookAuto = function(userid, callback){

		var query = "insert into booking(customerid, driverid, requesttime, starttime, endtime, status) values(?,?,?,?,?,?)";
		
		var createtime = (new Date()).getTime();
		query = mysql.format(query, [userid, null,createtime,0, 0, 'waiting']);
		console.log(query);

		pool.getConnection(function(err, connection){
			if(err){
				console.log(err);
				connection.release();
				callback({status:null, message:"connection error"});
				return;
			}

			connection.query(query, function(queryerr, result, fields){
				connection.release();

				if(queryerr){
					console.log(queryerr);
					console.log("query error in book auto");
					callback({status:null, message:"query error"});
					return;
				}
				callback({status:"success", bookingdata: { id: result.insertId, userid: userid,requesttime:createtime, status:"waiting", starttime:0, endtime:0} ,  message:"booking created"});

				return;


			});


		});

	}


	this.startTrip = function(bookingid, driverid, callback){


		var query = "update booking set driverid=?, starttime=?, status=? where bookingid=? and status='waiting'";
		var starttime = (new Date()).getTime();
		query = mysql.format(query,[driverid, starttime,'ongoing', bookingid]);

		pool.getConnection(function(err, connection){
			if(err){
				console.log(err);
				connection.release();
				callback({status:null, message:"connection error"});
				return;
			}

			connection.query(query, function(queryerr, result, fields){
				connection.release();

				if(queryerr){
					console.log(queryerr);
					console.log("query error in get user");
					callback({status:null, message:"query error"});
					return;
				}

				if(result.changedRows>0){
					//updated with driver id and new status

					callback({status:"success", bookingdata: { id: result.insertId,requesttime:starttime, status:"waiting", starttime:0, endtime:0} ,  message:"booking picked"});
				}else{
					//booking was already in progress, failed 

					callback({status:null, message : "already picked by other driver"});
				}
				return;


			});


		});




		




	}
	this.completeJourney = function(bookingid, callback){


		var query = "update booking set endtime=?, status=? where bookingid=? and status='ongoing'";
		var endtime = (new Date()).getTime();
		query = mysql.format(query,[endtime,'completed', bookingid]);

		pool.getConnection(function(err, connection){
			if(err){
				console.log(err);
				connection.release();
				callback({status:null, message:"connection error"});
				return;
			}

			connection.query(query, function(queryerr, result, fields){
				connection.release();

				if(queryerr){
					console.log(queryerr);
					console.log("query error in get user");
					callback({status:null, message:"query error"});
					return;
				}

				
				callback({status:"success"});
				return;


			});


		});




		




	}
	this.getTrips = function(status, driverid,callback) {
			
		var query="";
		if(status=="waiting"){

			query = "select * from booking where status=?";
			query = mysql.format(query,[status]);

		}else{

			query = "select * from booking where status=? and driverid=?";
			query = mysql.format(query,[status, driverid]);
		
		}	

		pool.getConnection(function(err, connection){
			if(err){
				connection.release();
				callback({});
				return;
			}

			connection.query(query, function(queryerr, rows, fields){
				connection.release();

				if(queryerr){
					
					callback({});
					return;
				}

				var trips = new Object();
				for(var i=0; i<rows.length; i++){

					trips[rows[i].bookingid]= {
						bookingid: rows[i].bookingid,
						status: rows[i].status,
						userid: rows[i].customerid, 
						requesttime: rows[i].requesttime

					}
 

				}
				callback(trips);


				return;


			});


		});


	}

	this.getDashboardData = function(callback){

		query = "select * from booking order by bookingid DESC";
 

		pool.getConnection(function(err, connection){
			if(err){
				connection.release();
				callback({});
				return;
			}

			connection.query(query, function(queryerr, rows, fields){
				connection.release();

				if(queryerr){
					
					callback({});
					return;
				}

				var trips = new Object();
				for(var i=0; i<rows.length; i++){

					trips[rows[i].bookingid]= {
						bookingid: rows[i].bookingid,
						status: rows[i].status,
						userid: rows[i].customerid, 
						driverid: rows[i].driverid,
						requesttime: rows[i].requesttime,
						starttime: rows[i].starttime,
						endtime: rows[i].endtime,
						

					}
 

				}
				callback(trips);



				return;


			});


		});


	}
	

	


	



}

module.exports = DBManager;
