function Button(game, x, y, type) {
    this.type = type;
    GUI.call(this, game, x, y, ASSET_MANAGER.getAsset('img/' + this.type + '.png'));
}

Button.prototype = new GUI();
Button.prototype.constructor = Button;
