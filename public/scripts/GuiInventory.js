function GuiInventory(game, x, y, sprite, inv) {
    GuiScreen.call(this, game, x, y, sprite);
	this.inventory = inv;
	this.slotSprite = ASSET_MANAGER.getAsset('img/slot.png');
	this.slotOutline = ASSET_MANAGER.getAsset('img/slotOutline.png');
	this.slotDragged = null;
}

GuiInventory.prototype = new GuiScreen();
GuiInventory.prototype.constructor = GuiInventory;


GuiInventory.prototype.draw = function(ctx) {
	GUI.prototype.draw.call(this, ctx);
    ctx.drawImage(this.sprite, this.x, this.y);
	
	for(var i = 0; i < this.inventory.length; i++) {
		var slot = this.inventory[i];
		ctx.drawImage(this.slotSprite, this.x + slot.x, this.y + slot.y);
		if(slot.hover) {
			ctx.drawImage(this.slotOutline, this.x + slot.x-1, this.y + slot.y-1);
		}
		if(slot.sprite) {
			ctx.drawImage(slot.sprite, this.x + slot.x+6, this.y + slot.y+6);
		}
	}
	
	if(this.slotDragged) {
		ctx.drawImage(this.slotDragged.sprite, this.slotDragged.x, this.slotDragged.y);
	}
}

GuiInventory.prototype.update = function () {
	for(var i = 0; i < this.inventory.length; i++) {
		var slot = this.inventory[i];
		if(this.isMouseInsideGUI(slot.x+this.x, slot.y+this.y, this.slotOutline)) {
			slot.hover = true;
			if(this.clicked) {
				slot.sprite = ASSET_MANAGER.getAsset('img/morningstar.png');
			}
			if(this.mouseDown && slot.sprite) {
				this.slotDragged = new Slot(slot.x+this.x, slot.y+this.y);
				this.slotDragged.sprite = slot.sprite;
				slot.sprite = null;
			}
		} else {
			slot.hover = false;
		}
	}
	if(this.mouseUp) {
		this.slotDragged = null;
	}
	this.mouseUp = false;
	this.clicked = false;
	this.mouseDown = false;
}

GuiInventory.prototype.mouseDragged = function(x, y) {
	if(this.slotDragged) {
		this.slotDragged.x -= x;
		this.slotDragged.y -= y;
	}
}