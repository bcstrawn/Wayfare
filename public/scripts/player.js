function Player(game, x, y, name, sprite, hp) {
    Entity.call(this, game, x, y, hp);
	this.username = name;
	this.sprite = ASSET_MANAGER.getAsset('img/' + sprite + '.png');
	this.animation = null;
	this.direction = 0;
	this.stopMoving = true;
	this.h = 66;
	this.w = 60;
	this.timeSinceUpdate = 0;
}
Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.update = function(dt) {
	this.timeSinceUpdate += dt;
	this.moving = false;
	if(this.timeSinceUpdate > 3000) {
	//if it has been 3 seconds since the last update then assume they have disconnectd,
	//and delete the player
		this.removeFromWorld = true;
	}
	if(this.attack) {
	//if the player is attacking then add dt to the attackFrame
		this.attackFrame += dt;
		if(this.attackFrame > 500) {
		//and if the attackFrame has lasted half a second then stop attacking
			this.attack = false;
			this.attackFrame = 0;
		}
	}
}

Player.prototype.setDirection = function(_dir) {
//this will set a new animation and direction when the player starts moving
	if(_dir != this.direction || this.stopMoving) {
	//if the player changes direction or has stopped moving before then set a new animation
		this.animation = new Animation(this.sprite, this.w, this.h, 0.1, this.w, _dir, 1, 6);
		this.stopMoving = false;
	}
	this.direction = _dir;
}

Player.prototype.draw = function(ctx) {
	//var _sprite = ASSET_MANAGER.getAsset('img/linkNorth.png');
	if(!this.moving) {
		this.animation = null;
		this.stopMoving = true;
	}

	if(this.moving && this.animation) {
	//if its moving and has an animation then animate it
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else if(this.attack) {
	//if the player is attacking then animate the attack
		ctx.drawImage(this.sprite,
					  420, this.direction*this.h,	//source from sheet
					  this.w, this.h,				//H&W from the sheet
					  this.x, this.y,				//X&Y onto the canvas
					  this.w, this.h);				//H&W onto the canvas
	} else {
	//otherwise draw it standing still
		ctx.drawImage(this.sprite,
					  0, this.direction*this.h,		//source from sheet
					  this.w, this.h,				//H&W from the sheet
					  this.x, this.y,				//X&Y onto the canvas
					  this.w, this.h);				//H&W onto the canvas
					  
		/*		
		ctx.strokeStyle = '#000';
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		//test draw the attack box

		ctx.strokeStyle = '#f00';
		var midY = this.y + this.h/2.0;
		if(this.username == this.game.username) {
			ctx.strokeRect(this.x, midY - this.h, this.w+10, midY + this.h/2.0 - this.y);
		}
		*/
	}
	//draw the name
	ctx.font = "15px '"+"Courier New"+"'";
	ctx.fillStyle = "#000000";
	ctx.fillText(this.username, this.x+15, this.y);
	//draw the health bar
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(this.x+5, this.y-20, (this.health/this.maxHealth)*50, 7);
}

Player.prototype.isInsideEntity = function(x, y) {
	if(x >= this.x && x <= (this.x + this.w) && y >= this.y && y <= (this.y + this.h)) {
		return true;
	}
	return false;
}