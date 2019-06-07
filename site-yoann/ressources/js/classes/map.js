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
//    Here is defined the constructor function of all maps
//
//************************************************************************/ //

'use strict';


//************************************************************************/ //
//*************************** Get the json files *************************/ //
//************************************************************************/ //

function Map(nom, x, y) {
    // XmlHttpRequest object creation
    var xhr = getXMLHttpRequest();

    // File loading
    xhr.open('GET', './ressources/maps/'+ nom + '.json', false);
    xhr.send(null);
    if(xhr.readyState !== 4 || (xhr.status !== 200 && xhr.status !== 0)) // Code === 0 en local
        throw new Error('Impossible to load file map named \'' + nom + '\' (code HTTP : ' + xhr.status + ').');
    var mapJsonData = xhr.responseText;

    // Data analyse
    var mapData = JSON.parse(mapJsonData);
    this.numberLayers = Object.keys(mapData.layers).length;
    this.tilesetOfRoom = new Tileset(mapData.tilesets[0].source);
    // Tilesets files created with Tiled are linked to a .tsx, so we have to redirect here to the .png tilset file
    var sourceLength = this.tilesetOfRoom.image.src.length;
    this.tilesetOfRoom.image.src = this.tilesetOfRoom.image.src.substring(0, sourceLength - 4) + '.png';
	this.layerTileArray = [];
	this.layerObjectsArray = [];
	this.layerProperties = [];
	this.layerType = [];
	this.collectibles = [];
	this.settingCollisions = [];
	this.pathfind = [];
	this.exits = [];
	this.exitsImage = new Image();
	this.exitsImage.src = 'ressources/sprites/arrow.png';
	this.clearEnnemiesNeeded = false;
	this.isCurrentRoom = false;
	this.roomTransitionValueX = x;
	this.roomTransitionValueY = y;
	var thisEllipse = {};

	// Getting layer and putting them on array properties
    for (var g = 0; g < this.numberLayers; g++) {
    	this.layerType[g] = mapData.layers[g].type;

    	// Here we adapt datas stored in the mapData as arrays and we turn them into properties, wich is much convenient
    	this.layerProperties[g] = {};
    	for (var i = 0; i < mapData.layers[g].properties.length; i++) {
    		var propertyName = mapData.layers[g].properties[i].name;
    		var propertyValue = mapData.layers[g].properties[i].value;
    		this.layerProperties[g][propertyName] = propertyValue;
    	}

    	// If it is a tile layer, then we store the array in this.layerTileArray or this.pathfind
    	if (this.layerType[g] === 'tilelayer' && !this.layerProperties[g].pathfind) {
    		this.layerTileArray[g] = mapData.layers[g].data;
    	} else if (this.layerType[g] === 'tilelayer' && this.layerProperties[g].pathfind) {
    		this.pathfind = mapData.layers[g].data;
    	}

    	// Here we start to sort layers objects by type : collisions, exits, ennemies or items
    	if (this.layerType[g] === 'objectgroup') {
    		// Here we sort collision by two types : collisions and destrucitbles
    		if (this.layerProperties[g].collisions) {
    			var lengthBeforeFusion = this.settingCollisions.length;
    			Array.prototype.push.apply(this.settingCollisions, mapData.layers[g].objects);
				for (var i = lengthBeforeFusion; i < lengthBeforeFusion + mapData.layers[g].objects.length; i++) {
					this.settingCollisions[i].inCollision = false;
					this.settingCollisions[i].destroyed = false;
					this.settingCollisions[i].i = i;
					this.settingCollisions[i].zIndex = this.layerProperties[g].zIndex;
					this.settingCollisions[i].destructible = this.layerProperties[g].destructible;
					// Here we sort collisions in two types : rectangles and ellipses
					if (this.settingCollisions[i].type === 'square') {
						this.settingCollisions[i].maxX = this.settingCollisions[i].x + this.settingCollisions[i].width;
						this.settingCollisions[i].maxY = this.settingCollisions[i].y + this.settingCollisions[i].height;
					}
					if (this.settingCollisions[i].type === 'ellipse') {
						thisEllipse[i] = this.settingCollisions[i];
						this.settingCollisions[i].angleAlpha = 0;
						this.settingCollisions[i].getCenter = function () {
							var coordCentre = {
								x: thisEllipse[this.i].x + thisEllipse[this.i].width / 2,
								y: thisEllipse[this.i].y + thisEllipse[this.i].height / 2
							}
							return coordCentre;
						};
						this.settingCollisions[i].getBorder = function () {
							var coordBord = {
								x: thisEllipse[this.i].getCenter().x + thisEllipse[this.i].width / 2 * Math.cos(thisEllipse[this.i].angleAlpha),
								y: thisEllipse[this.i].getCenter().y + thisEllipse[this.i].height / 2 * Math.sin(thisEllipse[this.i].angleAlpha) * thisEllipse[this.i].height / thisEllipse[this.i].width
							}
							return coordBord;
						};
					}
				}
    		} else if (this.layerProperties[g].ennemis) { // Ennemies layers
    			for (var i = 0; i < mapData.layers[g].objects.length; i++) {
    				if (mapData.layers[g].objects[i].type === 'ennemiMasse') {
	    				var ennemyX = mapData.layers[g].objects[i].x;
	    				var ennemyY = mapData.layers[g].objects[i].y;
	    				this['ennemy' + i] = new PapaEnnemi(this, ennemyX, ennemyY, i, Math.floor(Math.random() * Math.floor(3)));
	    				// We delete this reference because ennemy is now added in this.characters[]
	    				delete this['ennemy' + i];
    				}
    			}
    		} else if (this.layerProperties[g].exit) { // Exits layers, wich are used to spot when the player need to travel to an other room
    			this.exits = mapData.layers[g].objects;
    			for (var i = 0; i < this.exits.length; i++) {
    				this.exits[i] = {
    					x: mapData.layers[g].objects[i].x,
    					y: mapData.layers[g].objects[i].y,
    					maxX: mapData.layers[g].objects[i].x + mapData.layers[g].objects[i].width,
    					maxY: mapData.layers[g].objects[i].y + mapData.layers[g].objects[i].height,
    					direction: mapData.layers[g].objects[i].type
    				}
    			}
    		} else if (this.layerProperties[g].items) {
    			// Items (collectibles) layers
    			this.layerObjectsArray = mapData.layers[g].objects;
    			for (var i = 0; i < this.layerObjectsArray.length; i++) {
    				var dimensions = {
    						x: this.layerObjectsArray[i].x,
    						y: this.layerObjectsArray[i].y,
    						width: this.layerObjectsArray[i].width,
    						height: this.layerObjectsArray[i].height,
    						spritesPerLine: 1
    					}
    				if (this.layerObjectsArray[i].name === 'treasure') {
    					var testIsTreasureNotAlreadyCollected = function (ID) {
						    for (var i = 0; i < treasuresCollected.length; i++) {
								if (ID === treasuresCollected[i]) {
									return false
								}
							}
							return true
						}
    					if (testIsTreasureNotAlreadyCollected(this.layerObjectsArray[i].properties[0].value)) {
	    					dimensions.spritesPerLine = 4;
	    					yoyo.createTreasure(dimensions, Number(this.layerObjectsArray[i].type), this.collectibles, this.layerObjectsArray[i].properties[0].value);
    					}
    				}
					if (this.layerObjectsArray[i].name === 'javascript' && javascriptCollected === false) {
					yoyo.createJavascriptItem(dimensions, this.collectibles);
					}
					if (this.layerObjectsArray[i].name === 'angular' && angularCollected === false) {
					yoyo.createAngularItem(dimensions, this.collectibles);
					}
					if (this.layerObjectsArray[i].name === 'nodeJS' && nodeJSCollected === false) {
					yoyo.createNodeJSItem(dimensions, this.collectibles);
					}
    			}
    		}
    	}
    }
}


