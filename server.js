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

	//when the user updates their coords
	socket.on('click', function(x, y){
		var id = getUser(socket.username);
		if(id) {
			var player = playerList[id];
			player.click = true;
			player.clickX = x;
			player.clickY = y;
		}
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		var newPlayer = new Entity(username, 5, 10, 100, 100);
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
	*/

	socket.on('addEnemy', function(enemyName){		
		var newEnemy = new Enemy(enemyName+enemyNum++, 5, 100, 500, 300);
		playerList.push(newEnemy);
		// echo globally (all clients) that a person has connected
		// update the list of users in chat, client-side
		io.sockets.emit('addPlayer', playerList[playerList.length-1]);
		//io.sockets.emit('createplayer', username);
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

function lineDistance(playerDist)
{
	var xs = 0;
	var ys = 0;
					 
	xs = playerDist.clickX - playerDist.x;
	xs = xs * xs;
					 
	ys = playerDist.clickY - playerDist.y;
	ys = ys * ys;

	return Math.sqrt( xs + ys );
}

var timeOfLastUpdate = new Date().valueOf();

function tick() {
	var newTime = new Date().valueOf();
	var tickTime = newTime - timeOfLastUpdate;
	
	if(tickTime >= 50) {
		for(var i in playerList) {
			var player = playerList[i];
			player.update();
		}
		
		if(packetNum%40 == 0) {
		//Every 40 packets send a whole state instead of a delta states
			io.sockets.emit('wholePacket', packetNum++, playerList);
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
		this.click = false;
		this.clickX = this.x;
		this.clickY = this.y;
		this.attack = false;
}

Entity.prototype.update = function() {
	var playerObject = new Object();
	playerObject.username = this.username;
	var toAdd = false; //If variables have been changed, add state to outgoing packet
	
	//if the character needs to move
	if ((this.clickY != this.y) || (this.clickX != this.x))
	{
		toAdd = true;
		var distance = lineDistance(this);
		var thisMovePercent = this.speed/ distance;

		var xMove = (this.clickX - this.x) * thisMovePercent;
		var yMove = (this.clickY - this.y) * thisMovePercent;

		var ySign = (this.clickY > this.y) ? 1 : -1;
		var xSign = (this.clickX > this.x) ? 1 : -1;

		if((this.y + yMove - this.clickY)*ySign > 0) {
			yMove = this.clickY - this.y;
		}

		if((this.x + xMove - this.clickX)*xSign > 0) {
			xMove = this.clickX - this.x;
		}
		//round it to the nearest 3 to compact the data, unless its too small
		if(Math.abs(xMove) > 0.01)
			xMove = roundNumber(xMove, 3);
		if(Math.abs(yMove) > 0.01)
			yMove = roundNumber(yMove, 3);

		this.y += yMove;
		this.x += xMove;
		playerObject.y = yMove;
		playerObject.x = xMove;
	}

	if(toAdd) { //New information being sent in packet
		newState.push(playerObject);
	}
}

//************************************************ PLAYER ***********************************************************
function Player(username, speed, hp, x, y) {
    Entity.call(this, username, speed, hp, x, y);
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.update = function() {
}

//************************************************ ENEMY *************************************************************
function Enemy(username, speed, hp, x, y) {
    Entity.call(this, username, speed, hp, x, y);
	this.clickX = this.x + Math.floor((Math.random()*300)-150);
	this.clickY = this.y + Math.floor((Math.random()*300)-150);
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
	Entity.prototype.update.call(this);
	/*
	if(this.clickX == this.x && this.clickY == this.y) {
		this.clickX = this.x + Math.floor((Math.random()*300)-150);
		this.clickY = this.y + Math.floor((Math.random()*300)-150);
	}
	*/
}