function Terrain(game, x, y, type, sprite) {
    Entity.call(this, game, x, y);
    this.type = type;
	this.sprite = ASSET_MANAGER.getAsset(sprite);
}
Terrain.prototype = new Entity();
Terrain.prototype.constructor = Terrain;

Terrain.prototype.draw = function(ctx) {
    ctx.drawImage(this.sprite, this.x, this.y);
}