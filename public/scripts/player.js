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
		this.removeFromWorld = true;
	}
}

Player.prototype.setDirection = function(_dir) {
	if(_dir != this.direction || this.stopMoving) {
		this.animation = new Animation(this.sprite, this.w, this.h, 0.1, this.w, _dir, 1);
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
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	}
	else {
		ctx.drawImage(this.sprite,
					  0, this.direction*this.h,  // source from sheet
					  this.w, this.h,
					  this.x, this.y,
					  this.w, this.h);
					  
		//ctx.drawImage(this.sprite, this.x, this.y);
	}
		
	ctx.font = "15px '"+"Courier New"+"'";
	ctx.fillStyle = "#000000";
	ctx.fillText(this.username, this.x+15, this.y);
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(this.x+5, this.y-20, (this.health/this.maxHealth)*50, 7);
}

Player.prototype.isInsideEntity = function(x, y) {
	if(x >= this.x && x <= (this.x + this.w) && y >= this.y && y <= (this.y + this.h)) {
		return true;
	}
	return false;
}