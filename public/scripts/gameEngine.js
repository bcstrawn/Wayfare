function GameEngine() {
    this.entities = [];
	this.GUI = [];
    this.ctx = null;
    this.click = null;
	this.dblClick = null;
	this.key = 0;
	this.key2 = 0;
	this.keyPress = 0;
    this.mouse = null;
	this.mouseTemp = null;
	this.mouseDownEvent = false;
	this.mouseUpEvent = false;
	this.mouseDown = false;
    this.timer = new Timer();
    this.surfaceWidth = null;
    this.surfaceHeight = null;
	this.newState = null;
	this.inventory;
}

GameEngine.prototype.init = function(ctx) {
    console.log('game initialized');
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
}

GameEngine.prototype.start = function() {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function() {
    var getXandY = function(e) {
        var x =  e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
        return {x: x, y: y};
    }
    
    var that = this;
    
    this.ctx.canvas.addEventListener("click", function(e) {
        that.click = getXandY(e);
        e.stopPropagation();
        e.preventDefault();
    }, false);
    
    this.ctx.canvas.addEventListener("mousemove", function(e) {
        that.mouse = getXandY(e);
    }, false);
	
    this.ctx.canvas.addEventListener("mousedown", function(e) {
		that.mouseDownEvent = true;
        that.mouseDown = true;
        that.mouseTemp = that.mouse;
    }, false);	
	
    this.ctx.canvas.addEventListener("mouseup", function(e) {
        that.mouseDown = false;
		that.mouseUpEvent = true;
    }, false);
	
    this.ctx.canvas.addEventListener("dblclick", function(e) {
        //that.dblClick = true;

//*********************************************************************************************************************
        that.dblclick = getXandY(e);
        e.stopPropagation();
        e.preventDefault();

        socket.emit('dblclick', that.dblclick.x, that.dblclick.y);
//***********************************************************************************************************************
    }, false);
	
	document.getElementById("canvasContainer").addEventListener("keydown", function(e) {
		if(that.key != e.keyCode) {
			//if a second key is pressed then set key2 to the old key
			that.key2 = that.key;
		}
		that.key = e.keyCode;
    }, false);
	
	document.getElementById("canvasContainer").addEventListener("keyup", function(e) {
		that.keyPress = that.key;	
		if(that.key2) {
			//if there was a second key pressed
			that.key2 = 0;
		} else {
			that.key = 0;
		}
    }, false);
}

GameEngine.prototype.addEntity = function(entity) {
    this.entities.push(entity);
}

GameEngine.prototype.getEntityByName = function(name) { 
	for(var i = 0; i < this.entities.length; i++) {
		if(this.entities[i].username && this.entities[i].username == name) {
			return this.entities[i];
		}
	}
	return 0;
}

GameEngine.prototype.addGUI = function(element) {
    this.GUI.push(element);
}

GameEngine.prototype.draw = function(callback) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
	
	//console.log("drawing");
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    for (var i = 0; i < this.GUI.length; i++) {
        this.GUI[i].draw(this.ctx);
    }
    if (callback) {
        callback(this);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function() {
    var entitiesCount = this.entities.length;
    //var selectedEntities = [];
    var selectedEntity;
	var hoverEntity = null;
	var guiClick = false;
	var dt = this.clockTick*1000;
	
	//if the 'm' key was pressed then make an evil link
	if (this.keyPress) {
		if(this.keyPress == 77) {
			NETWORK_MANAGER.createEnemy();
		}
	}
	
	if(!this.key && !this.key2) {
		//if there are no keys pressed then stop moving
		NETWORK_MANAGER.stopMove();	
	}
	
	if(this.key) {
		switch(this.key) {
			case 188:
				NETWORK_MANAGER.move(1);
				break;
			case 65:
				NETWORK_MANAGER.move(4);
				break;
			case 69:
				NETWORK_MANAGER.move(2);
				break;
			case 79:
				NETWORK_MANAGER.move(3);
				break;
		}
	}

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];
        
        if (!entity.removeFromWorld) {
            entity.update(dt);
        }
		if(this.mouse && entity.username && entity.isInsideEntity(this.mouse.x, this.mouse.y)) {
			hoverEntity = entity;
		}
    }
    
    for (var i = this.entities.length-1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
	
    for (var i = 0; i < this.GUI.length; i++) {
		var _GUI = this.GUI[i];
		if(this.mouseUpEvent) {
			_GUI.mouseUp = true;
			console.log("mouse up");
		}		
		if(_GUI.isMouseInsideGUI()) {
			if(this.mouseDownEvent) {
				_GUI.mouseDown = true;
			}
			if(this.click) {
				_GUI.clicked = true;
				guiClick = true;
			}
		}
		if(_GUI.slotDragged) {
			guiClick = true;
		}
        _GUI.update();
    }
	
	//if the mouse has moved while pressing down
	if (this.mouse && this.mouseDown && (this.mouse.x != this.mouseTemp.x || this.mouse.y != this.mouseTemp.y)) {
		var xMove = this.mouseTemp.x - this.mouse.x;
		var yMove = this.mouseTemp.y - this.mouse.y;
		for (var i = 0; i < this.GUI.length; i++) {
			this.GUI[i].mouseDragged(xMove, yMove);
		}
		this.mouseTemp = this.mouse;
	}

	//when the user has clicked in the game
	if(this.click) {
		//if the mouse is clicked on a gui
		if(!guiClick) {
			this.addEntity(new Explosion(this, this.mouse.x, this.mouse.y));
		}
	}
	
	//update entities
	if(!this.newState) {
		this.newState = NETWORK_MANAGER.getNewState();
		if(!this.newState) {
			console.log("ERROR: no state to use");
			return;
		}
	}

	while(dt > 0) {
		if(dt < this.newState.time) {
			this.useState(dt);
			this.newState.time -= dt;
			dt = 0;
		}
		else {
			this.useState(this.newState.time);
			dt -= this.newState.time;
			this.newState = NETWORK_MANAGER.getNewState();
		}
	}
}

GameEngine.prototype.useState = function(dt) {
	if(!this.newState) {
		return;
	}
	for(var i = 0; i < this.newState.array.length; i++) {
		var update = this.newState.array[i];
		var entity = this.getEntityByName(update.username);
		if(!entity) {
			console.log("ERROR: packet contains null player: " + update.username);
			return;
		}
		var xToMove = 0, yToMove = 0;
		if(update.x) {
			xToMove = (dt/50.0) * update.x;
		}
		if(update.y) {
			yToMove = (dt/50.0) * update.y;
		}
		
		var dir = -1;
		if(Math.abs(xToMove) > Math.abs(yToMove))
			if(xToMove < 0)
				dir = 3;
			else
				dir = 2;
		else
			if(yToMove < 0)
				dir = 0;
			else
				dir = 1;

		if(Math.abs(xToMove) > 0.01 || Math.abs(yToMove) > 0.01) {
			entity.setDirection(dir);
			entity.moving = true;
		}
		else
			entity.moving = false;
			
		if(update.health) {
			entity.health += update.health;
			console.log("health update(" + update.health + ") : " + entity.health + " / " + entity.maxHealth);
			update.health = 0;
		}
			
		entity.timeSinceUpdate = 0;
		entity.setXandY(entity.x + xToMove, entity.y + yToMove);
	}
}

GameEngine.prototype.loop = function() {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
	this.dblClick = false;
	this.mouseDownEvent = false;
	this.mouseUpEvent = false;
	this.keyPress = 0;
	NETWORK_MANAGER.update();
}