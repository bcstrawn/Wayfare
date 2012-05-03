function Explosion(game, x, y) {
    Entity.call(this, game, x, y);
	
    this.animation = new Animation(ASSET_MANAGER.getAsset('img/smallExplosion.png'), 60, 60, 0.07);
    this.radius = this.animation.frameWidth / 2;
}
Explosion.prototype = new Entity();
Explosion.prototype.constructor = Explosion;

Explosion.prototype.update = function() {
    Entity.prototype.update.call(this);
    if (this.animation.isDone()) {
        this.removeFromWorld = true;
    }
}

Explosion.prototype.draw = function(ctx) {
    Entity.prototype.draw.call(this, ctx);
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
}