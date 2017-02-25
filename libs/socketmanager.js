
var socketmananger = new function (argument) {
	// body...
	var soc = null;
	var IO = null;

	this.setIO= function(io)
	{
		IO= io;
	}

	this.sendMessage= function(message){
		IO.sockets.emit('message', { message: message });

		// soc.emit('message', { message: message });
		// console.log(IO);
		// soc.on('send', function (data) {
	        
	 //    });
	}

	



	this.init = function(socket){
		soc= socket;
		socket.emit('message', { message: "welcome to the jungle" });
	   
		socket.on('send', function (data) {
	        io.sockets.emit('message', data);

	    });

	}
}

module.exports = socketmananger;