var customer = new function() {

	var bookingid =null;
	var makebooking = function(){

		$.ajax({
			url:"/api/book", 
			method:"POST",
			data : {email: $('#email').val()}

		}).done(function(data){
			console.log(data);

			if(data.code==201){
				//success
			bookingid=data.data.id;

				$('.booking').hide();
				$('.waiting').fadeIn();


			}else{
				alert("failed to create booking");
			}

		});

	}
	
	var binding = function(){

		$('#customer form').on("submit", function(e){
			$(this).find('input[type="submit"]').attr("disabled", "disabled");
			e= e|| window.event;
			e.preventDefault();
			makebooking(this);
		});	

	}


	var startSocket = function(){
		var socket = io.connect(location.host);
    	socket.on('message', function (data) {
	        console.log(data);
	        if(data.message.destination=="BOOKING_"+bookingid){

    			if(data.message.data.status=="ongoing"){
    				$('.waiting').hide();
    				$('.done').fadeIn();
    				$('.done span').html("driver "+data.message.data.driver);
    			}

    		}

   		 });


	}

	this.init = function(){
		startSocket();
		binding();

	}
}