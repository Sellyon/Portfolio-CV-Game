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
//    Main javascript file that call every other javascript files.
//
//************************************************************************/ //

'use strict';


//*************************** Global Variables ***************************/ //
var sizeTile = 32;
var roomTilesWidth = 21;
var roomTilesHeight = 11;
var heroAlive = false;
var debugMode = false;
var gameStarted = false;
var gamePaused = false;
var roomList = [];
var treasuresCollected = [];
var victory = false;
var levelIndex = 0;
var score = 0;
var newScore = 0;
var healthPixelReference = 90;
var newHealthPixelReference = 90;
var roomTransition = false;
var roomTransitionDirection = '';
var angularCollected = false;
var nodeJSCollected = false;
var javascriptCollected = false;
var startButtonClicked = false;

//**************************** generalCounter events ******************************/ //

var generalCounter = function () {
	generalCounter.value ++;
	// Decrease value of each timer
	for (var i = 0; i < generalCounter.timers.length; i ++) {
		generalCounter.timers[i] --;
		// Blindage
		if (generalCounter.timers[i] < 0) {
			generalCounter.timers[i] = 0;
		}
		// if timer reach 0 we trigger linked event and remove it from timers
		if (generalCounter.timers[i] <= 0) {
			generalCounter.events[i]();
			generalCounter.timers.splice(i,1);
			generalCounter.events.splice(i,1);
			i--;
		}
	}
}

generalCounter.addTimer = function (event, duration) {
	generalCounter.timers.push(Math.round(duration / 40));
	generalCounter.events.push(event);
};

generalCounter.value = 0;
generalCounter.timers = [];
generalCounter.events = [];

//***************************** Starting parameters ******************************/ //

window['map2'] = new Map('map2', 0, 0);
roomList.push(window['map2']);

var player = new PapaPlayer(window['map2'], 320, 108, 0);
window['map2'].addPersonnage(player);


//******************************* Level 1 settings ********************************/ //

var level1 = {
	levelWidth: 5,
	levelHeight:4,
	currentRoom: 2,
	angularRoom: 5,
	javascriptRoom: 17,
	nodeJSRoom: 9,
	roomList: [0, 0, 'map2', 0, 0,
	'map5', 'map6', 'map7', 'map8', 'map9',
	0, 0, 'map12', 0, 0,
	0, 0, 'map17', 0, 0],
}

//******************************** Tips management ********************************/ //

var tips = function () {
	var tipsOnDOM = document.getElementById('tipsMessage');
	var endPipe = document.getElementById('endPipe');
	var clearMessageDelayer = 1;
	var writeMessageDelayer = 2;
	var randomMessageDelayer = 250;
	if (Math.sin(generalCounter.value / 5) < 0) {
		tips.end = '|';
	} else {
		tips.end = '_';
	}

	if (tips.currentMessage !== tips.NewMessage && generalCounter.value % clearMessageDelayer === 0) {
		tips.clearMessage(tipsOnDOM);
	}
	if (tips.currentMessage === tips.NewMessage && tips.currentMessage !== tipsOnDOM.innerHTML && generalCounter.value % writeMessageDelayer === 0) {
		tips.addLetter(tipsOnDOM);
	}
	if (tips.currentMessage === tips.NewMessage && tips.currentMessage === tipsOnDOM.innerHTML && generalCounter.value % randomMessageDelayer === 0) {
		tips.getRandomTip(tipsOnDOM);
	}

	endPipe.innerHTML = tips.end;
}

tips.currentMessage = document.getElementById('tipsMessage');

tips.NewMessage = 'AIDEZ GOB A TROUVER LES ARTEFACTS SACRES !';

tips.end = '|';

tips.tutoEnnemyDone = false;

tips.clearMessage = function (tipsOnDOM) {
	tipsOnDOM.innerHTML = tipsOnDOM.innerHTML.substr(0, tipsOnDOM.innerHTML.length - 1);
	if (tipsOnDOM.innerHTML === '') {
		tips.currentMessage = tips.NewMessage;
	}
}

