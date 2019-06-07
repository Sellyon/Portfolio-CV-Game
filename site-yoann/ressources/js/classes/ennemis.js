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
//    Here is defined the constructor function of all mace ennemies
//
//************************************************************************/ //

'use strict';

//************************************************************************/ //
//*********************** Prototypage de l'ennemi ************************/ //
//************************************************************************/ //

var protoEnnemi = new Personnage('ennemiMasse.png', 4, 15);
var PapaEnnemi = function (thisMap, x, y, number, direction) {
	this.health = 6;
	this.strength = 1;
	this.map = thisMap;
	this.collHeight = 24;
	this.collWidth = 32;
	this.x = x - 16;
	this.y = y - 16;
	this.recalageCollHeight = 10;
	this.vitesse = 2;
    this.direction = direction;
    this.weight = 20;
	this.exclamaPoint = false;
	this.surpriseCounter = 0;
	this.enDeplacement = false;
	this.busy = false;
	this.InvulnerabilityDuration = 500;
	this.deadDirection = 14;
    this.isEnnemi = true;
    this.porteeAttaque = 120;
    this.saut = false;
    this.atteri = false;
    this.assaut = false;
    this.delayMode = false;
    this.angleVerouille = 0;
	this.outOfPathfind = false;
	this.coordPathfindRetrouve = {
		x:0,
		y:0
	};
    var thisEnnemi = this;
    this.addToTheMap = (function () {
		thisMap.addPersonnage(thisEnnemi);
		thisEnnemi.choisirAction(thisMap, thisEnnemi);
	}());
    this.caseAdjacente = function (direction) {
		var caseX = 0;
		var caseY = 0;
		var caseAdjacente = {};

		switch(direction) {
			case 'up' :
				caseY = -32;
				break;

			case 'down' :
				caseY = 32;
				break;

			case 'left' :
				caseX = -32;
				break;

			case 'right' :
				caseX = 32;
				break;

			default :

			return false;
		}

		return caseAdjacente = {
			x: Math.floor((thisEnnemi.x + thisEnnemi.width / 2 + caseX) / 32) * 32,
			y: Math.floor((thisEnnemi.y + thisEnnemi.height / 2 + caseY) / 32) * 32
		}
    	
	}
};

PapaEnnemi.prototype = protoEnnemi;


//************************************************************************/ //
//**************************** Dessiner ennemi ***************************/ //
//************************************************************************/ //