//******************************************************************************//
//************************* spiral style map generator *************************//
//******************************************************************************//

Map.prototype.drawSpirale = function (context, h, i, spiraleBox) {
	// We set i at 434 in order to create a 21 * 21 squared spiral (avoiding the last 7 tiles wich are out of screen), so we cover all the 11 * 21 tiles area. 
	if (i < 434) { 
		i++;
	} else {
		h++;
		i = 0;
		spiraleBox.c = 0;
		spiraleBox.cx = 0;
		spiraleBox.cy = 0;
		spiraleBox.cxm = 0;
		spiraleBox.cym = 0;
	}

	if (h < this.layerTileArray.length) {
		if (i > 0) {
		spiraleBox = yoyo.createSpirale(spiraleBox);
		}

    	// coordinates in number of tiles around the origin tile of the spiral (wich is in 10 ; 5)
		var xDestination = (spiraleBox.cx + 10);
		var yDestination = (spiraleBox.cy + 5);
		var numberTile = this.layerTileArray[h][yDestination * 21 + xDestination];
		// Tiles to pixels conversion
		xDestination *= 32;
		yDestination *= 32;

		if (yDestination >= 0 && yDestination <= 320 && numberTile !== 0) {
			this.tilesetOfRoom.drawTile(numberTile, context, xDestination, yDestination);

			// We set a delay between each tile setting in order to see the map construction
			setTimeout(function() {
				window['map2'].drawSpirale (context, h, i, spiraleBox);
			}, 2);
		} else {
			// no need to set a delay if the tile is out of screen
			window['map2'].drawSpirale (context, h, i, spiraleBox);
		}
	} else {
		// Here some effects at game starting : multiple HUD fadeIn, and a thunder effect before player appearance
		player.imageAlpha = 0;
		gameStarted = true;
		yoyo.createNewThunderFX(this, 340, 35);
		generalCounter.addTimer(function() {
			heroAlive = true;
			heart1.src = 'ressources/sprites/heart.png';
			heart2.src = 'ressources/sprites/heart.png';
			heart3.src = 'ressources/sprites/heart.png';
			heart1.style.opacity = 0;
			heart2.style.opacity = 0;
			heart3.style.opacity = 0;
			heart1.style.visibility = 'visible';
			heart2.style.visibility = 'visible';
			heart3.style.visibility = 'visible';
			document.getElementById('minimap').style.visibility = 'visible';
			document.getElementById('score').style.visibility = 'visible';

			var fadeInLoop = setInterval(function() {
				document.getElementById('minimap').style.opacity = Number(document.getElementById('minimap').style.opacity) + 0.025;
				document.getElementById('score').style.opacity = Number(document.getElementById('minimap').style.opacity) + 0.025;
				document.getElementById('angular').style.opacity = Number(document.getElementById('angular').style.opacity) + 0.01;
				document.getElementById('javascript').style.opacity = Number(document.getElementById('javascript').style.opacity) + 0.01;
				document.getElementById('nodeJS').style.opacity = Number(document.getElementById('nodeJS').style.opacity) + 0.01;
				heart1.style.opacity = Number(heart1.style.opacity) + 0.025;
				heart2.style.opacity = Number(heart2.style.opacity) + 0.025;
				heart3.style.opacity = Number(heart3.style.opacity) + 0.025;
				player.imageAlpha += 0.025;
				if (document.getElementById('minimap').style.opacity === '1') {
					clearInterval(fadeInLoop);
				}
			}, 40);
		}, 1000);
	}
}


