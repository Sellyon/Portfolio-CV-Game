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
//    Here is defined the constructor function of all player
//
//************************************************************************/ //

'use strict';

//************************************************************************/ //
//************************** Hero prototyping ***************************/ //
//************************************************************************/ //

var protoPerso = new Personnage('heroSprites.png', 8, 8);
var PapaPlayer = function (thisMap, x, y, direction) {
	this.x = x;
	this.y = y;
	this.map = thisMap;
	this.isHero = true;
	this.direction = direction;
	this.aUneArme = true;
	this.imageArme = new Image();
	this.imageArme.referenceDeLArme = this;

	// Image loading
	
	this.imageArme.onload = function() {
		if(!this.complete) 
			throw 'Erreur de chargement du sprite nommé firstSwordSprites.png';
		
		
		// weapon size
		this.referenceDeLArme.weaponWidth = this.width / 6;
		this.referenceDeLArme.weaponHeight = this.height / 4;
	}
	this.imageArme.src = 'ressources/sprites/firstSwordSprites.png';
};

PapaPlayer.prototype = protoPerso;


//************************************************************************/ //
//******************************* Draw hero ******************************/ //
//************************************************************************/ //

PapaPlayer.prototype.dessinerPersonnage = function(context) {
	if (heroAlive) {
		if (!this.attacking) {
			this.animFrame = Math.floor(this.frame / this.frameSpeed) % this.nbFrame; // animation quickness management
		} else {
			this.animFrame = Math.floor(this.frame / this.frameSpeed);
			if (this.animFrame >= this.nbFrame) { // At animation's end we stop attack mode
			if (this.direction === 7) { // ATTACK UP
				this.direction = 3;
				} else if (this.direction === 4) { // ATTACK DOWN
					this.direction = 0;
				} else if (this.direction === 5) { // ATTACK LEFT
					this.direction = 1;
				} else if (this.direction === 6) { // ATTACK RIGTH
					this.direction = 2;
				}
				this.nbFrame = 4;
				this.animFrame = 0;
				this.attacking = false;
				this.frameSpeed = 5;
			}
		}

		context.globalAlpha = this.imageAlpha;
		context.drawImage(
		this.image, 
		this.width * this.animFrame,
		this.direction * this.height,
		this.width, 
		this.height,
		this.x, 
		this.y,
		this.width, 
		this.height
		);
		if (this.attacking && this.aUneArme) {
			context.drawImage(
			this.imageArme, 
			this.weaponWidth * this.animFrame,
			(this.direction - 4) * this.weaponHeight,
			this.weaponWidth, 
			this.weaponHeight,
			this.x - this.weaponWidth / 4, 
			this.y - this.weaponHeight / 4,
			this.weaponWidth, 
			this.weaponHeight
			);
		}
		context.globalAlpha = 1;
	} else if (player.health === 0) {
		context.drawImage(player.map.tilesetOfRoom.image, 224, 992, 32, 32, player.x, player.y, 32, 32);
	}
}


//************************************************************************/ //
//************************ Hero moves management *************************/ //
//************************************************************************/ //

