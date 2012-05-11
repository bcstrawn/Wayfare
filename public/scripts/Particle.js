function Particle(game, x, y) {
    Entity.call(this, game, x, y);
	
    this.animation = new Animation(ASSET_MANAGER.getAsset('img/shine.png'), 24, 25, 0.1);
}

Particle.prototype = new Entity();
Particle.prototype.constructor = Particle;

Particle.prototype.update = function() {
    Entity.prototype.update.call(this);
    if (this.animation.isDone()) {
        this.removeFromWorld = true;
    }
	this.y -= .5;
}

Particle.prototype.draw = function(ctx) {
    Entity.prototype.draw.call(this, ctx);
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
}