//******************************************************************************//
//**************************** Standard room generator *************************//
//******************************************************************************//

Map.prototype.drawStandardRoom = function (context, h, i) {
	if (i !== 231) {
		i++;
	} else {
		h++;
		i = 0;
	}

	if (h < this.layerTileArray.length) {
		var numberTile = this.layerTileArray[h][i];
		var xDestination = i % 21 * 32 + this.roomTransitionValueX;
		var yDestination = (Math.floor(i / 21)) * 32 + this.roomTransitionValueY;
		this.tilesetOfRoom.drawTile(numberTile, context, xDestination, yDestination);

		// Here we reset variables that check if characters and items are drawn	
		if (h === 0) {
			for (var j = 0; j < this.characters.length; j++) {
				this.characters[j].isDrawn = false;
			}
			for (var j = 0; j < this.collectibles.length; j++) {
				this.collectibles[j].isDrawn = false;
			}
		}

		// Once per layer drawn we test if it is the right moment to draw zIndex affected objects	
		if (i === 0) {
			this.drawTestsCharacters(context, h);
			this.drawCollectiblesTests(context, h);
		}
		this.drawStandardRoom(context, h, i);
	}
	this.debug(context, h);

	if (this.isCurrentRoom && roomTransition && h === 0 && i === 0) {
		this.roomTransitionIncrementation();
	}

	// Here we draw exit arrows
	if (i === 0 && h === this.layerTileArray.length - 1 && !roomTransition) {
		for (var j = 0; j < this.exits.length; j++) {
			this.drawExits(context, this.exits[j]);
		}
	}

	// Here we draw the game over screen
	if (i === 0 && h === this.layerTileArray.length - 1 && player.health === 0) {
		context.globalAlpha = this.deathScreen.imageAlpha;
		context.drawImage(this.deathScreen, 0, 0);
		context.globalAlpha = 1;
		if (this.deathScreen.imageAlpha < 0.75) {
			this.deathScreen.imageAlpha += 0.01;
		}
	}

	// Here we draw the victory screen
	if (i === 0 && h === this.layerTileArray.length - 1 && victory) {
		context.globalAlpha = this.victoryScreen.imageAlpha;
		context.drawImage(this.victoryScreen, 0, 0);
		context.globalAlpha = 1;
		if (this.victoryScreen.imageAlpha < 0.85) {
			this.victoryScreen.imageAlpha += 0.01;
		}
		if (document.getElementById('lookCV').style.opacity < 1) {
			document.getElementById('lookCV').style.opacity = Number(document.getElementById('lookCV').style.opacity) + 0.01;
		}
		// Here we set active button "look at CV", when it is enough visible
		if (document.getElementById('lookCV').style.opacity >= 0.5 && document.getElementById('lookCV').href === '') {
			document.getElementById('lookCV').href = "ressources/CV.pdf";
		}
	}
}


