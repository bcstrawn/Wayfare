function Slot(x, y) {
	this.x = x;
	this.y = y;
	this.hover = false;
	this.sprite = null;
}


function Inventory(game) {
    this.game = game;
	this.mainInventory = [];
	this.invLength = 16;
	this.width = 4;
	this.init();
}

Inventory.prototype.init = function() {
	for(var x = 0; x < this.width; x++)
	for(var y = 0; y < this.invLength/this.width; y++) {
		this.mainInventory.push(new Slot(35+x*78, 35+y*76));
	}
}

Inventory.prototype.addItem = function(item) {
	var slotNum = this.getFirstEmptySlot();
	if(slotNum >= 0) {
		this.mainInventory[slotNum].item = item;
	}
}

Inventory.prototype.getFirstEmptySlot = function() {
    for(var i = 0; i < this.invLength; i++) {
		if(!this.mainInventory[i].item) {
			return i;
		}
	}
	return -1;
}