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
//    Here is set the debug menu, wich was helpful to spot issues in collisions and IA's pathfind
//
//************************************************************************/ //

'use strict';

//*************************************************************** */
//******************** Debug management **************************//
//************** press ² to set/unset debug mode *****************//
//*************************************************************** */

Map.prototype.debug = function (context, h) {
	
	if (h === this.layerTileArray.length && debugMode) {

		// display sword hitline
		if (player.direction === 7) { // UP
			context.beginPath();
			context.lineWidth = '5';
            context.strokeStyle = '#C24';
            context.globalAlpha = 1;
			context.moveTo(player.x + player.width / 2, player.y + player.height - player.collHeight / 2 - 18);
			context.lineTo(player.x + player.width / 2 + Math.round(38 * Math.cos(Math.PI + Math.PI * (player.frame - 1) / (player.nbFrame - 1))), player.y + player.height - player.collHeight / 2 - 18 + Math.round(38 * Math.sin(Math.PI + Math.PI * (player.frame - 1) / (player.nbFrame - 1))));
			context.stroke();
		}
		if (player.direction === 4) { // DOWN
			context.beginPath();
			context.lineWidth = '5';
            context.strokeStyle = '#C24';
            context.globalAlpha = 1;
			context.moveTo(player.x + player.width / 2, player.y + player.height - player.collHeight / 2);
			context.lineTo(player.x + player.width / 2 + Math.round(38 * Math.cos(Math.PI * (player.frame - 1) / (player.nbFrame - 1))), player.y + player.height - player.collHeight / 2 + Math.round(38 * Math.sin(Math.PI * (player.frame - 1) / (player.nbFrame - 1))));
			context.stroke();
		}
		if (player.direction === 5) { // LEFT
			context.beginPath();
			context.lineWidth = '5';
            context.strokeStyle = '#C24';
            context.globalAlpha = 1;
			context.moveTo(player.x + player.width / 2 - 12, player.y + player.height - player.collHeight / 2);
			context.lineTo(player.x + player.width / 2 + Math.round(38 * Math.cos(Math.PI / 2 + Math.PI * (player.frame - 1) / (player.nbFrame - 1))) - 12, player.y + player.height - player.collHeight / 2 + Math.round(38 * Math.sin(Math.PI / 2 + Math.PI * (player.frame - 1) / (player.nbFrame - 1))));
			context.stroke();
		}
		if (player.direction === 6) { // RIGTH
			context.beginPath();
			context.lineWidth = '5';
            context.strokeStyle = '#C24';
            context.globalAlpha = 1;
			context.moveTo(player.x + player.width / 2 + 12, player.y + player.height - player.collHeight / 2);
			context.lineTo(player.x + player.width / 2 + Math.round(38 * Math.cos(3 * Math.PI / 2 + Math.PI * (player.frame - 1) / (player.nbFrame - 1))) + 12, player.y + player.height - player.collHeight / 2 + Math.round(38 * Math.sin(Math.PI / 2 + Math.PI * (player.frame - 1) / (player.nbFrame - 1))));
			context.stroke();
		}

		// display setting/destructibles collisions
		context.lineWidth = '1';
        context.strokeStyle = '#000';
		for (var i = 0; i < this.settingCollisions.length; i++) {
			var setCollX = this.settingCollisions[i].x;
			var setCollY = this.settingCollisions[i].y;
			var setCollWidth = this.settingCollisions[i].width;
			var setCollHeight = this.settingCollisions[i].height;
			context.globalAlpha = 0.5;
			if (!this.characters[0].blockedByCollision) {
				context.fillStyle = "green";
				} else {
					context.fillStyle = "red";
				}
				// display rectangles collisions
			if (this.settingCollisions[i].type === 'square') {
				context.fillRect(setCollX, setCollY, setCollWidth, setCollHeight);
				// display elliptic collisions
			} else if (this.settingCollisions[i].type === 'ellipse') {
				var centreXDuplayer = player.x + player.width / 2;
				var centreYDuplayer = player.y + player.height - player.collHeight / 2;
				var rayonCollisionCercleplayer = player.width / 2;
				var centreXDeLaColl = setCollX + setCollWidth / 2;
				var centreYDeLaColl = setCollY + setCollHeight / 2;
				var distanceCenterToPlayer = yoyo.getDistanceTwoPoints({x:centreXDeLaColl,y:centreYDeLaColl},{x:centreXDuplayer,y:centreYDuplayer});
				var angleAlpha = 0;
				var coteOppose = setCollX + setCollWidth / 2 - centreXDuplayer;
				var angleComplementaire = Math.acos(coteOppose / distanceCenterToPlayer);
				if (centreYDuplayer < centreYDeLaColl) {
					angleAlpha = Math.PI + angleComplementaire;
				} else {
					angleAlpha = Math.PI - angleComplementaire;
				}
				var coordBordEllipse = (setCollX + setCollWidth / 2 + setCollWidth/2 * Math.cos(angleAlpha), setCollY + setCollHeight / 2 + setCollWidth/2 * Math.sin(angleAlpha) * setCollHeight / setCollWidth);
				var distanceBorderToBorder = yoyo.getDistanceTwoPoints({x:centreXDuplayer,y:centreYDuplayer},{x:setCollX + setCollWidth / 2 + setCollWidth/2 * Math.cos(angleAlpha),y:setCollY + setCollHeight / 2 + setCollWidth/2 * Math.sin(angleAlpha) * setCollHeight / setCollWidth}) - rayonCollisionCercleplayer;

				context.beginPath();
				context.ellipse(setCollX + setCollWidth / 2, setCollY + setCollHeight / 2, setCollWidth / 2, setCollHeight / 2, 0, 0, 2 * Math.PI, false);
				context.fill();
				context.fillStyle = "black";
				context.fillRect(setCollX + setCollWidth / 2,setCollY + setCollHeight / 2,2,2);
				context.stroke();
				context.beginPath();
				//context.moveTo(setCollX + setCollWidth / 2, setCollY + setCollHeight / 2);
				context.moveTo(setCollX + setCollWidth / 2 + setCollWidth/2 * Math.cos(angleAlpha), setCollY + setCollHeight / 2 + setCollWidth/2 * Math.sin(angleAlpha) * setCollHeight / setCollWidth);
				context.lineTo(player.x + player.width / 2, player.y + player.height - player.collHeight / 2);
				context.stroke();
				context.globalAlpha = 1;
				context.font = "12px Arial";
				context.fillText('distance : ' + Math.round(distanceBorderToBorder), setCollX + setCollWidth / 2 - 40, setCollY + setCollHeight / 2 - 15);
				context.fillText('angle : ' + Math.round(angleAlpha * 180/Math.PI), setCollX + setCollWidth / 2 - 40, setCollY + setCollHeight / 2 + 15);
			}
		context.globalAlpha = 1;

		}
		// display characters collisions
		for(var i = 0, l = this.characters.length ; i < l ; i++) {
			var persoCollMinX = this.characters[0].x + (this.characters[0].width / 2) - (this.characters[0].collWidth / 2);
			var persoCollMinY = this.characters[0].y + this.characters[0].height - this.characters[0].collHeight;
			context.globalAlpha = 0.5;

			if (!this.characters[0].blockedByCollision) {
			context.fillStyle = "blue";
			} else {
				context.fillStyle = "red";
			}
			context.fillRect(persoCollMinX, persoCollMinY, this.characters[0].collWidth, this.characters[0].collHeight);
			context.globalAlpha = 1;
		}

		context.beginPath();
		context.fillStyle = "white";
		context.arc(this.characters[0].x + this.characters[0].width / 2, this.characters[0].y + this.characters[0].height / 2, 2, 0, 2 * Math.PI);
		context.fill();
		context.stroke();

		// display pathfind
		if (this.pathfind !== undefined) {
			for (i = 0; i < this.pathfind.length; i++) {
				if (this.pathfind[i] !== 0) {
					context.globalAlpha = 0.3;
					context.fillStyle = "purple";
					context.fillRect((i % 21) * 32, Math.floor(i / 21) * 32, 32, 32);
					context.globalAlpha = 1;
				}
			}
		}

		// deisplay exits
		if (this.exits !== undefined) {
			for (i = 0; i < this.exits.length; i++) {
				context.globalAlpha = 0.7;
				context.fillStyle = "teal";
				context.fillRect(this.exits[i].x, this.exits[i].y, this.exits[i].maxX - this.exits[i].x, this.exits[i].maxY - this.exits[i].y);
				context.globalAlpha = 1;
			}
		}

		// display ennemies
		for (var j = 0; j < this.characters.length; j++) {
			if (!this.characters[j].isHero) {
				context.beginPath();
				context.fillStyle = "red";
				context.arc(this.characters[j].x + this.characters[j].width / 2, this.characters[j].y + this.characters[j].height / 2, 2, 0, 2 * Math.PI);
				context.fill();
				context.stroke();

				context.globalAlpha = 0.3;
				context.fillStyle = "blue";
				context.fillRect(
					this.characters[j].x + this.characters[j].width / 2 - this.characters[j].collWidth / 2,
					this.characters[j].y + this.characters[j].height - this.characters[j].collHeight - this.characters[j].recalageCollHeight,
					this.characters[j].collWidth,
					this.characters[j].collHeight);
				context.globalAlpha = 1;

				if (!this.characters[j].movingDown) {
					context.globalAlpha = 0.3;
					context.fillStyle = "yellow";
					context.fillRect(this.characters[j].caseAdjacente('up').x, this.characters[j].caseAdjacente('up').y, 32, 32);
					context.globalAlpha = 1;
				}

				if (!this.characters[j].movingUp) {
					context.globalAlpha = 0.3;
					context.fillStyle = "yellow";
					context.fillRect(this.characters[j].caseAdjacente('down').x, this.characters[j].caseAdjacente('down').y, 32, 32);
					context.globalAlpha = 1;
				}

				if (!this.characters[j].movingRight) {
					context.globalAlpha = 0.3;
					context.fillStyle = "yellow";
					context.fillRect(this.characters[j].caseAdjacente('left').x, this.characters[j].caseAdjacente('left').y, 32, 32);
					context.globalAlpha = 1;
				}

				if (!this.characters[j].movingLeft) {
					context.globalAlpha = 0.3;
					context.fillStyle = "yellow";
					context.fillRect(this.characters[j].caseAdjacente('right').x, this.characters[j].caseAdjacente('right').y, 32, 32);
					context.globalAlpha = 1;
				}

				if (this.characters[j].enDeplacement) {
					switch(this.characters[j].direction) {
						case 3 :
							context.globalAlpha = 0.5;
							context.fillStyle = "green";
							context.fillRect(this.characters[j].caseAdjacente('up').x, this.characters[j].caseAdjacente('up').y, 32, 32);
							context.globalAlpha = 1;
							break;

						case 0 : 
							context.globalAlpha = 0.5;
							context.fillStyle = "green";
							context.fillRect(this.characters[j].caseAdjacente('down').x, this.characters[j].caseAdjacente('down').y, 32, 32);
							context.globalAlpha = 1;
							break;

						case 1 : 
							context.globalAlpha = 0.5;
							context.fillStyle = "green";
							context.fillRect(this.characters[j].caseAdjacente('left').x, this.characters[j].caseAdjacente('left').y, 32, 32);
							context.globalAlpha = 1;
							break;

						case 2 : 
							context.globalAlpha = 0.5;
							context.fillStyle = "green";
							context.fillRect(this.characters[j].caseAdjacente('right').x, this.characters[j].caseAdjacente('right').y, 32, 32);
							context.globalAlpha = 1;
							break;

						default :
						console.log('ERROR IN PATHFIND with ennemy : ' + this.characters[j])
						return false;
					}
				}
				if (this.characters[j].outOfPathfind && (this.characters[j].coordPathfindRetrouve.x !=0 || this.characters[j].coordPathfindRetrouve.y !=0)) {
					context.globalAlpha = 0.7;
					context.fillStyle = "white";
					context.fillRect(this.characters[j].coordPathfindRetrouve.x - 16, this.characters[j].coordPathfindRetrouve.y - 16, 32, 32);
					context.globalAlpha = 1;
				}
			}
		}
	}
}