//******************************************************************************//
//********************** Redirect to appropriate map creator *******************//
//******************************************************************************//

Map.prototype.mapDrawStyle = function(context) {
	if (!gameStarted) {
		var spiraleBox = {
			c: 0,
			cx: 0,
			cy: 0,
			cxm: 0,
			cym: 0
		}
		this.isCurrentRoom = true;
		this.drawSpirale (context, 0, -1, spiraleBox);
	} else {
		this.drawStandardRoom (context, 0, -1);
	}
}


//******************************************************************************//
//************************ Adding characters & FX system ***********************//
//******************************************************************************//

// Character list presents on the map
Map.prototype.characters = new Array();

// Adding new character
Map.prototype.addPersonnage = function(perso) {
	this.characters.push(perso);
}

// FX list existing in the map
Map.prototype.FX = new Array();

// Adding a new FX
Map.prototype.addFX = function(FX) {
	this.FX.push(FX);
}


//******************************************************************************//
//************************** Drawing tests characters **************************//
//******************************************************************************//

// Character drawing tests method
Map.prototype.drawTestsCharacters = function(context, h) {
	if (gameStarted) {
		// Here we test where (coordinates) and when (zIndex) we have to draw characters
		for (var j = 0; j < this.characters.length; j++) {
			var goodLayerToDrawCharac = (this.layerProperties[h].zIndex > this.characters[j].zIndex  || h + 1 === this.layerTileArray.length) && !this.characters[j].isDrawn;
			// We draw character if its own zIndex is between zIndex of previous and next layers indexes
			var heroFilterTransition = (this.isCurrentRoom && !roomTransition) || (!this.isCurrentRoom && roomTransition && this.characters[j].isHero);
			// If we are currently transting between two maps, we only draw players (ennemies are removed)

			if (goodLayerToDrawCharac && heroFilterTransition) {

				// If character is under recoil effect, we update is coordinates
				if (this.characters[j].recoilValue > 0) {
					var checkCollBox = this.characters[j].testSettingCollisions(
						this.characters[j],
						this.characters[j].x + Math.cos(this.characters[j].recoilAngle) * this.characters[j].recoilValue * 3,
						this.characters[j].y + Math.sin(this.characters[j].recoilAngle) * this.characters[j].recoilValue * 3
						);
					this.characters[j].x = checkCollBox.vectorX;
					this.characters[j].y = checkCollBox.vectorY;
					this.characters[j].recoilValue = Math.floor(this.characters[j].recoilValue / 2);
				}

				// If player is attacking, we update sword collisions
				if (this.characters[j].attacking) {
					this.characters[j].attaquer(this); 
				}

				this.characters[j].deplacer(context, this, this.characters[j]);
				this.characters[j].isDrawn = true;
				this.characters[j].dessinerPersonnage(context);
				if (this.characters[j].movingUp || this.characters[j].movingDown || this.characters[j].movingLeft || this.characters[j].movingRight || this.characters[j].attacking) {
					this.characters[j].frame++;
				} else {
					this.characters[j].frame = 0;
				}
			}
		}
	}

	// Here we manage FXs
	for (var j = 0; j < this.FX.length; j++) {
		this.drawFX(context, this.FX[j]);
		if ( this.FX[j].animFrame >  this.FX[j].frameNumber * 15) { // End of FX animation
			// After final animation frame, we delete FX reference
			this.FX.splice(j, 1);
			delete this['FX' + (j + 1)];
			j--
		}
	}

	// Here we call ennemies removing, if we are transiting between two maps
	if (this.clearEnnemiesNeeded) {
		this.clearEnnemiesNeeded = false;
		this.removeEnnemy();
	}
}