PapaEnnemi.prototype.dessinerPersonnage = function(context) {
	if (!this.frappe) {
		this.animFrame = Math.floor(this.frame / this.frameSpeed) % this.nbFrame; // On gère la vitesse de l'anim
	} else {
		this.animFrame = Math.floor(this.frame / this.frameSpeed);
		if (this.animFrame >= this.nbFrame) { // si on arrive à la fin de l'anim, on ne boucle pas et on arrête l'action "attaquer"
		if (this.direction === 11) { // ATTAQUER EN HAUT
			this.direction = 3;
			} else if (this.direction === 8) { // ATTAQUER EN BAS
				this.direction = 0;
			} else if (this.direction === 9) { // ATTAQUER A GAUCHE
				this.direction = 1;
			} else if (this.direction === 10) { // ATTAQUER A DROITE
				this.direction = 2;
			}
			if (!this.delayMode) {
				this.delayMode = true;
				this.weight = 20;
				this.nbFrame = 4;
				this.animFrame = 0;
				this.frameSpeed = 5;
				this.atteri = false;
				this.frappe = false;
				this.attacking = false;
				this.delayAfterAttack(this);
			}
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
	context.globalAlpha = 1;
}


//************************************************************************/ //
//**** Make a delay after attack before ennemy is back to is routine *****/ //
//************************************************************************/ //

PapaEnnemi.prototype.delayAfterAttack = function(ennemi) {
	
	generalCounter.addTimer(function() {
		ennemi.delayMode = false;
		ennemi.busy = false;
	}, 2000);
}


//************************************************************************/ //
//********************* Déterminer action de l'ennemi ********************/ //
//************************************************************************/ //

PapaEnnemi.prototype.choisirAction = function(thisMap, ennemi) {
	setInterval(function() {
		if (!ennemi.isDead && !roomTransition) {
			// Si le player est proche de l'ennemi celui-ci l'attaque en priorité
			if (!victory && !ennemi.delayMode && !ennemi.attacking && heroAlive && Math.sqrt(Math.pow((player.x + player.width / 2 - (ennemi.x + ennemi.width / 2)), 2) + Math.pow((player.y + player.height - player.collHeight - (ennemi.y + ennemi.height / 2)), 2)) < ennemi.porteeAttaque) {
				if (!tips.tutoEnnemyDone) {
					tips.tutoEnnemyDone = true;
					tips.NewMessage = 'UN ENNEMI VOUS A REPERE ! UTILISEZ LA TOUCHE ESPACE POUR LE VAINCRE A L EPEE !';
					document.getElementById('tips').style.color = '#8A0808';
				}
				if (!ennemi.exclamaPoint) {
					ennemi.exclamaPoint = true;
					ennemi.surpriseCounter = 15;
					yoyo.createNewExclamationPointFX(thisMap, ennemi);
				} else {
					ennemi.exclamaPoint = false;
				}
				ennemi.attacking = true;
				ennemi.enDeplacement = false;
				ennemi.outOfPathfind = false;
				ennemi.coordPathfindRetrouve.x = 0;
				ennemi.coordPathfindRetrouve.y = 0;
				ennemi.movingUp = false;
				ennemi.movingDown = false;
				ennemi.movingLeft = false;
				ennemi.movingRight = false;
				ennemi.nbFrame = 4;
				ennemi.weight = 25;
				generalCounter.addTimer(function() {
					if (!ennemi.isDead) {
						ennemi.frame = 0;
						ennemi.saut = true;
					}
				}, 1400);
				generalCounter.addTimer(function() {
					if (!ennemi.isDead) {
						ennemi.assaut = true;
						ennemi.saut = false;
					}
				}, 1500);
				generalCounter.addTimer(function() {
					if (!ennemi.isDead) {
						ennemi.frame = 0;
						ennemi.assaut = false;
						ennemi.frappe = true;
						ennemi.atteri = true;
					}
				}, 2500);
				generalCounter.addTimer(function() {
					if (!ennemi.isDead) {
						ennemi.atteri = false;
					}
				}, 2600);
				ennemi.busy = true;
			}

			// Si le player est hors de portée la priorité secondaire est de revenir au pathfind
			if (!ennemi.busy) {
				ennemi.outOfPathfind = true;
				for (var i = 0; i < 4; i++) {
					if (ennemi.testPathFind(ennemi, i)) {
						ennemi.outOfPathfind = false;
					}
				}
				if (ennemi.outOfPathfind) {
					ennemi.trouverPathfind(ennemi);
					ennemi.busy = true;
				}
			}

			// Si l'ennemi est dans le pathfind et trop loin pour attaquer le player, il peut patrouiller, se reposer ou changer de direction
			if (!ennemi.busy && !ennemi.outOfPathfind) {
				var action = Math.floor(Math.random() * Math.floor(5));
				ennemi.busy = true;

				switch(action) {
				case 0 : case 1 : 
					ennemi.seReposer();
					break;

				case 2 : case 3 : 
					ennemi.changerDirection();
					break;

				case 4 :
					ennemi.enDeplacement = true;
					ennemi.busy = true;
					break;

				default :

				return true;
				}
			}
		}
	}, 500);
}

//************************************************************************/ //
//*************************** L'ennemi attaque ***************************/ //
//************************************************************************/ //

PapaEnnemi.prototype.attaquer = function(thisMap) {
	var pX = player.x + player.width / 2;
    var pY = player.y + player.height - player.collHeight / 2 - 18;
    var eX = this.x + this.width / 2;
    var eY = this.y + this.height / 2;
    var b = pY - eY;
    var c = pX - eX;
    var angle = Math.atan2(b,c);
    var checkCollBox = {};
    var vectorX = this.x;
    var vectorY = this.y;
    var angleEnDegre = angle * 180 / Math.PI; // On passe de suite l'angle en degrés puis on l'arrange pour rester dans le positif
    if (angleEnDegre < 0) {
    	angleEnDegre += 360;
    }

	if (this.frappe) {
		if (this.frame === 0) {
			if (this.direction === 4) { // DOWN
		    	this.direction = 8;
		    } else if (this.direction === 5) { // LEFT
		    	this.direction = 9;
		    } else if (this.direction === 6) { // RIGHT
		    	this.direction = 10;
		    } else if (this.direction === 7) { // UP
		    	this.direction = 11;
		    }
		}
	} else if (this.assaut) {
		vectorX = this.x + Math.cos(this.angleVerouille) * this.vitesse * 3;
		vectorY = this.y + Math.sin(this.angleVerouille) * this.vitesse * 3;
		checkCollBox = this.testSettingCollisions(this, vectorX, vectorY);

		this.x = checkCollBox.vectorX;
		this.y = checkCollBox.vectorY;
	} else {
	    if (angleEnDegre > 45 && angleEnDegre <= 135) {
	    	this.direction = 4;
	    } else if (angleEnDegre > 135 && angleEnDegre <= 225) {
	    	this.direction = 5;
	    } else if ((angleEnDegre > 315 && angleEnDegre <= 360) || (angleEnDegre > 0 && angleEnDegre <= 45)) {
	    	this.direction = 6;
	    } else if (angleEnDegre > 225 && angleEnDegre <= 315) {
	    	this.direction = 7;
	    }
	    this.angleVerouille = angle;
	}
	if (this.saut) {
		var checkCollBox = this.testSettingCollisions(this, this.x, this.y - 10);
		this.y = checkCollBox.vectorY;
		vectorY = checkCollBox.vectorY;
	}
	if (this.atteri) {
		var checkCollBox = this.testSettingCollisions(this, this.x, this.y + 10);
		this.y = checkCollBox.vectorY;
		vectorY = checkCollBox.vectorY;
	}
	if (!this.saut && !this.atteri) {
		// On réajuste zIndex si nécessaire
		this.zIndex = Math.round(this.y / 32);
	}

	if (this.saut || this.assaut || this.atteri || this.frappe) { // On teste ici si l'ennemi percute le player
		this.testPlayerVSEnnemyCollisions(thisMap, player, {horiz:true, vert:true});
	}
}



//************************************************************************/ //
//*************************** L'ennemi se repose *************************/ //
//************************************************************************/ //

PapaEnnemi.prototype.seReposer = function() {
	this.busy = false;
}



//************************************************************************/ //
//********************** L'ennemi change de direction ********************/ //
//************************************************************************/ //

PapaEnnemi.prototype.changerDirection = function() {
	this.direction = Math.floor(Math.random() * Math.floor(4));
	this.busy = false;
}



//************************************************************************/ //
//****************** Calculer les trajectoires possibles *****************/ //
//************************************************************************/ //

PapaEnnemi.prototype.planifierTrajectoires = function(ennemi) {
	var trajectoiresPossibles = [];
	// On rentre dans le tableau les index du tableau map.pathfind correspondants aux tiles adjacentes à celle occupée par l'ennemi
	trajectoiresPossibles.push(ennemi.caseAdjacente('up').x / 32 + ennemi.caseAdjacente('up').y / 32 * 21);
	trajectoiresPossibles.push(ennemi.caseAdjacente('down').x / 32 + ennemi.caseAdjacente('down').y / 32 * 21);
	trajectoiresPossibles.push(ennemi.caseAdjacente('left').x / 32 + ennemi.caseAdjacente('left').y / 32 * 21);
	trajectoiresPossibles.push(ennemi.caseAdjacente('right').x / 32 + ennemi.caseAdjacente('right').y / 32 * 21);
	for (var i = 0; i < 4; i++) {
		if (ennemi.map.pathfind[trajectoiresPossibles[i]] !== 0) { // on verifie si chaque tile à côté de l'ennemi est incluse dans le pathfind
			switch(i) {
				case 0 : 
					trajectoiresPossibles[i] = { // UP
						direction: 3,
						movingUp: true,
						movingDown: false,
						movingLeft: false,
						movingRight: false,
					};
					break;

				case 1 : 
					trajectoiresPossibles[i] = { // DOWN
						direction: 0,
						movingUp: false,
						movingDown: true,
						movingLeft: false,
						movingRight: false,
					};
					break;

				case 2 : 
					trajectoiresPossibles[i] = { // LEFT
						direction: 1,
						movingUp: false,
						movingDown: false,
						movingLeft: true,
						movingRight: false,
					};
					break;

				case 3 : 
					trajectoiresPossibles[i] = { // RIGHT
						direction: 2,
						movingUp: false,
						movingDown: false,
						movingLeft: false,
						movingRight: true,
					};
					break;

				default :

				return false;
			}
		} else if (ennemi.map.pathfind[trajectoiresPossibles[i]] === 0) { // Si la tuile n'est pas dans le pathfind on passe la trajectoire à false
			trajectoiresPossibles[i] = false;
		}
		if ((i === 0 && ennemi.movingDown) || (i === 1 && ennemi.movingUp) || (i === 2 && ennemi.movingRight) || (i === 3 && ennemi.movingLeft)) { // Si l'ennemi est déjà en déplacement, on passe à false la trajectoire qui le mènerait à rebrousser chemin
			trajectoiresPossibles[i] = false;
		}
	}
	for (var i = 0; i < trajectoiresPossibles.length; i++) {
		if (trajectoiresPossibles[i] === false) {
			trajectoiresPossibles.splice(i,1);
			i--;
		}
	}
	return trajectoiresPossibles;
}


//************************************************************************/ //
//************************** L'ennemi se déplace *************************/ //
//************************************************************************/ //

PapaEnnemi.prototype.deplacer = function(context, thisMap, ennemi) {

	// If ennemy is suprised by the player, he makes a jump
	if (ennemi.surpriseCounter > 0) {
		ennemi.y += Math.sin(ennemi.surpriseCounter * 2 * Math.PI / 15) * 5;
		ennemi.surpriseCounter --;
	}

	if (ennemi.enDeplacement) {
	var vectorX = ennemi.x;
	var vectorY = ennemi.y;

	if (!ennemi.outOfPathfind) {
		var trajectoireChoisie = {};
		var auCentreDUneTuile = (Math.round(ennemi.x / ennemi.vitesse) * ennemi.vitesse % 32 === 16 && (ennemi.movingLeft || ennemi.movingRight)) || (Math.round(ennemi.y / ennemi.vitesse) * ennemi.vitesse % 32 === 16 && (ennemi.movingUp || ennemi.movingDown));
		var immobile = !ennemi.movingUp && !ennemi.movingDown && !ennemi.movingLeft && !ennemi.movingRight;
		var changeTrajectoire = Math.floor(Math.random() * Math.floor(3)) === 0;
		var trajectoiresPossibles = ennemi.planifierTrajectoires(ennemi);

		// Si l'ennemi rencontre un virage dans le pathfind, 1 chance sur 3 d'arrêter le déplacement
		if (auCentreDUneTuile && !ennemi.testPathFind(ennemi, ennemi.direction) && Math.floor(Math.random() * Math.floor(2)) === 0) {
			ennemi.enDeplacement = false;
			ennemi.busy = false;
			ennemi.movingUp = false;
			ennemi.movingDown = false;
			ennemi.movingLeft = false;
			ennemi.movingRight = false;

			return false;
		}

		// Si l'ennemi est immobile OU qu'il arrive à un virage OU sur 1 chance sur 3 lorsqu'il arrive à un croisement : changement de trajectoire
		if (immobile || (auCentreDUneTuile && (changeTrajectoire || !ennemi.testPathFind(ennemi, ennemi.direction)))) {
			trajectoireChoisie = trajectoiresPossibles[Math.floor(Math.random() * Math.floor(trajectoiresPossibles.length))];
			ennemi.direction = trajectoireChoisie.direction;
			ennemi.nbFrame = 4;
			ennemi.enDeplacement = true;
			ennemi.movingUp = trajectoireChoisie.movingUp;
			ennemi.movingDown = trajectoireChoisie.movingDown;
			ennemi.movingLeft = trajectoireChoisie.movingLeft;
			ennemi.movingRight = trajectoireChoisie.movingRight;
		}
		
		if(ennemi.direction === 3) { // UP
			vectorY += -ennemi.vitesse;
		}

		if(ennemi.direction === 0) { // DOWN
			vectorY += ennemi.vitesse;
		}

		if(ennemi.direction === 1) { // LEFT
			vectorX += -ennemi.vitesse;
		}

		if(ennemi.direction === 2) { // RIGHT
			vectorX += ennemi.vitesse;
		}
	} else {
		if (Math.round((ennemi.x + ennemi.width / 2) / ennemi.vitesse) * ennemi.vitesse !== ennemi.coordPathfindRetrouve.x || Math.round((ennemi.y + ennemi.height / 2) / ennemi.vitesse) * ennemi.vitesse !== ennemi.coordPathfindRetrouve.y) {
			var pX = ennemi.coordPathfindRetrouve.x;
			var pY = ennemi.coordPathfindRetrouve.y;
			var eX = ennemi.x + ennemi.width / 2;
			var eY = ennemi.y + ennemi.height / 2;
			var b = pY - eY;
			var c = pX - eX;
			var angle = Math.atan2(b,c);
	    	var angleEnDegre = angle * 180 / Math.PI; // On passe de suite l'angle en degrés puis on l'arrange pour rester dans le positif
	    	if (angleEnDegre < 0) {
	    		angleEnDegre += 360;
			}
			ennemi.movingUp = false;
			ennemi.movingDown = false;
			ennemi.movingLeft = false;
			ennemi.movingRight = false;
			 if (angleEnDegre > 45 && angleEnDegre <= 135) {
		    	ennemi.direction = 0;
		    	ennemi.movingDown = true;
		    } else if (angleEnDegre > 135 && angleEnDegre <= 225) {
		    	ennemi.direction = 1;
		    	ennemi.movingLeft = true;
		    } else if ((angleEnDegre > 315 && angleEnDegre <= 360) || (angleEnDegre > 0 && angleEnDegre <= 45)) {
		    	ennemi.direction = 2;
		    	ennemi.movingUp = true;
		    } else if (angleEnDegre > 225 && angleEnDegre <= 315) {
		    	ennemi.direction = 3;
		    	ennemi.movingRight = true;
		    }
			vectorX += Math.cos(angle) * ennemi.vitesse;
			vectorY += Math.sin(angle) * ennemi.vitesse;
		} else {
			ennemi.x = ennemi.coordPathfindRetrouve.x;
			ennemi.y = ennemi.coordPathfindRetrouve.y;
			ennemi.busy = false;
			ennemi.enDeplacement = false;
			ennemi.outOfPathfind = false;
			ennemi.movingUp = false;
			ennemi.movingDown = false;
			ennemi.movingLeft = false;
			ennemi.movingRight = false;
		}
	}
	
	var checkCollBox = ennemi.testSettingCollisions(ennemi, vectorX, vectorY);

	var ennemiMarcheContreUneCollision = (ennemi.x === checkCollBox.vectorX && (ennemi.movingLeft || ennemi.movingRight)) || (ennemi.y === checkCollBox.vectorY && (ennemi.movingUp || ennemi.movingDown));

	if (!ennemi.outOfPathfind && ennemiMarcheContreUneCollision) {
		ennemi.busy = false;
		ennemi.enDeplacement = false;
		ennemi.movingUp = false;
		ennemi.movingDown = false;
		ennemi.movingLeft = false;
		ennemi.movingRight = false;
	}

	// Déplacements
	ennemi.x = checkCollBox.vectorX;
	ennemi.y = checkCollBox.vectorY;
	// On réajuste zIndex si nécessaire
	ennemi.zIndex = Math.round(this.y / 32);
	}
}


//*********************************************************************************************/ //
//* On test si l'ennemi qui se déplace va rester dans le pathfind après le déplacement souhaité *//
//*********************************************************************************************/ //
PapaEnnemi.prototype.testPathFind = function (ennemi, direction) {
	switch(direction) {
		case 3 :
			direction = 'up';
			break;

		case 0 :
			direction = 'down';
			break;

		case 1 :
			direction = 'left';
			break;

		case 2 :
			direction = 'right';
			break;

		default :
			console.log('ERROR IN PATHFIND with ennemy : ' + ennemi)
			return false;
	}
	var caseATester = ennemi.map.pathfind[ennemi.caseAdjacente(direction).x / 32 + ennemi.caseAdjacente(direction).y / 32 * 21];
	return (caseATester !== 0 && caseATester !== undefined);
}


//*********************************************************************************************/ //
//****************************** A la recherche du pathfind perdu *******************************//
//*********************************************************************************************/ //

PapaEnnemi.prototype.trouverPathfind = function (ennemi) {
	var pathfindTrouve = false;
	var iteration = 0;
	var spiraleBox = {};

	while (!pathfindTrouve && iteration < 500) { // Tant qu'on a pas retrouvé le pathfind on repete la boucle. On met un blindage à 500
		iteration ++;
		if (iteration >= 500) {
			console.log('La boucle while est cassée ! Verifier le pathfind et/ou les conditions de la métode PapaEnnemi.prototype.trouverPathfind');
			pathfindTrouve = true;
		}

		spiraleBox = yoyo.createSpirale(spiraleBox);

		var caseATester = ennemi.map.pathfind[Math.floor(ennemi.x / 32) + spiraleBox.cx + (Math.floor(ennemi.y / 32) + spiraleBox.cy) * 21];
		var isInsideCanvasX = (Math.floor(ennemi.x / 32) + spiraleBox.cx) * 32 + 16 > 0 && (Math.floor(ennemi.x / 32) + spiraleBox.cx) * 32 + 16 < roomTilesWidth * 32 - 32;
		var isInsideCanvasY = (Math.floor(ennemi.y / 32) + spiraleBox.cy) * 32 + 16 > 0 && (Math.floor(ennemi.y / 32) + spiraleBox.cy) * 32 + 16 < roomTilesHeight * 32;
		if (caseATester !== 0 && caseATester !== undefined && isInsideCanvasX && isInsideCanvasY) { // On teste si la tuile est comprise dans le canvas car le test en spirale fait du pathfind une mosaique qui se répète hors du canvas
    		pathfindTrouve = true;
			ennemi.coordPathfindRetrouve.x = (Math.floor(ennemi.x / 32) + spiraleBox.cx) * 32 + 16;
			ennemi.coordPathfindRetrouve.y = (Math.floor(ennemi.y / 32) + spiraleBox.cy) * 32 + 16;
			ennemi.enDeplacement = true;
			ennemi.nbFrame = 4;
		}
	}
}


//*********************************************************************************************/ //
//***************************************** Death ***********************************************//
//*********************************************************************************************/ //

PapaEnnemi.prototype.Death = function (thisMap, ennemi) {
	ennemi.isDead = true;
	ennemi.direction = ennemi.deadDirection;
	ennemi.zIndex = 1;
	ennemi.enDeplacement = false;
	ennemi.outOfPathfind = false;
	ennemi.movingUp = false;
	ennemi.movingDown = false;
	ennemi.movingLeft = false;
	ennemi.movingRight = false;
	ennemi.attacking = false;
	ennemi.recoilValue = 0;
	ennemi.recoilAngle = 0;

	// create dust FX
	yoyo.createNewDeadDustFX(thisMap, ennemi);

	// create gold bonus
	if (Math.round(Math.random()) === 1) {
		var dimensions = {
			x: ennemi.x + ennemi.width / 2,
			y: ennemi.y + ennemi.height / 2,
			width: 32,
			height: 32,
			spritesPerLine: 4
		}
		yoyo.createTreasure(dimensions, 0, thisMap.collectibles);
	} 

	generalCounter.addTimer(function() {
		thisMap.removeEnnemy();
	}, 1000);
}