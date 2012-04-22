    var socket = io.connect();//'http://localhost:8000');
	var players = new Array();
	var myName;
	var startTime = new Date();
	var counter = 0;
	var updateCounter = 0;

	// on connection to server, ask for user's name with an anonymous callback
	socket.on('connect', function(){
		// call the server-side function 'adduser' and send one parameter (value of prompt)
		myName = prompt("What's your name?");
		socket.emit('adduser', myName);
	});

	// listener, whenever the server emits 'updatechat', this updates the chat body
	socket.on('updatechat', function (username, data) {
		$('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
	});
	
	// listener, whenever the server emits 'updatechat', this updates the chat body
	socket.on('updatecoords', function (id, x, y) {
	//console.log("Received update for: " + id);
		updateCounter++;
		var playerTemp = getPlayerFromId(id);
		if(playerTemp >= 0)
		{
			//console.log("Received update for: "+id+"("+players[playerTemp].id+")");
			players[playerTemp].x = x;
			players[playerTemp].y = y;
		}
		else if(id != myName)
		{
			console.log("Created a new player with the id: " + id);
			var newPlayer = new Object();
			newPlayer.x = x;
			newPlayer.y = y;
			newPlayer.id = id;
			players.push(newPlayer);
		}
	});
	
	socket.on('createplayer', function (id) {
		if(id != myName)
		{
			var newPlayer = new Object();
			newPlayer.x = 100;
			newPlayer.y = 100;
			newPlayer.id = id;
			players.push(newPlayer);
		}
	});

	// listener, whenever the server emits 'updateusers', this updates the username list
	socket.on('updateusers', function(data) {
		$('#users').empty();
		$.each(data, function(key, value) {
			$('#users').append('<div>' + key + '</div>');
		});
	});

	socket.on('deleteuser', function(id) {
		var playerTemp = getPlayerFromId(id);
		if(playerTemp >= 0)
		{
			players.splice(playerTemp, 1);
		}
	});
	
	// on load of page
	$(function(){
		// when the client clicks SEND
		$('#datasend').click( function() {
			var message = $('#data').val();
			$('#data').val('');
			// tell server to execute 'sendchat' and send along one parameter
			socket.emit('sendchat', message);
		});

		// when the client hits ENTER on their keyboard
		$('#data').keypress(function(e) {
			if(e.which == 13) {
				$('#datasend').focus().click();
				this.focus();
			}
		});
	});


	var context;
	var backgroundImage = new Image();
	var characterImage = new Image();
	var character = new Object();
	var canvasWidth = 800;
	var canvasHeight = 600;
	var clickX = 200;
	var clickY = 200;

	$(function() {
        var canvas = $("#mainCanvas").get(0);
        context = canvas.getContext('2d');
		
        backgroundImage.src = "http://img.photobucket.com/albums/v673/gomish/travnica2.png";
		characterImage.src = "http://forums.garyoak.com/images/smilies/ClefairyNormalSprite.gif";
		
		character.x = 200;
		character.y = 200;
		
        $("#mainCanvas").click(function(eventObject)
        {
			clickX = eventObject.pageX - this.offsetLeft - 32;
			clickY = eventObject.pageY - this.offsetTop - 32;
        });
    });
	
	function getPlayerFromId(id)
	{
		for(var i = 0; i < players.length; i++)
		{
			if(id == players[i].id)
				return i;
		}
		return -1;
	}
	
	function update()
	{
		counter++;
		var sendUpdate = false;
		if(clickX != character.x)
		{
			if(clickX > character.x)
				character.x++;
			else
				character.x--;
			sendUpdate = true;
		}
		
		if(clickY != character.y)
		{
			if(clickY > character.y)
				character.y++;
			else
				character.y--;
			sendUpdate = true;
		}
		
		var newTime = new Date();
		if(newTime - startTime > 1000)
		{
			sendUpdate = true;
			startTime = new Date();
			console.log("FPS: " + counter + " UpdatesPerSecond: " + updateCounter);
			counter = 0;
			updateCounter = 0;
		}
		if(sendUpdate)
			socket.emit('sendcoords', character.x, character.y);
	}

	function redraw()
	{
		context.fillStyle = 'white';
		context.fillRect(0, 0, canvasWidth, canvasHeight);
		
		for(var x = 0; x < 25; x++)
		{
			for(var y = 0; y < 19; y++)
			{
				context.drawImage(backgroundImage, x*32, y*32);
			}
		}
		
		for(var i = 0; i < players.length; i++)
		{
			var playerTemp = players[i];
			if(playerTemp.id == null)
			{
				console.log("Deleted a null user");
				players.splice(i, 1);
			}
			context.drawImage(characterImage, playerTemp.x, playerTemp.y);
			
			context.font = "15px '"+"Courier New"+"'";
			context.fillStyle = "#000000";
			context.fillText(playerTemp.id, playerTemp.x+15, playerTemp.y);
		}
		
		context.drawImage(characterImage, character.x, character.y);
		context.beginPath();
		context.moveTo(character.x +  0, character.y + 0);
		context.lineTo(character.x +  0, character.y + 64);
		context.lineTo(character.x + 64, character.y + 64);
		context.lineTo(character.x + 64, character.y + 0);
		context.closePath();
		context.lineWidth = 1;
		context.stroke();
		
		context.restore();
	}

	var mainloop = function() {
			update();
			redraw();
		};

	var animFrame = window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame    ||
				window.oRequestAnimationFrame      ||
				window.msRequestAnimationFrame     ||
				null ;

	var recursiveAnim = function() {
		mainloop();
		animFrame( recursiveAnim );
	};

    // start the mainloop
    animFrame( recursiveAnim );