//******************************************************************************//
//*************************** Draw collectibles tests **************************//
//******************************************************************************//

Map.prototype.drawCollectiblesTests = function(context, h) {
	for (var j = 0; j < this.collectibles.length; j++) {
		 // if zIndex item is between two zIndex layers then it is allowed to draw it
		var goodLayerToDrawItem = (this.layerProperties[h].zIndex > this.collectibles[j].zIndex  || h + 1 === this.layerTileArray.length) && !this.collectibles[j].isDrawn;

		if (goodLayerToDrawItem && !roomTransition) {
			this.collectibles[j].isDrawn = true;
			this.drawCollectible(context, j);
		}
	}
}


//******************************************************************************//
//********************************** Draw exits ********************************//
//******************************************************************************//

Map.prototype.drawExits = function(context, arrowZone) {
	var sinXFactor = 0;
	var sinYFactor = 0;
	if (arrowZone.direction === 'north') {
		var direction = 0;
		sinYFactor = 1;
	} else if (arrowZone.direction === 'south') {
		var direction = 1;
		sinYFactor = -1;
	} else if (arrowZone.direction === 'west') {
		var direction = 2;
		sinXFactor = 1;
	} else {
		var direction = 3;
		sinXFactor = -1;
	}
	var arrowX = arrowZone.maxX - Math.ceil(((arrowZone.maxX - arrowZone.x) / 2) / 32) * 32 + Math.sin(generalCounter.value / 10) * sinXFactor * 5;
	var arrowY = arrowZone.maxY - Math.ceil(((arrowZone.maxY - arrowZone.y) / 2) / 32) * 32 + Math.sin(generalCounter.value / 10) * sinYFactor * 5;
	context.globalAlpha = 0.5;
	context.drawImage(
	this.exitsImage, 
	direction * 32,
	0,
	32,
	32,
	arrowX,
	arrowY,
	32,
	32
	);
	context.globalAlpha = 1;
}


//******************************************************************************//
//****************************** Draw collectibles *****************************//
//******************************************************************************//

Map.prototype.drawCollectible = function(context, index) {

	var sinFactorX = this.collectibles[index].sinFactor * Math.sin(generalCounter.value / 10) * 5;
	var sinFactorY = this.collectibles[index].sinFactor * Math.sin(generalCounter.value / 4) * 5;

	context.drawImage(
	this.collectibles[index].image, 
	this.collectibles[index].width * (this.collectibles[index].bonus % this.collectibles[index].spritesPerLine),
	this.collectibles[index].height * Math.floor(this.collectibles[index].bonus / this.collectibles[index].spritesPerLine),
	this.collectibles[index].width, 
	this.collectibles[index].height,
	this.collectibles[index].x + sinFactorX, 
	this.collectibles[index].y + sinFactorY,
	this.collectibles[index].width, 
	this.collectibles[index].height
	);
}


//******************************************************************************//
//*********************************** Draw FXs *********************************//
//******************************************************************************//

Map.prototype.drawFX = function(context, FX) {
	for (var i = 0; i < this.FX.length; i++) {
		context.drawImage(
		FX.image, 
		FX.width * Math.floor(FX.animFrame / FX.frameSpeed),
		0,
		FX.width, 
		FX.height,
		FX.x - FX.width / 2, 
		FX.y - FX.height / 2,
		FX.width, 
		FX.height
		);
		FX.animFrame++
	}
}


