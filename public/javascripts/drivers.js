	
var drivers = new function () {


	var awaitedtrips = null;
	var inprogress = null;
	var completed = null;
	this.gettrips = function(){
		return awaitedtrips;

	}

	var renderawaited= function(){

		var tmpl = $('#itemtmpl').html();
		var html = "";


		for(var trip in awaitedtrips){

			var cpy = tmpl;

			cpy  = cpy.replace(new RegExp("{{bookingid}}", "g"), awaitedtrips[trip].bookingid);

			cpy  = cpy.replace(new RegExp("{{customerid}}", "g"), awaitedtrips[trip].userid);
			
			var requesttime = new Date(0)
			requesttime.setUTCSeconds(awaitedtrips[trip].requesttime/1000);


			var timeago = DateFormater.Convert(requesttime);
			cpy  = cpy.replace(new RegExp("{{timeago}}", "g"), timeago);
			
			html+= cpy;


		}

		$('#waiting').html(html);
		$('#waiting .item a').on("click", function(){

			var self = this;
			$.ajax({
				url:"/api/startjourney", 
				method:"POST",
				data : {bookingid: $(this).data("bookingid"), driverid: $('#driverid').val()
							}

			}).done(function(data){
				
				if(data.code!=400){
					console.log(data);
					inprogress[$(self).data("bookingid")]= awaitedtrips[$(self).data("bookingid")]
					delete awaitedtrips[$(self).data("bookingid")];
					renderawaited();
					renderinprogress();
				}else{
					alert(data.message);
				}

			});


		});

	}
	var renderinprogress= function(){

		var tmpl = $('#itemtmpl').html();
		var html = "";


		for(var trip in inprogress){

			var cpy = tmpl;

			cpy  = cpy.replace(new RegExp("{{bookingid}}", "g"), inprogress[trip].bookingid);

			cpy  = cpy.replace(new RegExp("{{customerid}}", "g"), inprogress[trip].userid);
			
			

			cpy  = cpy.replace(new RegExp("{{timeago}}", "g"), "In Progress");
			
			html+= cpy;


		}

		$('#inprogress').html(html);
	$('#inprogress a').hide();
				

	}
	var rendercompleted= function(){

		var tmpl = $('#itemtmpl').html();
		var html = "";


		for(var trip in completed){

			var cpy = tmpl;

			cpy  = cpy.replace(new RegExp("{{bookingid}}", "g"), completed[trip].bookingid);

			cpy  = cpy.replace(new RegExp("{{customerid}}", "g"), completed[trip].userid);
			
			

			cpy  = cpy.replace(new RegExp("{{timeago}}", "g"), "completed");
			
			html+= cpy;


		}

		$('#completed').html(html);
		$('#completed a').hide();
		

	}

	var loadbookingfromsocket = function(data){
			
		awaitedtrips[data.data.bookingid] = data.data;
		renderawaited();
	}


	var loadinprogress = function(){

		$.get("/api/trips/ongoing/"+$('#driverid').val(), function(data){

			inprogress = data;
			renderinprogress();
		});
	}

	var loadcomplted = function(){
		$.get("/api/trips/completed/"+$('#driverid').val(), function(data){

			completed = data;
			rendercompleted();
		});


	}
	var loadawaited = function(){
$.get("/api/trips/waiting", function(data){

			awaitedtrips = data;
			renderawaited();
		});

	}

	this.init= function(){

		awaitedtrips = new Object();
		inprogress = new Object();
		completed= new Object();
		loadawaited();
		
		loadinprogress();
		loadcomplted();
		




		window.onload= function(){

		var socket = io.connect('http://localhost:5000');
    	socket.on('message', function (data) {
	       
    		if(typeof(data)=="string"){
    			data= JSON.parse(data);
    		}

    		if(data.message.type=="new-booking"){
    			loadbookingfromsocket(data.message);


    		}else if(data.message.type=="booking-picked"){
loadawaited();
		
				loadinprogress();


    		}else if(data.message.type=="booking-completed"){
    			loadinprogress();
				loadcomplted();
		
			}




   		 });

		}

	}
}
drivers.init();