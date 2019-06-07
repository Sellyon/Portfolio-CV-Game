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
//    Here is defined the ancestor of all ennemies and players
//
//************************************************************************/ //

'use strict';

//************************************************************************/ //
//************************* Characters creation *************************/ //
//************************************************************************/ //

function Personnage(url, numberFrameWidth, numberFrameHeight) {
	this.x = 0;
	this.y = 0;
	this.zIndex = Math.floor(this.y / 32); // used to draw character between the rights layers (creating depth effect)
	this.direction = 0;
	this.movingUp = false;
	this.movingDown = false;
	this.movingLeft = false;
	this.movingRight = false;
	this.numberFrameWidth = numberFrameWidth;
	this.numberFrameHeight = numberFrameHeight;
	this.invulnerability = false;
	this.InvulnerabilityDuration = 2000;
	this.isDead = false;
	this.deadDirection = 8;
	this.frame = 0;
	this.nbFrame = 4;
	this.frameSpeed = 5; // number of frames between each image
	this.animFrame = 0;
	this.vitesse = 4;
	this.collHeight = 24; // character hitbox 
	this.collWidth = 24; // character hitbox 
	this.recalageCollHeight = 0;
	this.blockedByCollision = false;
	this.weight = 10;
	this.recoilValue = 0;
	this.recoilAngle = 0;
	this.attacking = false;
	this.aUneArme = false;
	this.health = 6;
	this.strength = 3;
	this.defense = 0;
	this.isDrawn = false;
	this.imageAlpha = 1;
	
	// Image loading
	this.image = new Image();
	this.image.characReference = this;

	this.image.onload = function() {
		if(!this.complete) 
			throw 'Error while loading image named :  \'' + url + '\'.';
		
		// Character dimensions
		this.characReference.width = this.width / this.characReference.numberFrameWidth;
		this.characReference.height = this.height / this.characReference.numberFrameHeight;
	}
	this.image.src = 'ressources/sprites/' + url;
}


//*********************************************************************************************/ //
//****************** Make a character invincible & blinking for a short time ********************//
//*********************************************************************************************/ //

Personnage.prototype.InvulnerabilityFrames = function (charac) {
	charac.invulnerability = true;
	var isInvisible = true;

	var characBlink = function() {
		if (isInvisible) {
			charac.imageAlpha = 0.5;
			isInvisible = false;
		} else {
			charac.imageAlpha = 1;
			isInvisible = true;
		}
	}

	var characBlinkInterval = setInterval(characBlink, 80);

	setTimeout(function() {
		isInvisible = false;
		charac.invulnerability = false;
		charac.imageAlpha = 1;
		this.clearInterval(characBlinkInterval);
	}, charac.InvulnerabilityDuration);
}


//*********************************************************************************************/ //
//************************ Set a recoil effect to a damaged character ***************************//
//*********************************************************************************************/ //

Personnage.prototype.setRecoil = function (attacker, defender) {
	var a = (defender.y + defender.height / 2) - (attacker.y + attacker.height / 2);
	var b = (defender.x + defender.width / 2) - (attacker.x + attacker.width / 2);

	if (attacker.attacking) { // if attacker was not idle
		defender.recoilValue = Math.round(Math.log(attacker.weight + (attacker.weight - defender.weight) / 2) * 3);
		if (defender.recoilValue < 0) {
			defender.recoilValue = 0;
		}
	} else { // if hero was walking on idle ennemy
		defender.recoilValue = 10;
	}
	defender.recoilAngle = Math.atan2(a,b);
}


//*********************************************************************************************/ //
//**************************** An attacker do damage to a defender ******************************//
//*********************************************************************************************/ //

Personnage.prototype.setDamage = function (thisMap, attacker, defender) {
	if (defender.health > 0 && !victory) {
		var degats = attacker.strength - defender.defense;
		if (degats < 1) {
			degats = 1;
		}
		defender.health -= degats;
		if (defender.health <= 0) {
			defender.health = 0;
			defender.Death(thisMap, defender);
		} else {
			this.InvulnerabilityFrames(defender);
			this.setRecoil(attacker, defender);
		}
		if (defender.isHero && healthPixelReference === newHealthPixelReference) {
			newHealthPixelReference -= 15 * degats;
			defender.movingUp = false;
			defender.movingDown = false;
			defender.movingLeft = false;
			defender.movingRight = false;
			updateHealth();
		} else if (defender.isHero && healthPixelReference !== newHealthPixelReference) {
			newHealthPixelReference -= 15 * degats;
		}
	}
}


//*********************************************************************************************/ //
//*********************************** test setting collisions ***********************************//
//*********************************************************************************************/ //

Personnage.prototype.testSettingCollisions = function (charac, vectorX, vectorY) {
	var checkCollBox = {
		horiz: true,
		vert: true
	};
	// collisions tests
	for (var i = 0; i < charac.map.settingCollisions.length; i++) {
		if (charac.map.settingCollisions[i].type === 'square') {
			// Here we test collision between player and setting rectangle collision
		checkCollBox = yoyo.testRectangleVSRectangleColl(yoyo.getHitboxCharac(charac, vectorX, vectorY), charac.map.settingCollisions[i], checkCollBox);
		}
	}

	// updating coordinates in accordances of collision tests
	if (!checkCollBox.horiz) {
		checkCollBox.vectorX = charac.x;
	} else {
		checkCollBox.vectorX = vectorX;
	}
	if (!checkCollBox.vert) {
		checkCollBox.vectorY = charac.y;
	} else {
		checkCollBox.vectorY = vectorY;
	}
	return checkCollBox
}


//*********************************************************************************************/ //
//********************************** test character collisions **********************************//
//*********************************************************************************************/ //

Personnage.prototype.testPlayerVSEnnemyCollisions = function (thisMap, player, checkCollBox) {
	if (!player.invulnerability) {
		for (var i = 0; i < thisMap.characters.length; i++) {
			if (!thisMap.characters[i].isHero && !thisMap.characters[i].isDead) {
				// Here we test collision between player and ennemy rectangle collision
				var playerHitbox = yoyo.getHitboxCharac(player, player.x, player.y, true);
				var ennemyHitbox = yoyo.getHitboxCharac(thisMap.characters[i], 0, 0, true);

				checkCollBox = yoyo.testRectangleVSRectangleColl(playerHitbox, ennemyHitbox, checkCollBox);

				if ((!checkCollBox.horiz || !checkCollBox.vert) && !player.invulnerability) {
					player.setDamage(thisMap, thisMap.characters[i], player)
				}
			}
		}
	}
}