PapaPlayer.prototype.deplacer = function(context, thisMap, player) {
	var vectorX = this.x
	var vectorY = this.y

	if ((this.movingUp || this.movingDown || this.movingLeft || this.movingRight) && !this.attacking) {

		if(this.movingUp) { // UP
			vectorY += -this.vitesse;
		}

		if(this.movingDown) { // DOWN
			vectorY += this.vitesse;
		}

		if(this.movingLeft) { // LEFT
			vectorX += -this.vitesse;
		}

		if(this.movingRight) { // RIGHT
			vectorX += this.vitesse;
		}

		// zIndex update
		this.zIndex = Math.floor((this.y + this.height - this.collHeight) / 32);

		// Variables that allows moves, at true
		var checkEllipseColl = true;
		var checkCollBox = {
			horiz: true,
			vert: true
		};

		// Test if we touch an ennemy while moving
		this.testPlayerVSEnnemyCollisions(thisMap, this, checkCollBox);

		// Setting collisions
		for (var i = 0; i < thisMap.settingCollisions.length; i++) {
			if (thisMap.settingCollisions[i].type === 'square') {
				// Rectangle/rectangle collision checking
				checkCollBox = yoyo.testRectangleVSRectangleColl(yoyo.getHitboxCharac(this, vectorX, vectorY), thisMap.settingCollisions[i], checkCollBox);
			} else if (thisMap.settingCollisions[i].type === 'ellipse') {
				// Circle/ellipse collision checking
				var collplayer = {
					rayon: player.width / 2,
					centreDuplayer: {
						x: player.x + player.width / 2,
						y: player.y + player.height - player.collHeight / 2
					}
				}

				var ellipseCollision = thisMap.settingCollisions[i];
				var distanceCenterToPlayer = yoyo.getDistanceTwoPoints(ellipseCollision.getCenter(), collplayer.centreDuplayer);
				var coteOppose = ellipseCollision.x + ellipseCollision.width / 2 - collplayer.centreDuplayer.x;
				var angleComplementaire = Math.acos(coteOppose / distanceCenterToPlayer);
				if (collplayer.centreDuplayer.y < ellipseCollision.getCenter().y) {
					ellipseCollision.angleAlpha = Math.PI + angleComplementaire;
				} else {
					ellipseCollision.angleAlpha = Math.PI - angleComplementaire;
				}

				var distanceCenterEllipseToBorder = yoyo.getDistanceTwoPoints(ellipseCollision.getCenter(), ellipseCollision.getBorder());
				var distanceCenterEllipseToPlayerBorder = distanceCenterToPlayer - collplayer.rayon;
				var checkDistanceForCollision = distanceCenterEllipseToPlayerBorder - distanceCenterEllipseToBorder;
				if (checkDistanceForCollision < 0) {
					checkEllipseColl = false;
					ellipseCollision.inCollision = true;
				}



				// If we touch an ellipse, we "slide" on it
				if ((!checkEllipseColl && ellipseCollision.inCollision) || roomTransition) {
					ellipseCollision.inCollision = false;
					var angleAlphaInDegrees = ellipseCollision.angleAlpha * 180 / Math.PI;
					var coordonneesBordEllipse = ellipseCollision.getBorder();
					if (angleAlphaInDegrees > 0 && angleAlphaInDegrees < 90) {
					
						if (this.movingLeft) {
							this.y += this.vitesse;
						}
					
						if (this.movingUp) {
							this.x += this.vitesse;
						}
						
						if (this.movingRight) {
							this.x += this.vitesse;
						}
						if (this.movingDown) {
							this.y += this.vitesse;
						}
					}
					if (angleAlphaInDegrees >= 90 && angleAlphaInDegrees <= 180) {
						if (this.movingRight) {
							this.y += this.vitesse;
						}
						if (this.movingUp) {
							this.x -= this.vitesse;
						}

						if (this.movingLeft) {
							this.x -= this.vitesse;
						}
						if (this.movingDown) {
							this.y += this.vitesse;
						}
					}
					if (angleAlphaInDegrees > 180 && angleAlphaInDegrees < 270) {
						if (this.movingRight) {
							this.y -= this.vitesse;
						}
						if (this.movingDown) {
							this.x -= this.vitesse;
						}

						if (this.movingLeft) {
							this.x -= this.vitesse;
						}
						if (this.movingUp) {
							this.y -= this.vitesse;
						}
					}
					if (angleAlphaInDegrees >= 270 && angleAlphaInDegrees <= 360) {
						if (this.movingLeft) {
							this.y -= this.vitesse;
						}
						if (this.movingDown) {
							this.x += this.vitesse;
						}

						if (this.movingRight) {
							this.x += this.vitesse;
						}
						if (this.movingUp) {
							this.y -= this.vitesse;
						}
					}
				}
			}
		}

		//If collisions test are OK, we update player coordinates
		if (checkEllipseColl || roomTransition) {
			if (checkEllipseColl || roomTransition) {
				if (checkCollBox.horiz || roomTransition) {
					this.x = vectorX;
				}
				if (checkCollBox.vert || roomTransition) {
					this.y = vectorY;
				}
			}
			if (!checkCollBox.vert || !checkCollBox.horiz){
				// used in debug mode
				this.blockedByCollision = true;
			}
			if (checkCollBox.vert && checkCollBox.horiz && checkEllipseColl) {
				this.blockedByCollision = false;
			}
		} else {
			checkEllipseColl = true;
		}

		if (!roomTransition) {
			thisMap.testRoomTransition();
			this.testCollectItem(thisMap);
	    }
	}
}


