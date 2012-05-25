var express = require('express')
  , http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
//io.set('log level', 1); // reduce logging

server.listen(8001);

var downloads = {};

app.use(app.router);
app.use(express.static(__dirname + '/public'));

app.get('/*', function(req, res, next){
  var file = req.params[0];
  downloads[file] = downloads[file] || 0;
  downloads[file]++;
  next();
});

// usernames which are currently connected to the chat
var playerList = [];
var packetNum = 0;
var sendWholeStatePacket = false;
var enemyNum = 0;
var newState = [];

io.sockets.on('connection', function (socket) {

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	socket.on('move', function (dir) {
		var id = getUser(socket.username);
		if(id) {
			var player = playerList[id];
			player.move[dir] = true;
		}
	});
	
	socket.on('stop', function (dir) {
		var id = getUser(socket.username);
		if(id) {
			var player = playerList[id];
			player.move[dir] = false;
		}
	});

	socket.on('attack', function() {
		var id = getUser(socket.username);
		if(id) {
			var player = playerList[id];
			if(player.attackTimer <= 0) {
				player.attack = true;
			}
		}	
	});
	
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username) {
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		var newPlayer = new Player(username, 5, 10, 100, 100);
		playerList.push(newPlayer);
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// update the list of users in chat, client-side
		io.sockets.emit('addPlayer', playerList[playerList.length-1]);
		//io.sockets.emit('createplayer', username);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		
		//io.sockets.emit('deleteuser', socket.username);
		var player = getUser(socket.username);
		
		io.sockets.emit('deletePlayer', playerList[player]);
		
		if(player) {
			playerList.splice(player, 1);
		}
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});

	socket.on('addEnemy', function(enemyName){		
		var newEnemy = new Enemy(enemyName+enemyNum++, 5, 10, 500, 300);
		playerList.push(newEnemy);
		// echo globally (all clients) that a person has connected
		// update the list of users in chat, client-side
		io.sockets.emit('addPlayer', playerList[playerList.length-1]);
		//io.sockets.emit('createplayer', username);
	});
	
	/*****************************************************JOHN***********************************************************
	socket.on('dblclick', function(x, y){
		var id = getUser(socket.username);
		if(id) {
			var player = playerList[id];
			player.attack = true;
			player.attackX = x;
			player.attackY = y;
		}
	});	
	//*******************************************************************************************************************/
});

function getUser(username) {
	for(var i in playerList) {
		if(playerList[i].username == username) {
			return i;
		}
	}
	return 0;
}

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

function getWholePacket() {
	var wholePacket = [];
	for(var i = 0; i < playerList.length; i++) {
		var player = playerList[i];
		var playerToAdd = {x: player.x,
						   y: player.y,
						   username: player.username,
						   health: player.health};
		wholePacket.push(playerToAdd);
	}
	return wholePacket;
}

var timeOfLastUpdate = new Date().valueOf();

function tick() {
	var newTime = new Date().valueOf();
	var tickTime = newTime - timeOfLastUpdate;
	
	if(tickTime >= 50) {
		for(var i in playerList) {
			var player = playerList[i];
			player.update(tickTime);
		}
		
		if(packetNum%40 == 0) {
		//Every 40 packets send a whole state instead of a delta states
			var wholePacket = getWholePacket();
			io.sockets.emit('wholePacket', packetNum++, wholePacket);
		}
		else {
			//set states (send delta changes)
			io.sockets.emit('update', packetNum++, newState);
		}
		timeOfLastUpdate+= 50;
		newState = [];
	}

    process.nextTick(tick);
}

tick();

//******************************************************CLASSES*********************************************
function Entity(username, speed, hp, x, y) {
		this.username = username;
		this.speed = speed;
		this.health = hp;
		this.x = x;
		this.y = y;
		this.timeToAttack = 0;
		this.h = 66;
		this.w = 60;
		this.damage = 0;
		this.move = [];
		this.attack = false;
		this.attackTimer = 0;
		this.dir = 3;
}

