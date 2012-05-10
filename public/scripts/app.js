window.requestAnimFrame = (function() {
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
})();

var canvas = document.getElementById('surface');
var ctx = canvas.getContext('2d');
var game = new Wayfare();

var socket = io.connect();
//startNetwork(socket, game);
var NETWORK_MANAGER = new NetworkManager(game, socket);
var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload('img/char0.png');
ASSET_MANAGER.queueDownload('img/grassA0.png');
ASSET_MANAGER.queueDownload('img/smallExplosion.png');
ASSET_MANAGER.queueDownload('img/beardguy.png');
ASSET_MANAGER.queueDownload('img/inventory.png');
ASSET_MANAGER.queueDownload('img/slot.png');
ASSET_MANAGER.queueDownload('img/slotOutline.png');
ASSET_MANAGER.queueDownload('img/linkEvil.png');
ASSET_MANAGER.queueDownload('img/linkGreen.png');
ASSET_MANAGER.queueDownload('img/sword.png');
ASSET_MANAGER.queueDownload('img/morningstar.png');
ASSET_MANAGER.queueDownload('img/options.png');
ASSET_MANAGER.queueDownload('img/buttonClose.png');
ASSET_MANAGER.queueDownload('img/buttonCloseHover.png');



ASSET_MANAGER.downloadAll(function() {
    game.init(ctx);
    game.start();
});