//*********************************************************************************************/ //
//************************************* test collect items **************************************//
//*********************************************************************************************/ //

Personnage.prototype.testCollectItem = function (thisMap) {
	for (var i = 0; i < thisMap.collectibles.length; i++) {
		var checkCollBox = {
			horiz: true,
			vert: true
		};
		var playerHitbox = yoyo.getHitboxCharac(this, this.x, this.y);
		var collectibleHitbox = {
			x: thisMap.collectibles[i].x,
			y: thisMap.collectibles[i].y,
			maxX: thisMap.collectibles[i].x + thisMap.collectibles[i].width,
			maxY: thisMap.collectibles[i].y + thisMap.collectibles[i].height,
		};

		checkCollBox = yoyo.testRectangleVSRectangleColl(playerHitbox, collectibleHitbox, checkCollBox);

		if (!checkCollBox.horiz || !checkCollBox.vert) {
			if (thisMap.collectibles[i].specialItem !== false) {
				if (thisMap.collectibles[i].specialItem === 'angular') {
					// Update tips message
					tips.NewMessage = 'PUISSANCE DE ANGULAR RECUPEREE !!';
					document.getElementById('tips').style.color = 'red';
					angularCollected = true;
					this.sacredItemAcquisition(thisMap, document.getElementById('angular'), 'ressources/sprites/angular.png');
				}
				if (thisMap.collectibles[i].specialItem === 'javascript') {
					// Update tips message
					tips.NewMessage = 'FORCE DE JAVASCRIPT PRISE !!';
					document.getElementById('tips').style.color = '#B18904';
					javascriptCollected = true;
					this.sacredItemAcquisition(thisMap, document.getElementById('javascript'), 'ressources/sprites/javascript.png');
				}
				if (thisMap.collectibles[i].specialItem === 'nodeJS') {
					// Update tips message
					tips.NewMessage = 'SAGESSE DE NODE JS ACQUISE !!';
					document.getElementById('tips').style.color = 'green';
					nodeJSCollected = true;
					this.sacredItemAcquisition(thisMap, document.getElementById('nodeJS'), 'ressources/sprites/nodeJS.png');
				}

				if (score === newScore) {
					newScore += 1000;
					updateScore();
				} else {
				newScore += 1000;
				}
			} else {
				if (score === newScore) {
					newScore += (thisMap.collectibles[i].bonus + 1) * 100;
					treasuresCollected.push(thisMap.collectibles[i].ID);
					updateScore();
				} else {
				newScore += (thisMap.collectibles[i].bonus + 1) * 100;
				treasuresCollected.push(thisMap.collectibles[i].ID);
				}
			}
			thisMap.collectibles.splice(i,1);
			i--;
			if (angularCollected && javascriptCollected && nodeJSCollected) {
				victory = true;
				thisMap.victoryScreen = new Image();
				thisMap.victoryScreen.src = 'ressources/sprites/victory.png';
				thisMap.victoryScreen.imageAlpha = 0;
			}
		}
	}
}

PapaPlayer.prototype.sacredItemAcquisition = function(thisMap, item, newImage) {
	var decreasingOpacity = true;
	var fadeInLoop = setInterval(function() {
		if (decreasingOpacity) {
			item.style.opacity = Number(item.style.opacity) - 0.01;
		} else {
			item.style.opacity = Number(item.style.opacity) + 0.01;
		}

		if (item.style.opacity === '0' && decreasingOpacity) {
			decreasingOpacity = false;
			item.src = newImage;
		}
		if (item.style.opacity === '1' && !decreasingOpacity) {
			if (!angularCollected || !javascriptCollected || !nodeJSCollected) {
				// Update tips message
				var sacredItemsToCollect = 3 - (Number(angularCollected) + Number(javascriptCollected) + Number(nodeJSCollected));
				tips.NewMessage = 'IL RESTE ' + sacredItemsToCollect + ' OBJETS SACRES A RAMASSER';
			}
			clearInterval(fadeInLoop);
		}
	}, 40);
}


//************************************************************************/ //
//*************************** Collisions sword ****************************/ //
//************************************************************************/ //