Entity.prototype.update = function(dt) {
	var playerObject = new Object();
	playerObject.username = this.username;
	var toAdd = false; //If variables have been changed, add state to outgoing packet
	
	if(this.damage) {
		toAdd = true;
		this.health += this.damage;
		playerObject.health = this.damage;
		this.damage = 0;
		console.log("health: " + this.health);
		if(this.health <= 0) {
			var index = getUser(this.username);
			io.sockets.emit('deletePlayer', playerList[index].username);
			if(index) {
				playerList.splice(index, 1);
			}
			return;
		}		
	}
	
	//movement stuff
	var xMove = 0;
	var yMove = 0;
	if(this.move[1]) {
		this.y += -this.speed;
		yMove += -this.speed;
		this.dir = 1;
	}
	if(this.move[2]) {
		this.x += this.speed;
		xMove += this.speed;
		this.dir = 2;
	}
	if(this.move[3]) {
		this.y += this.speed;
		yMove += this.speed;
		this.dir = 3;
	}
	if(this.move[4]) {
		this.x += -this.speed;
		xMove += -this.speed;
		this.dir = 4;
	}
	if(xMove != 0) {
		playerObject.x = xMove;
		toAdd = true;
	}
	if(yMove != 0) {
		playerObject.y = yMove;
		toAdd = true;
	}

	if(this.attackTimer > 0) {
		this.attackTimer -= dt;
	}
	
	if(this.attack) {
		toAdd = true;
		
		for(var i = 0; i < playerList.length; i++) {
			var enemy = playerList[i];
			var midY = this.y + this.h/2.0;
			var midX = this.x + this.w/2.0;
			//check if they are within range of the attack
			switch(this.dir) {
				case 1:
					//north
					if(enemy.x > (midX - this.w) && enemy.x < midX &&
					enemy.y > (this.y - this.w - 10) && enemy.y < this.y) {
						enemy.damage = -2;
					}
					break;
				case 2:
					//east
					if(enemy.x > this.x && enemy.x < (this.x + this.w + 10) &&
					enemy.y > (midY - this.h) && enemy.y < midY) {
						enemy.damage = -2;
					}
					break;
				case 3:
					//south
					if(enemy.x > (midX - this.w) && enemy.x < midX &&
					enemy.y > this.y && enemy.y < (this.y + this.h + 10)) {
						enemy.damage = -2;
					}
					break;
				case 4:
					//west
					if(enemy.x > (this.x - this.w - 10) && enemy.x < this.x &&
					enemy.y > (midY - this.h) && enemy.y < midY) {
						enemy.damage = -2;
					}
					break;
			}
		}
		
		playerObject.attack = true;
		this.attack = false;
		this.attackTimer = 1000;
	}

	if(toAdd) { //New information being sent in packet
		newState.push(playerObject);
	}
}

//************************************************ PLAYER ***********************************************************
function Player(username, speed, hp, x, y) {
    Entity.call(this, username, speed, hp, x, y);
    var attackerList = {};
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.update = function(dt) {
	Entity.prototype.update.call(this, dt);
}

Player.prototype.addAttacker = function(attacker) {
	this.attackerList[attacker.username] = true;
}

Player.prototype.removeAttacker = function(attacker) {
	delete this.attackerList[attacker.username];
}

Player.prototype.clearAttackers = function() {
	this.attackerList = {};
}

//************************************************ ENEMY *************************************************************
function Enemy(username, speed, hp, x, y) {
    Entity.call(this, username, speed, hp, x, y);
	var aggroList = {};
	var target = null;
	var targetAggro = null;
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function(dt) {
	Entity.prototype.update.call(this, dt);
	
	for (var i = 0; i < playerList.length; i++) {
		var player = playerList[i];
		
		// Check if the player in question is close enough to draw aggro
		if (Math.abs(player.x - this.x) < 20) {
			if (Math.abs(player.y - this.y) < 20) {
				// Check if the player in question is already in the aggro list
				if (!this.aggroList.hasOwnProperty(player.username)) {
					this.aggroList[player.username] = 30;
				}
			}
		}
	}
	for (player in this.aggroList) {
		var distance = Math.sqrt(Math.pow(player.x - this.x, 2) + Math.pow(player.y - this.y, 2))
		var aggro = this.aggroList[player.username] / distance;
		if (aggro < 1) {
			this.removeAggroFor(player);
		}
		if (!this.hasTarget() || aggro > this.targetAggro) {
			this.target = player;
			this.targetAggro = aggro;
		}
	}
	
	this.attemptAttackOn(target);
}

Enemy.prototype.attemptAttackOn = function(target) {
	if (target.isInRange(this)) {
		this.attack = true;
	} else {
		this.moveTowards(target);
	}
}

Enemy.prototype.removeAggroFor = function(target) {
	if (this.target == target) {
		this.target = null;
	}
	delete this.aggroList[target.username];
}

Enemy.prototype.hasTarget = function() {
	if (this.target == null) {
		return false;
	} else {
		return true;
	}
}

Enemy.prototype.moveTowards = function(target) {
	if (this.x > target.x) {
		this.move[4] = true;
	} else {
		this.move[2] = true;
	}
	if (this.y > target.y) {
		this.move[1] = true;
	} else {
		this.move[3] = true;
	}
}
