function NetworkManager(game, socket) {
	this.game = game;
	this.socket = socket;
	this.click = false;
	this.clickCoords = new Object();
	this.key = false;
	this.keyValue = 0;
	this.stateBuffer = [];
	this.stateRequests = 0;
	this.FPS = 0;
	this.oldDir = 0;
	startNetwork(this, this.game, this.socket);
	//this.init();
}

NetworkManager.prototype.key = function(keyVal) {
	this.keyValue = keyVal;
	this.key = true;
}

NetworkManager.prototype.update = function() {
	if(this.click) {
		this.socket.emit('click', this.clickCoords.x, this.clickCoords.y);
		this.click = false;
	}
}

NetworkManager.prototype.move = function(dir) {
	if(this.oldDir == dir) return;
	
	this.oldDir = dir;
	this.socket.emit('move', dir);
}

NetworkManager.prototype.stopMove = function() {
	this.socket.emit('stopMove');
	this.oldDir = 0;
}

NetworkManager.prototype.createEnemy = function() {
	this.socket.emit('addEnemy', 'evilLink');
}

NetworkManager.prototype.addPlayer = function(player) {
	var name = (player.username.substr(0, 8) == 'evilLink') ? 'linkEvil' : 'linkGreen';
	game.addEntity(new Player(game, player.x, player.y, player.username, name, player.health));
}

NetworkManager.prototype.getNewState = function() {
	if(this.stateBuffer.length) {
		var packet = this.stateBuffer.shift();
		if(packet.type == 0) {
		//this is a whole state packet
			for(var i = 0; i < packet.array.length; i++) {
				var update = packet.array[i];
				var entity = game.getEntityByName(update.username);
				if(entity) {
				//if the entity exists then set the DELTA to the current difference
				//also if the difference is less than 0.01 then just set it to zero
					update.x = (Math.abs(update.x - entity.x) > 0.01) ? update.x - entity.x : 0;
					update.y = (Math.abs(update.y - entity.y) > 0.01) ? update.y - entity.y : 0;
					update.health = update.health - entity.health;
				} else {
					var name = (update.username.substr(0, 8) == 'evilLink') ? 'linkEvil' : 'linkGreen';
					game.addEntity(new Player(game, update.x, update.y, update.username, name, update.health));
				}
			}
		}
		return packet;
	}
	else
		return 0;
}

function startNetwork(manager, game, socket) {
	var game = game;
	var socket = socket;
	var lastPacket = 0;
	var numOfWholePackets = 0;

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

	// listener, whenever the server emits 'updateusers', this updates the username list
	socket.on('wholePacket', function(packetNum, data) {
		$('#users').empty();
		$.each(data, function(key, value) {
			$('#users').append('<div>' + value.username + '</div>');
		});
		
		lastPacket = packetNum;		
		if(numOfWholePackets == 0){
		//if this is the first world packet being received
			console.log("packet- wholePacket(FIRST TIME): cleared update buffer");
			manager.stateBuffer = [];
			for(var i = 0; i < data.length; i++) {
				manager.addPlayer(data[i]);
				console.log("... added \"" + data[i].username + "\" to players (x: " + data[i].x + ", y: " + data[i].y + ')');
			}
			numOfWholePackets++;
			return;
		}
		
		var state = { 	array: data,
						time: 50,
						type: 0};
		
		numOfWholePackets++;
		manager.stateBuffer.push(state);
	});

	socket.on('addPlayer', function(player) {
		console.log("packet- addPlayer: add \"" + player.username + '"');
		manager.addPlayer(player);
	});


	socket.on('deletePlayer', function(username) {
		console.log("packet- deletePlayer: " + username);
		var playerTemp = game.getEntityByName(username);
		if(playerTemp) {
			playerTemp.removeFromWorld = true;
		}
	});
		
	socket.on('update', function(packetNum, data) {
		if(numOfWholePackets == 0) {
			console.log("Received update packet before WholePacket- discarding packet");
			return;
		}
		if(packetNum != lastPacket+1 && lastPacket > 0) {
			console.log("lost a packet");
		}
		lastPacket = packetNum;

		if(manager.stateBuffer.length > 2){
			manager.stateBuffer = [];
			console.log("threw out a packet");
		}
		var state = { 	array: data,
						time: 50,
						type: 1};
			
		manager.stateBuffer.push(state);
	});
	
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
}