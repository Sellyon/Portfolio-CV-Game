//*************************************************************************/ //
//************************* Endless Dungeon *******************************/ //
//*************************************************************************/ //
//
//   ./CVRPG/ressources/js/rpg.js
//
//  .Version : 1.0
//
//  .Team :
//    - Programmer : Yoann Mroz
//    - Graphic Assets :
//	 	- Telles (https://www.deviantart.com/telles0808)
//		- Hyptosis (http://www.lorestrome.com/)
//		- Clint Bellanger (http://clintbellanger.net or to http://heroinedusk.com)
//    - Sound Design : WIP
//    - UX/UI Design : Fanta Mroz
//
//
//  .Game description :
//    This is a classic old school zelda-like game.
//
//    The player start in a dungeon-like level, he have to collect some
//    special items in order to get the god-like super power of a javascript
//    programer.
//
//    The dungeon is made with same dimensional rooms organized like a 
//	  classic scripted dungeon crawler game
//
//    Each room is created with a tileset system.
//
//    The game is design to be played on desktops computers only... for now.
//
//    Enjoy :)
//
//
//  .Page description
//    Here is defined the constructor function of the Tileset "translator"
//
//************************************************************************/ //
'use strict';


//******************************* Rooms ***********************************/ //

function Tileset(url) {
	// Image loading in image attribute
	this.image = new Image();
	this.image.tilesetReference = this;
	this.image.onload = function() {
		if(!this.complete) 
			throw new Error("Loading error for tileset named \"" + url + "\".");
		// Tileset width in tiles
		this.tilesetReference.width = this.width / 32;
	}
	this.image.src = "ressources/tilesets/" + url;
}


// draw method
Tileset.prototype.drawTile = function(numero, context, xDestination, yDestination) {
	var xSourceInTiles = numero % this.width;
	if(xSourceInTiles == 0) xSourceInTiles = this.width;
	var ySourceInTiles = Math.ceil(numero / this.width);
	var xSource = (xSourceInTiles - 1) * 32;
	var ySource = (ySourceInTiles - 1) * 32;
	context.drawImage(this.image, xSource, ySource, 32, 32, xDestination, yDestination, 32, 32);
}