PapaPlayer.prototype.attaquer = function(thisMap) {
	// Segment epee
	if (this.direction === 7) { // UP
			var a1x = this.x + this.width / 2;
			var a1y = this.y + this.height - this.collHeight / 2 - 18;
			var a2x = this.x + this.width / 2 + Math.round(38 * Math.cos(Math.PI + Math.PI * (this.frame - 1) / (this.nbFrame - 1)));
			var a2y = this.y + this.height - this.collHeight / 2 - 18 + Math.round(38 * Math.sin(Math.PI + Math.PI * (this.frame - 1) / (this.nbFrame - 1)));
		}

	if (this.direction === 4) { // DOWN
			var a1x = this.x + this.width / 2;
			var a1y = this.y + this.height - this.collHeight / 2;
			var a2x = this.x + this.width / 2 + Math.round(38 * Math.cos(Math.PI * (this.frame - 1) / (this.nbFrame - 1)));
			var a2y = this.y + this.height - this.collHeight / 2 + Math.round(38 * Math.sin(Math.PI * (this.frame - 1) / (this.nbFrame - 1)));
		}

	if (this.direction === 5) { // LEFT
			var a1x = this.x + this.width / 2 - 12;
			var a1y = this.y + this.height - this.collHeight / 2;
			var a2x = this.x + this.width / 2 + Math.round(38 * Math.cos(Math.PI / 2 + Math.PI * (this.frame - 1) / (this.nbFrame - 1))) - 12;
			var a2y = this.y + this.height - this.collHeight / 2 + Math.round(38 * Math.sin(Math.PI / 2 + Math.PI * (this.frame - 1) / (this.nbFrame - 1)));
		}

	if (this.direction === 6) { // RIGHT
			var a1x = this.x + this.width / 2 + 12;
			var a1y = this.y + this.height - this.collHeight / 2;
			var a2x = this.x + this.width / 2 + Math.round(38 * Math.cos(3 * Math.PI / 2 + Math.PI * (this.frame - 1) / (this.nbFrame - 1))) + 12;
			var a2y = this.y + this.height - this.collHeight / 2 + Math.round(38 * Math.sin(Math.PI / 2 + Math.PI * (this.frame - 1) / (this.nbFrame - 1)));
		}


	// ***************************** Here we test each element that coould react with sword *****************************************

	// Settings collisions
	for (var i = 0; i < thisMap.settingCollisions.length; i++) {

		// destructibles
		if (thisMap.settingCollisions[i].destructible) {

			// rectangular destructibles
			if (!thisMap.settingCollisions[i].destroyed && thisMap.settingCollisions[i].type === 'square') {

				// Test line/rectangle
				if (yoyo.testDroiteVSRectangleColl({a1x, a2x, a1y, a2y}, thisMap.settingCollisions[i])) {
					yoyo.detruireDestructible(thisMap, thisMap.settingCollisions[i]);
				}
			}
		}
	}
	yoyo.supprimerCollisions(thisMap);

	// Ennemies
	for (var i = 0; i < thisMap.characters.length; i++) {
		if (thisMap.characters[i].isEnnemi && !thisMap.characters[i].isDead) {
			if (yoyo.testDroiteVSRectangleColl({a1x, a2x, a1y, a2y}, yoyo.getHitboxCharac(thisMap.characters[i], 0, 0, true)) && !thisMap.characters[i].invulnerability) {
				this.setDamage(thisMap, this, thisMap.characters[i])
			}
		}
	}
}


//*********************************************************************************************/ //
//************************************* Player death ********************************************//
//*********************************************************************************************/ //

PapaPlayer.prototype.Death = function (thisMap, player) {
	heroAlive = false;
	player.direction = 0;
	player.nbFrame = 0;
	player.movingUp = false;
	player.movingDown = false;
	player.movingLeft = false;
	player.movingRight = false;
	player.attacking = false;
	player.frameSpeed = 0;
	player.animFrame = 0;
	// create dust FX
	yoyo.createNewDeadDustFX(thisMap, player, 0);
	thisMap.deathScreen = new Image();
	thisMap.deathScreen.src = "ressources/sprites/youDied.png";
	thisMap.deathScreen.imageAlpha = 0;
}