tips.addLetter = function (tipsOnDOM) {
	tipsOnDOM.innerHTML = tips.currentMessage.substr(0, tipsOnDOM.innerHTML.length + 1);
}

tips.getRandomTip = function () {
	document.getElementById('tips').style.color = '#444'
	var randomMessage = [
	'CE JEU A ETE REALISE EN JAVASCRIPT PUR, SANS FRAMEWORK NI ADDITIFS :)',
	'APPUYEZ SUR LA TOUCHE ² (CARRE) POUR ACTIVER LE MODE DEBUG',
	'THX TELLES POUR CE BEAU TILESET : https://www.deviantart.com/telles0808',
	'IL Y A UNE VRAIE (PETITE) IA QUI ANIME LES ENNEMIS',
	'CE SITE EST HEBERGE SUR UN RASPBERRY PI'
	];
	var randomMessageSelected = Math.floor(Math.random() * Math.floor(randomMessage.length));
	tips.NewMessage = randomMessage[randomMessageSelected];
}

//******************************** HUD management ********************************/ //

var updateHealth = function () {
	var offsetHeart1 = 0;
	var offsetHeart2 = 0;
	var offsetHeart3 = 0;
	var updateHeartLoop = setInterval(function() {
		if (newHealthPixelReference < healthPixelReference) {
			if (healthPixelReference > 60) {
				offsetHeart3 = -45;
			} else if (healthPixelReference > 30) {
				offsetHeart2 = -45;
			} else {
				offsetHeart1 = -45;
			}
			healthPixelReference -= 1;
		}
		if (newHealthPixelReference > healthPixelReference) {
			if (healthPixelReference < 30) {
				offsetHeart1 = 45;
			} else if (healthPixelReference < 60) {
				offsetHeart2 = 45;
			} else {
				offsetHeart3 = 45;
			}
			healthPixelReference += 1;
		}

		heart1.style.left = (Number(heart1.style.left.substr(0, heart1.style.left.length - 2)) + offsetHeart1) + 'px';
		heart2.style.left = (Number(heart2.style.left.substr(0, heart2.style.left.length - 2)) + offsetHeart2) + 'px';
		heart3.style.left = (Number(heart3.style.left.substr(0, heart3.style.left.length - 2)) + offsetHeart3) + 'px';

		if (newHealthPixelReference === healthPixelReference) {
			clearInterval(updateHeartLoop);
		}
	}, 80);
}

var updateScore = function () {
	var scoreAtScreen = document.getElementById('scoreText');
	var zeroFiller = ' : x';
	var scoreBackOpacity = 0.9;
	var updateScoreLoop = setInterval(function() {
		if (scoreBackOpacity > 0) {
			scoreAtScreen.style.backgroundColor = 'rgba(255, 179, 15, ' + scoreBackOpacity + ')';
			scoreBackOpacity -= 0.1;
		}
		if (score < newScore) {
			score += 10;
		}
		zeroFiller = ' : x';
		for (var i = 0; i < 7 - score.toString().length; i++) {
			zeroFiller += '0';
		}

		scoreAtScreen.innerHTML = zeroFiller + score;

		if (score === newScore) {
			clearInterval(updateScoreLoop);
		}
	}, 80);
}

//*********************** Create canvas & minimap ************************/ //

