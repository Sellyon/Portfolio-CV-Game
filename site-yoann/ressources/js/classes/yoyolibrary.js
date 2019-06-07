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
//    This is where I experiment a library creation.
//
//************************************************************************/ //

'use strict';


var yoyo = {

	// method used to create a movement as a squared spiral, each time this method is called with updated spiralbox it return the coordinates of the next tile/zone where the spiral goes
	createSpirale: function (spiraleBox) {
		if (spiraleBox.c !== undefined) {
			var c = spiraleBox.c;
			var cx = spiraleBox.cx;
			var cy = spiraleBox.cy;
			var cxm = spiraleBox.cxm;
			var cym = spiraleBox.cym;
		} else {
			var c = 0;
			var cx = 0; // x coordinate
			var cy = 0; // y coordinate
			var cxm = 0;
			var cym = 0;
		}
		// function used to determinate if c is even or not
		var isEven = function(nombre) {
			return nombre % 2 === 0;
		}

		
		// The principle is : we have "c" the master counter that is used for two things : precise the direction of the next tile (if c is even x and y will be in positive direction, if c is not even x and y will be in negative direction) and check the number of tiles to set : at c = 1 we have to set 1 tile in x axe and 1 in y axe, then c = 2 so we have to put 2 tiles in x then in y etc...
		if(isEven(c)){ // if c is even we set x and y tiles in +
			if (cxm <= c) {
				cx ++;
				cxm ++;
			} else if (cxm > c && cym <= c) {
				cy ++;
				cym ++;
			} else if (cxm > c && cym > c) {
				c++;
				cxm = 0;
				cym = 0;
			}
		} else { // if c is not even we set x and y tiles in -
			if (cxm >= -c) {
				cx --;
				cxm --;
			} else if (cxm < -c && cym >= -c) {
				cy --;
				cym --;
			} else if (cxm < -c && cym < -c) {
				c++;
				cxm = 0;
				cym = 0;
			}
		}
		return spiraleBox = {
			c: c,
			cx: cx,
			cy: cy,
			cxm: cxm,
			cym: cym
		}
	},

	// Get the distance between two points in the canvas
	getDistanceTwoPoints: function (pointA, pointB) {
		var distance = Math.sqrt(Math.pow((pointA.x - pointB.x), 2) + Math.pow((pointA.y - pointB.y), 2));
		return distance;
	},

	// Get the hitbox of a character in accordance with moves vectors
	getHitboxCharac: function(charac, vecteurX, vecteurY, forHitTest) {
		if (vecteurX === undefined) {
			vecteurX = charac.x;
		}
		if (vecteurY === undefined) {
			vecteurY = charac.y;
		}
		var hitboxCharac = {
			x: charac.x + charac.width / 2 - charac.collWidth / 2,
			maxX: charac.x + charac.width / 2 + charac.collWidth / 2,
			y: charac.y + charac.height - charac.collHeight - charac.recalageCollHeight,
			maxY: charac.y + charac.height - charac.recalageCollHeight,
			vectX: vecteurX + charac.width / 2 - charac.collWidth / 2,
			vectMaxX: vecteurX + charac.width / 2 + charac.collWidth / 2,
			vectY: vecteurY + charac.height - charac.collHeight - charac.recalageCollHeight,
			vectMaxY: vecteurY + charac.height - charac.recalageCollHeight
		}
		if (forHitTest) { // if we test hitbox of a player versus an ennemy, we use larger hitboxes
			hitboxCharac.y = charac.y + (charac.height - charac.collHeight) / 2 - charac.recalageCollHeight;
		}
		return hitboxCharac
	},

	testRectangleVSRectangleColl: function (hitboxCharac, hitboxRectangle, checkCollBox) { // system used to test collision between two rectangles
		// Here we test if the two rectangles are aligned in both x and y axes (so there is collision)
		if (hitboxCharac.vectMaxY > hitboxRectangle.y && hitboxCharac.vectY < hitboxRectangle.maxY && hitboxCharac.vectMaxX > hitboxRectangle.x && hitboxCharac.vectX < hitboxRectangle.maxX) {
			// test to see if the collision is in x axe
			if (hitboxCharac.maxY > hitboxRectangle.y && hitboxCharac.y < hitboxRectangle.maxY) {
				checkCollBox.horiz = false;
			}
			if (hitboxCharac.maxX > hitboxRectangle.x && hitboxCharac.x < hitboxRectangle.maxX) {
			// test to see if the collision is in y axe
				checkCollBox.vert = false;
			}
			// If no axe is in collision that mean character is trying to move in diagonal in a corner, so we refuse every movement
			if (checkCollBox.horiz && checkCollBox.vert) {
				checkCollBox.horiz = false;
				checkCollBox.vert = false;
			}
		}
		return checkCollBox
	},

	testDroiteVSRectangleColl: function (droite, rectangle) { // Systeme pour tester les collisions d'un segment sur un rectangle

	// Le principe : on cherche à déterminer s'il y a intersection entre un segment et chaque segment formant la hitbox de l'objet testé. Je suis aller m'inspirer du code ici : https://stackoverflow.com/questions/3746274/line-intersection-with-aabb-rectangle

	// hitbox du rectangle
		var segments = [
			{ // segment AB
				b1x: rectangle.x,
				b1y: rectangle.y,
				b2x: rectangle.maxX,
				b2y: rectangle.y
			},
			{ // segment BD
				b1x: rectangle.maxX,
				b1y: rectangle.y,
				b2x: rectangle.maxX,
				b2y: rectangle.maxY
			},
			{ // segment CD
				b1x: rectangle.x,
				b1y: rectangle.maxY,
				b2x: rectangle.maxX,
				b2y: rectangle.maxY
			},
			{ // segment AC
				b1x: rectangle.x,
				b1y: rectangle.y,
				b2x: rectangle.x,
				b2y: rectangle.maxY
			} 
		]

		for (var j = 0; j < 4; j++) {
			
				
			// Segment rectangle testé
			var b1x = segments[j].b1x;
			var b1y = segments[j].b1y;
			var b2x = segments[j].b2x;
			var b2y = segments[j].b2y;

				// a1 is line1 start, a2 is line1 end, b1 is line2 start, b2 is line2 end
			var Intersects = (function (droite, b1x, b1y, b2x, b2y) {

			    var b = {
			    	x: droite.a2x - droite.a1x,
			    	y: droite.a2y - droite.a1y
			    	}
			    var d = {
			    	x: b2x - b1x,
			    	y: b2y - b1y
			    	}
			    var bDotDPerp = b.x * d.y - b.y * d.x;

			    // Si b dot d === 0, it means the lines are parallel so have infinite intersection points
			    if (bDotDPerp === 0)
			        return false;

			    var c = {
			    	x: b1x - droite.a1x,
			    	y: b1y - droite.a1y
			    	}
			    var t = (c.x * d.y - c.y * d.x) / bDotDPerp;
			    if (t < 0 || t > 1)
			        return false;

			    var u = (c.x * b.y - c.y * b.x) / bDotDPerp;
			    if (u < 0 || u > 1)
			        return false;

			    //var intersection = a1 + t * b;

			    return true;
			})(droite, b1x, b1y, b2x, b2y);

			// Résolution des cas où la collision est vérifiée
			if (Intersects) {
				// On arrête la boucle for avec j
				j = 4;
				return true
			}
		}
		return false
	},

	detruireDestructible: function (thisMap, destructible) {
		// Lorsqu'un destructible est détruit on met à jour le layer de la map
		if (destructible.properties[0].name === 'Tile') {
			var numberTileToChange = Math.round(destructible.y * 21 / 32 + destructible.x / 32);
			for (var k = 0; k < thisMap.layerProperties.length; k++) {
				// On efface la tuile du destructible sur son layer, en le cherchant par son zIndex
				if (thisMap.layerProperties[k].zIndex === destructible.zIndex) {
					thisMap.layerTileArray[k][numberTileToChange] = 0;
					k = thisMap.layerProperties.length;
					// on va placer une tuile "destroyed" sur le premier layer "destroyedCollector" que l'on trouve
					for (var l = 0; l < thisMap.layerProperties.length; l++) {
						if (thisMap.layerProperties[l].destroyedCollector) {
							thisMap.layerTileArray[l][numberTileToChange] = destructible.properties[0].value
						}
					}
				}
			}
		}
		// On passe destroyed à true pour éviter de retester la collision + la tagger comme à delete à la fin de l'attaque
		destructible.destroyed = true;
	},

	supprimerCollisions: function (thisMap) {
		for (var i = 0; i < thisMap.settingCollisions.length; i++) {
			// Si on trouve une collision taggée "destroyed" on la supprime
			if (thisMap.settingCollisions[i].destroyed === true) {
				thisMap.settingCollisions.splice(i, 1);
				// on retire 1 à i pour ne pas sauter d'index dans le tableau raccourci
				i --;
			}
		}
	},

	InvokeFX: function (thisMap, FXBox, url, delay, frameSpeed) {
		this.animFrame = 0;
		this.image = new Image();
		this.x = FXBox.x;
		this.y = FXBox.y;
		this.width = FXBox.width;
		this.height = FXBox.height;
		this.frameNumber = FXBox.frameNumber;
		this.frameSpeed = frameSpeed;
		var thisFX = this;
		this.image.onload = function() {
			if(!this.complete) 
				throw 'Erreur de chargement du sprite nommé \'' + url + '\'.';
			}
		this.image.src = 'ressources/sprites/' + url;
		this.addToTheMap = (function () {
			setTimeout(function() {
				thisMap.addFX(thisFX);
			}, delay);
		}());
	},

	createNewThunderFX: function (thisMap, x, y) {
		thisMap['FX' + (thisMap.FX.length + 1)] = new yoyo.InvokeFX(thisMap, {x:x, y:y, width:63, height:250, frameNumber:8}, 'thunder.png', 0, 15);
	},

	createNewDeadDustFX: function (thisMap, ennemi, delay) {
		if (delay === undefined) {
			delay = 1000;
		}
		thisMap['FX' + (thisMap.FX.length + 1)] = new yoyo.InvokeFX(thisMap, {x:ennemi.x + ennemi.width / 2, y:ennemi.y + ennemi.height / 2, width:48, height:48, frameNumber:7}, 'dust.png', delay, 15);
	},

	createNewExclamationPointFX: function (thisMap, ennemi) {
		thisMap['FX' + (thisMap.FX.length + 1)] = new yoyo.InvokeFX(thisMap, {x:ennemi.x + ennemi.width / 2, y:ennemi.y - 28, width:32, height:32, frameNumber:8}, 'exclamationPoint.png', 0, 4);
	},

	CreateItem: function (url, dimensions, bonus, ID, sinFactor) {
		this.image = new Image();
		this.x = dimensions.x;
		this.y = dimensions.y;
		this.zIndex = Math.floor((dimensions.y + dimensions.height / 2) / 32) ;
		this.isDrawn = false;
		this.sinFactor = 0;
		this.specialItem = false;
		if (ID !== undefined) {
			this.ID = ID;
		}
		if (bonus !== undefined && isNaN(bonus)) {
			this.specialItem = bonus;
			this.bonus = 0;
			this.sinFactor = 1;
		} else if (bonus !== undefined) {
			this.bonus = bonus;
		} else {
			this.bonus = 0;
		}
		this.spritesPerLine = dimensions.spritesPerLine;
		this.width = dimensions.width;
		this.height = dimensions.height;
		var thisItem = this;
		this.image.onload = function() {
			if(!this.complete) 
				throw 'Erreur de chargement du sprite nommé \'' + url + '\'.';
			}
		this.image.src = 'ressources/sprites/' + url;
	},

	createTreasure: function (dimensions, bonus, destination, ID) {
		destination[destination.length] = new yoyo.CreateItem('gold.png', dimensions, bonus, ID);
	},

	createJavascriptItem: function (dimensions, destination) {
		destination[destination.length] = new yoyo.CreateItem('javascriptAsCollectible.png', dimensions, 'javascript');
	},

	createAngularItem: function (dimensions, destination) {
		destination[destination.length] = new yoyo.CreateItem('angularAsCollectible.png', dimensions, 'angular');
	},

	createNodeJSItem: function (dimensions, destination) {
		destination[destination.length] = new yoyo.CreateItem('nodeJSAsCollectible.png', dimensions, 'nodeJS');
	},
}