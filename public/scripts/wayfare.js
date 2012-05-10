function Wayfare() {
    GameEngine.call(this);
}
Wayfare.prototype = new GameEngine();
Wayfare.prototype.constructor = Wayfare;

Wayfare.prototype.start = function() {
	for(var x = 0; x < 60; x++)
	for(var y = 0; y < 60; y++) {
		this.addEntity(new Terrain(this, x*80, y*80, 0, 'img/grassA0.png'));
	}
	this.inventory = new Inventory(this);
	this.addGUI(new GuiInventory(this, this.ctx.canvas.width-382, this.ctx.canvas.height-420, 'img/inventory.png', this.inventory.mainInventory));
	this.addGUI(new GuiScreenOptions(this, 150, 100, 'img/options.png'));
	
    GameEngine.prototype.start.call(this);
}

Wayfare.prototype.update = function() {
    
    GameEngine.prototype.update.call(this);
}

Wayfare.prototype.draw = function() {
    GameEngine.prototype.draw.call(this);
}