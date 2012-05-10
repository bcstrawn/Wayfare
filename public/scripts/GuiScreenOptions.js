function GuiScreenOptions(game, x, y, sprite) {
    GUI.call(this, game, x, y, sprite);
	this.game = game;
	this.buttons = [];
	this.buttons.push(game.addGUI(new Button(game, x+300, y+350, 'Close', this, 1)));
	this.texts = [];
	this.divs = [];

	for(var i = 0; i < 4; i++) {
		var newDiv = 
			"<div class='texts' id='text"+i+"' style='position:absolute; z-index:30;'>" +
			"<input type='text' id='input"+i+"' style='width:20px;'>" +
			"</div>";
		$("#canvasContainer").append(newDiv);

		var canvas = document.getElementById('surface');
		var div = document.getElementById('text'+i);
		var text = document.getElementById('input'+i);
		this.divs.push(div);
		this.texts.push(text);
		div.style.left = (this.x+canvas.offsetLeft+100)+"px";
		div.style.top =  (this.y+canvas.offsetTop+ 100+i*40)+"px";
		div.style.height = "20px";	
	}
}

GuiScreenOptions.prototype = new GuiScreen();
GuiScreenOptions.prototype.constructor = GuiScreenOptions;

GuiScreenOptions.prototype.draw = function(ctx) {
	GuiScreen.prototype.draw.call(this, ctx);
}

GuiScreenOptions.prototype.remove = function() {
	for(var i = 0; i < this.buttons.length; i++) {
		this.game.removeGUI(this.buttons[i]);
	}
	for(var i = 0; i < this.divs.length; i++) {
		var text = this.texts[i].value;
		console.log("text: " + text);
		document.getElementById('canvasContainer').removeChild(this.divs[i]);
	}
}


GuiScreenOptions.prototype.update = function () {
	for(var i = 0; i < this.buttons.length; i++) {
		var _button = this.buttons[i];
		if(_button.clicked) {
			if(_button.id == 1) {
			//if its the close button
				this.toRemove = true;
			}
		}
	}
}