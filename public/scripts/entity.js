function Entity(game, x, y, hp) {
    this.game = game;
    this.x = x;
    this.y = y;
	this.health = hp;
	this.maxHealth = hp;
    this.removeFromWorld = false;
	this.selected = false;
	this.moving = false;
	this.attack = false;
	this.attackFrame = 0;
	this.z = 0;
}

Entity.prototype.setXandY = function(x, y) {
	this.x = x;
	this.y = y;
}

Entity.prototype.update = function() {
}

Entity.prototype.draw = function(ctx) {
}

Entity.prototype.isInsideEntity = function(x, y) {
	if(x >= this.x && x <= (this.x + this.sprite.width) && y >= this.y && y <= (this.y + this.sprite.height)) {
		return true;
	}
	return false;
}

Entity.prototype.rotateAndCache = function(image) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.translate(size/2, size/2);
    offscreenCtx.rotate(this.angle + Math.PI/2);
    offscreenCtx.drawImage(image, -(image.width/2), -(image.height/2));
    return offscreenCanvas;
}