//******************************************************************************//
//********************************* Remove ennemy ******************************//
//******************************************************************************//

Map.prototype.removeEnnemy = function() {
	for (var i = 0; i < this.characters.length; i++) {
		// All ennemies tagged as "isDead === true" have to be deleted
		if (this.characters[i].isDead === true) {
			// Ennemies reference deleting
			this.characters.splice(i, 1);
			// i index step back from one to avoid bugs
			i --;
		}
	}
}


//******************************************************************************//
//************************** Test & set room transition ************************//
//******************************************************************************//

// Here we test if we are transiting between two maps
Map.prototype.testRoomTransition = function() {
	var xValue = 0;
	var yValue = 0;
	var checkCollBox = {};
	for (var i = 0; i < this.exits.length; i++) {
		checkCollBox = yoyo.testRectangleVSRectangleColl(yoyo.getHitboxCharac(player), this.exits[i], {horiz:true, vert:true});
		if ((!checkCollBox.horiz || !checkCollBox.vert) && !roomTransition) {
			roomTransition = true;
			this.clearEnnemiesNeeded = true;
			roomTransitionDirection = this.exits[i].direction;
			player.movingUp = false;
			player.movingDown = false;
			player.movingLeft = false;
			player.movingRight = false;
			player.invulnerability = true;
			if (roomTransitionDirection === 'south') {
				yValue = 352;
				levelIndex = 5;
				player.movingDown = true;
				player.direction = 0;
			} else if (roomTransitionDirection === 'north') {
				yValue = -352;
				levelIndex = -5;
				player.movingUp = true;
				player.direction = 3;
			} else if (roomTransitionDirection === 'west') {
				xValue = -672;
				levelIndex = -1;
				player.movingLeft = true;
				player.direction = 1;
			} else if (roomTransitionDirection === 'east') {
				xValue = 672;
				levelIndex = 1;
				player.movingRight = true;
				player.direction = 2;
			}

			// Tagging all ennemies as "isDead" in order to remove them
			for (var i = 0; i < this.characters.length; i++) {
				if (!this.characters[i].isHero) {
					this.characters[i].isDead = true;
				}
			}

			window['map' + (level1.currentRoom + levelIndex)] = new Map(level1.roomList[level1.currentRoom + levelIndex], xValue, yValue);
			roomList.push(window['map' + (level1.currentRoom + levelIndex)]);

			// After a brief forced walk we stop player moves
			generalCounter.addTimer(function () {
				player.movingUp = false;
				player.movingDown = false;
				player.movingLeft = false;
				player.movingRight = false;
			}, 1000);
		}
	}
}


//******************************************************************************//
//************************ Room transition incrementation **********************//
//******************************************************************************//

Map.prototype.roomTransitionIncrementation = function() {
	var xValue = 0;
	var yValue = 0;
	var transitionSpeed = 10;
	if (roomTransitionDirection === 'south') {
		yValue = -transitionSpeed;
	} else if (roomTransitionDirection === 'north') {
		yValue = transitionSpeed;
	} else if (roomTransitionDirection === 'west') {
		xValue = transitionSpeed;
	} else if (roomTransitionDirection === 'east') {
		xValue = -transitionSpeed;
	}
	for (var i = 0; i < roomList.length; i++) {
		roomList[i].roomTransitionValueX += xValue;
		roomList[i].roomTransitionValueY += yValue;
	}
	player.x += xValue;
	player.y += yValue;

	// If transition is complete, we stop incrementation & set right values
	if (Math.round(roomList[1].roomTransitionValueX / 10) * 10 === 0 && Math.round(roomList[1].roomTransitionValueY / 10) * 10 === 0) {
		roomList[1].roomTransitionValueX = 0;
		roomList[1].roomTransitionValueY = 0;
		roomTransition = false;
		player.invulnerability = false;
		player.map = roomList[1];
		roomList[1].isCurrentRoom = true;
		roomList[0].isCurrentRoom = false;
		roomList.splice(0,1);
		delete window['map' + level1.currentRoom];
		level1.currentRoom += levelIndex;
	}
}