window.onload = function() {

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = roomTilesWidth * sizeTile;
    canvas.height = roomTilesHeight * sizeTile;

    var minimap = document.getElementById('minimap');
	var ctxMinimap = minimap.getContext('2d');
	
	minimap.width = level1.levelWidth * 32;
	minimap.height = level1.levelHeight * 32;

	var minimapBackGround = new Image();
	minimapBackGround.onload = function() {
		if(!this.complete) 
			throw 'Erreur de chargement du sprite nommé scroll.jpg';
	}
	minimapBackGround.src = 'ressources/sprites/scroll.jpg';

	var firstScreen = new Image();
	firstScreen.onload = function() {
		ctx.drawImage(firstScreen, 0, 0);
	}
	firstScreen.src = 'ressources/sprites/firstScreen.jpg';

//********************************* HUD **********************************/ //

	var heart1 = document.getElementById('heart1');
	var heart2 = document.getElementById('heart2');
	var heart3 = document.getElementById('heart3');
	var healthPixelReference = 90;
	var newHealthPixelReference = 90;

//******************************* Minimap management ********************************/ //

	var drawMinimap = function (context, level) {
		context.drawImage(minimapBackGround, 0, 0);
		var opacitySacredItem = (Math.sin(generalCounter.value / 40) + 3) / 4;
		var opacityPlayer = (Math.sin(generalCounter.value / 5) + 1) / 2;

		for (var i = 0; i < level.roomList.length; i++) {
			if (level.roomList[i] !== 0) {
				var thereIsARoomAtRight = (i + 1) % level.levelWidth !== 0 && level.roomList[i + 1] !== 0 && level.roomList[i + 1] !== undefined;
				var thereIsARoomAtBottom = level.roomList[i + level.levelWidth] !== 0 && level.roomList[i + level.levelWidth] !== undefined;
				if (thereIsARoomAtRight) {
					context.fillStyle = "black";
					context.fillRect(i % level.levelWidth * 32 + 30, Math.floor(i / level.levelWidth) * 32 + 14, 6, 6);
				}
				if (thereIsARoomAtBottom) {
					context.fillStyle = "black";
					context.fillRect(i % level.levelWidth * 32 + 14, Math.floor(i / level.levelWidth) * 32 + 30, 6, 6);
				}

				if (i === level.currentRoom) {
					context.globalAlpha = opacityPlayer;
					context.fillStyle = "teal";
					context.fillRect(i % level.levelWidth * 32, Math.floor(i / level.levelWidth) * 32, 34, 34);
					context.globalAlpha = 1;
				}
				context.fillStyle = "black";
				context.fillRect(i % level.levelWidth * 32 + 4, Math.floor(i / level.levelWidth) * 32 + 4, 26, 26);
				context.globalAlpha = opacitySacredItem;
				if (i === level.angularRoom && !angularCollected) {
					context.fillStyle = "red";
					context.fillRect(i % level.levelWidth * 32 + 8, Math.floor(i / level.levelWidth) * 32 + 8, 18, 18);
				} else if (i === level.javascriptRoom && !javascriptCollected) {
					context.fillStyle = "yellow";
					context.fillRect(i % level.levelWidth * 32 + 8, Math.floor(i / level.levelWidth) * 32 + 8, 18, 18);
				} else if (i === level.nodeJSRoom && !nodeJSCollected) {
					context.fillStyle = "green";
					context.fillRect(i % level.levelWidth * 32 + 8, Math.floor(i / level.levelWidth) * 32 + 8, 18, 18);
				}
				context.globalAlpha = 1;
			}
		}
	}

//*********************************** Start game ***********************************/ //
	
	document.getElementById('startGameButton').addEventListener("click", function(){
		if (!startButtonClicked) {
			startButtonClicked = true;
			document.getElementById('startGameButton').style.visibility = 'hidden';
			window['map2'].mapDrawStyle(ctx);
			setInterval(function() {
				if (gameStarted) {
					for (var i = 0; i < roomList.length; i++) {
						roomList[i].mapDrawStyle(ctx);
					}
					generalCounter();
					tips();
				}
				drawMinimap(ctxMinimap, level1)
			}, 40);
		}
	}, true);


//******************************* Player 1 controls ********************************/ //


	// Gestion du clavier
	window.onkeydown = function(event) {
		var e = event || window.event;
		var key = e.which || e.keyCode;
		if (key === 32 || key === 38 || key === 40 || key === 37 || key === 39) {
			e.preventDefault();
		}
		if (heroAlive && !victory && !roomTransition && !gamePaused && player.recoilValue === 0) {
			var startAnimWalk = function() {
				// We set frame in order to make the player-character immediatly lifting is leg
				if (player.frame === 0) {
					player.frame = player.frameSpeed;
				}
			}

			switch(key) {
			case 32 : case 69 : // espace, e
			if (!player.attacking || player.animFrame >= 3) {
					if (player.direction === 3) { // attack UP
						player.direction = 7;
					} else if (player.direction === 0) { // attack DOWN
						player.direction = 4;
					} else if (player.direction === 1) { // attack LEFT
						player.direction = 5;
					} else if (player.direction === 2) { // attack RIGTH
						player.direction = 6;
					}
					player.nbFrame = 6;
					player.frame = 0;
					player.attacking = true;
					player.frameSpeed = 1;
				}
				break;
			}

			switch(key) {
			case 38 : case 122 : case 119 : case 90 : case 87 : // arrow UP, z, w, Z, W
				player.direction = 3; // UP
				player.nbFrame = 4;
				player.movingUp = true;
				player.movingDown = false;
				player.attacking = false;
				player.frameSpeed = 5;
				startAnimWalk();
				break;

			case 40 : case 115 : case 83 : // arrow down, s, S
				player.direction = 0; // DOWN
				player.nbFrame = 4;
				player.movingDown = true;
				player.movingUp = false;
				player.attacking = false;
				player.frameSpeed = 5;
				startAnimWalk();
				break;

			case 37 : case 113 : case 97 : case 81 : case 65 : // arrow left, q, a, Q, A
				player.direction = 1; // LEFT
				player.nbFrame = 4;
				player.movingLeft = true;
				player.movingRight = false;
				player.attacking = false;
				player.frameSpeed = 5;
				startAnimWalk();
				break;

			case 39 : case 100 : case 68 : // arrow rigth, d, D
				player.direction = 2; // RIGTH
				player.nbFrame = 4;
				player.movingRight = true;
				player.movingLeft = false;
				player.attacking = false;
				player.frameSpeed = 5;
				startAnimWalk();
				break;

			case 222 : // ² : debug menu setting/unsetting
				if (!debugMode) {
					debugMode = true;
				} else {
					debugMode = false;
				}
				console.log('debug mode : ' + debugMode)
				break;

			default : 
			//console.log(key);
			
			return true;
			}
		}
	}
	window.onkeyup = function(event) {
		if (heroAlive && !roomTransition && !gamePaused) {
			var e = event || window.event;
			var key = e.which || e.keyCode;

			switch(key) {
			case 38 : case 122 : case 119 : case 90 : case 87 : // arrow up, z, w, Z, W
				player.movingUp = false;
				if (player.direction === 3 && player.movingLeft) {
					player.direction = 1;
				} else if (player.direction === 3 && player.movingRight) {
					player.direction = 2;
				}
				break;

			case 40 : case 115 : case 83 : // arrow down, s, S
				player.movingDown = false;
				if (player.direction === 0 && player.movingLeft) {
					player.direction = 1;
				} else if (player.direction === 0 && player.movingRight) {
					player.direction = 2;
				}
				break;

			case 37 : case 113 : case 97 : case 81 : case 65 : // arrow left, q, a, Q, A
				player.movingLeft = false;
				if (player.direction === 1 && player.movingUp) {
					player.direction = 3;
				} else if (player.direction === 1 && player.movingDown) {
					player.direction = 0;
				}
				break;

			case 39 : case 100 : case 68 : // arrow rigth, d, D
				player.movingRight = false;
				if (player.direction === 2 && player.movingUp) {
					player.direction = 3;
				} else if (player.direction === 2 && player.movingDown) {
					player.direction = 0;
				}
				break;
			default :

			return true;
			}
		}
	}

	var smoothScroll = (function() {
		var d = document;

		function init() {
			//Links 
			var homeAnchorLink  = d.getElementById('homeAnchorLink');
			var gameAnchorLink  = d.getElementById('gameAnchorLink');
			var workAnchorLink  = d.getElementById('workAnchorLink');
			var startGameLink  = d.getElementById('startGameButton');
			//Anchors
			var homeAnchor      = d.getElementById('main-image');
			var gameAnchor      = d.getElementById('tips');
			var workAnchor      = d.getElementById('work');
			
			homeAnchorLink.addEventListener('click', (e) => { scrollTo(window.scrollY, homeAnchor, e) }, false);
			gameAnchorLink.addEventListener('click', (e) => { scrollTo(window.scrollY, gameAnchor, e) }, false);
			startGameLink.addEventListener('click', (e) => { scrollTo(window.scrollY, gameAnchor, e) }, false);
			workAnchorLink.addEventListener('click', (e) => { scrollTo(window.scrollY, workAnchor, e) }, false);
			
			// console.log(gameAnchor); //DEBUG
			// console.log('main-image: '+scrollTopValue(homeAnchor)+' / '+offsetTopValue(homeAnchor)); //DEBUG
			// console.log('tips: '+scrollTopValue(gameAnchor)+' / '+offsetTopValue(gameAnchor)); //DEBUG
			// console.log('work: '+scrollTopValue(workAnchor)+' / '+offsetTopValue(workAnchor)); //DEBUG
			// d.addEventListener('scroll', (e) => { console.log(e) }, false); //DEBUG
			
			// console.log('App loaded. Have fun!');
		}
		
		function scrollTopValue(domElement) { //DEBUG
			return 'scrollTopValue:', domElement.scrollTop;
		}
		function offsetTopValue(domElement) { //DEBUG
			return 'offsetTopValue:', domElement.offsetTop;
		}

		//cf. https://gist.github.com/james2doyle/5694700
		// requestAnimationFrame for Smart Animating https://goo.gl/sx5sts
		var requestAnimFrame = (function() {
			return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
		})();

		function scrollTo(from, to, callback, duration = 1500) { //FIXME this always starts from '0', instead of the clicked element offsetTop -> This is because the position is calculated for the main <html> element, not the <iframe>'s <html> tag

			if (isDomElement(to)) {
				// console.log('this is an element:', to); //DEBUG
				to = to.offsetTop;
			}
			/*else {
				// console.log('this is NOT an element:', to); //DEBUG
			}*/
			
			// because it's so fucking difficult to detect the scrolling element, just move them all
			function move(amount) {
				// document.scrollingElement.scrollTop = amount; //FIXME Test that
				document.documentElement.scrollTop = amount;
				document.body.parentNode.scrollTop = amount;
				document.body.scrollTop = amount;
			}
			
			var start = from,
				change = to - start,
				currentTime = 0,
				increment = 20;
			// console.log('start:', start); //DEBUG
			// console.log('to:', to); //DEBUG
			// console.log('change:', change); //DEBUG
			
			var animateScroll = function() {
				// increment the time
				currentTime += increment;
				// find the value with the quadratic in-out easing function
				var val = Math.easeInOutQuad(currentTime, from, change, duration);
				// move the document.body
				move(val);
				// do the animation unless its over
				if (currentTime < duration) {
					requestAnimFrame(animateScroll);
				}
				else {
					if (callback && typeof(callback) === 'function') {
						// the animation is done so lets callback
						callback();
					}
				}
			};
			
			animateScroll();
		}

		init();
	})();

	//-------------------- Unimportant js functions --------------------
	// easing functions https://goo.gl/5HLl8
	//t = current time
	//b = start value
	//c = change in value
	//d = duration
	Math.easeInOutQuad = function(t, b, c, d) {
		t /= d / 2;
		if (t < 1) {
			return c / 2 * t * t + b
		}
		t--;
		return -c / 2 * (t * (t - 2) - 1) + b;
	};

	Math.easeInCubic = function(t, b, c, d) {
		var tc = (t /= d) * t * t;
		return b + c * (tc);
	};

	Math.inOutQuintic = function(t, b, c, d) {
		var ts = (t /= d) * t,
			tc = ts * t;
		return b + c * (6 * tc * ts + -15 * ts * ts + 10 * tc);
	};

	function isDomElement(obj) {
	    return obj instanceof Element;
	}

	function isMouseEvent(obj) {
	    return obj instanceof MouseEvent;
	}

	function findScrollingElement(element) { //FIXME Test this too
		do {
			if (element.clientHeight < element.scrollHeight || element.clientWidth < element.scrollWidth) {
				return element;
			}
		} while (element = element.parentNode);
	}
}