window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);

var gameRomConfigs = {
	"tetris": {
		"romName": "tetris",
		"romFile": "/static/roms/tetris.txt",
		"gameTitle": "Tetris",
		"platform": "gameboy",
		"controlMap": {
			"up": null,
			"down": "E",
			"left": "C",
			"right": "D",
			"a": "A",
			"b": "B"
		},
		"holdKey": false
	},
	"snake": {
		"romName": "snake",
		"romFile": "/static/roms/snake.txt",
		"gameTitle": "Snake",
		"platform": "gameboy",
		"controlMap": {
			"up": "A",
			"down": "B",
			"left": "C",
			"right": "D",
			"a": null,
			"b": null,
			"select": null,
			"start": "E"
		},
		"holdKey": true
	},
	"pokemong": {
		"romName": "pokemong",
		"romFile": "/static/roms/pokemong.txt",
		"gameTitle": "Pokemon Gold",
		"platform": "gameboy",
		"controlMap": {
			"up": "A",
			"down": "B",
			"left": "C",
			"right": "D",
			"a": null,
			"b": null,
			"select": null,
			"start": "E"
		},
		"holdKey": false
	},
	"pokemony": {
		"romName": "pokemony",
		"romFile": "/static/roms/pokemony.txt",
		"gameTitle": "Pokemon Yellow",
		"platform": "gameboy",
		"controlMap": {
			"up": "A",
			"down": "B",
			"left": "C",
			"right": "D",
			"a": null,
			"b": null,
			"select": null,
			"start": "E"
		},
		"holdKey": false
	},
	"marioland": {
		"romName": "marioland",
		"romFile": "/static/roms/marioland.txt",
		"gameTitle": "Super Mario Land",
		"platform": "gameboy",
		"controlMap": {
			"up": null,
			"down": "E",
			"left": "C",
			"right": "D",
			"a": "A",
			"b": "B",
			"select": null,
			"start": null
		},
		"holdKey": false // only arrow
	}
};
var gamePlatforms = {
	"gameboy": {
		"platformTitle": "Game Boy"
	}
};

var currentlyHitList = {
	"up": 0,
	"down": 0,
	"left": 0,
	"right": 0,
	"a": 0,
	"b": 0,
	"select": 0,
	"start": 0
};
var keyHoldKey = {
	"up": true,
	"down": true,
	"left": true,
	"right": true,
	"a": false,
	"b": false,
	"select": false,
	"start": false
}

var keyHitTime = 200;

var iclickerHandledResponses = [];

var gameRomConfig; // set dynamically
var gameControlObjs;

var iclickerConfig;
var gameConfig;

var iclickerRemotes = [];
var iclickerHistory = [];
(function() {
	var games = ["<b>Pokemon</b>", "<b>Pokemon</b>"];
	for (n in gameRomConfigs) {
		if (n != null) {
			var t = gameRomConfigs[n]['gameTitle'];
			if (t.toLowerCase().indexOf('pokemon') == -1) games.push(t);
		}
	}
    var gamei = -1;
    setInterval(function() {
     $("#welcome h1 span.pokemon").innerHTML = games[(++gamei)%games.length];;
   }, 1500);
})();

$("#welcome #start-button").onclick = function() {
	$(".section#welcome").style.display = 'none';
	$(".section#setup").style.display = 'block';
	var sel = $("#rom-selector");
	for (romName in gameRomConfigs) {
		if (romName != null) {
			var cfg = gameRomConfigs[romName];
			var pfm = gamePlatforms[cfg['platform']];
			sel.innerHTML += '<option value="' + cfg['romName'] + '">' + cfg['gameTitle'] + ' (' + pfm['platformTitle'] + ')';
		}
	}
	jQuery('select#rom-selector').material_select();
}


$("#setup #iclicker-channel").addEventListener("keypress", function(evt) {
    if (!(evt.which >= 65 && evt.which <= 68) && !(evt.which >= 97 && evt.which <= 100)) {
        evt.preventDefault();
    }
});

$("#setup #start-button").onclick = function() {
	$(".section#setup").style.display = 'none';
	$(".section#game").style.display = 'block';
	var channel = $("#iclicker-channel").value.toLowerCase();
	var iclickerMode = $("#iclicker-mode").value;
	var gameMode = $("#game-mode").value;
	var rom = $("#rom-selector").value;
	iclickerConfig = {
		"poll_type": iclickerMode,
		"channel": channel,
		"name": rom.toUpperCase().substring(0, 8)
	};

	gameConfig = {
		"mode": gameMode,
		"platform": "gameboy",
		"romName": rom
	};

	initWebsockets(function() {
		startPoll(iclickerConfig);
		initGame();
	});
}

var socket;
initWebsockets = function(cb) {
    socket = new WebSocket('ws://' + window.location.host + '/');

    socket.onopen = function open() {
      console.log('WebSockets connection created.');
      !!cb && cb();
    };

    socket.onmessage = function message(event) {
    	var data = JSON.parse(event.data);
    	console.log('onMessage', data);
    	handleMessage(data);
    }

    if (socket.readyState == WebSocket.OPEN) {
      socket.onopen();
    }
}

sendMessage = function(type, data) {
	var str = JSON.stringify(Object.assign(data, {
		"type": type
	}));
	socket.send(str);
	console.debug("sendMessage", str);
}

startPoll = function(config) {
	sendMessage('start_poll', config);
}

stopPoll = function() {
	sendMessage('stop_poll', {});
}

sendPing = function() {
	sendMessage('message_back', "Hello from "+navigator.userAgent+" at "+(+new Date));
}

handleMessage = function(data) {
	console.debug("message", data.type);
	if (data.type == 'poll_init') {
		var statuses = {
			"trying": "Initializing USB driver...",
			"finding": "Looking for base station...",
			"initializing": "Initializing iClicker base..."
		};

		$("#loading-info").innerHTML += (statuses[data.status] == null ? data.status : statuses[data.status])+"\n";
		if (data.status == 'already_running') console.log("Server says already started!!");

		if (data.status == 'started' || data.status == 'already_running') {
			updateUI();
			$(".connect-popup").style.display = 'block';
			$("#game .loading").style.display = 'none';
		}
	}

	if (data.type == 'start_poll_error') {
		$("#loading-info").innerHTML += data.text+"\n";	
	}

	if (data.type == 'poll_response') {
		handlePollResponse(data.response);
	}
}

updateUI = function() {
	$("#ui-remote-count").innerHTML = iclickerRemotes.length;
	$("#ui-clicker-channel").innerHTML = iclickerConfig['channel'].toUpperCase();
	$("#ui-mode").innerHTML = gameConfig['mode'];
}


addRemoteAction = function(message, secondary) {
	var ra = $("#remote-actions");
	ra.innerHTML += "<li class='collection-item'>" +
	"<span>" + message + "</span>" +
	"<span class='secondary-content'>" + secondary + "</span></li>";

	ra.scrollTop = ra.scrollHeight;
}

clickerNewRemote = function(cid) {
	if (iclickerRemotes.indexOf(cid) == -1) {
		iclickerRemotes.push(cid);
		updateUI();
		addRemoteAction("New clicker joined!", cid);
		$(".remote-count").classList.add('hit');
		setTimeout(function() {
			$(".remote-count").classList.remove('hit');
		}, 1000);

		iclickerHistory[cid] = [];
	}
}

handlePollResponse = function(resp) {
	if (iclickerHandledResponses.indexOf(resp) != -1) {
		return;
	}
	iclickerHandledResponses.push(resp);
	console.info("pollResponse", resp);
	// clicker_id, click_time, response, seq_num
	clickerNewRemote(resp.clicker_id)

	// empty send
	if ((""+resp.response).length > 0) {
		addRemoteAction("Input: "+resp.response, resp.clicker_id);

		iclickerHistory[resp.clicker_id].push({
			"time": new Date(),
			"response": resp.response
		});

		var ctrlOp = {};
		for (btn in gameRomConfig['controlMap']) {
			if (btn != null) {
				ctrlOp[gameRomConfig['controlMap'][btn]] = btn;
			}
		}

		var gcontrol = ctrlOp[resp.response];
		if (gcontrol != null) {
			console.log("resp:"+resp.response+" ctrl:"+gcontrol);
			hitKey(gcontrol);
		}
	}



}
hitKey = function(keyName) {
	console.info("hitKey", keyName);
	if (currentlyHitList[keyName] == null) {
		console.error("Invalid keyName", keyName);
		return;
	}
	if ((keyHoldKey[keyName] && gameConfig['holdKey'] && currentlyHitList[keyName] == 0) ||
		(!keyHoldKey[keyName]) || !(gameConfig['holdkey'])) {
		GameBoyKeyDown(keyName);
	}
	if (gameControlObjs[keyName] != null) {
		gameControlObjs[keyName].classList.add('hit');
	}
	currentlyHitList[keyName]++;
	console.debug("chit+",JSON.stringify(currentlyHitList));
	setTimeout(function() {
		currentlyHitList[keyName]--;
		console.debug("chit-",JSON.stringify(currentlyHitList));
		if ((currentlyHitList[keyName] == 0 && keyHoldKey[keyName] && gameConfig['holdKey']) ||
		    (!keyHoldKey[keyName]) || (!gameConfig['holdKey'])) {
			GameBoyKeyUp(keyName);
			if (gameControlObjs[keyName] != null) {
				gameControlObjs[keyName].classList.remove('hit');
			}
		}
	}, keyHitTime);
}

resetCurrentlyHitList = function() {
	for (n in currentlyHitList) {
		if (n != null) {
			currentlyHitList[n] = 0;
		}
	}
}

setUIControls = function() {
	var objs = gameControlObjs;


	for (btn in gameRomConfig['controlMap']) {
		if (btn != null) {
			objs[btn].classList.remove('present');
			if (gameRomConfig['controlMap'][btn] != null) {
				objs[btn].innerHTML = gameRomConfig['controlMap'][btn];
				objs[btn].classList.add('present');
			}
		}
	}


}

initGame = function() {
	resetCurrentlyHitList();
	console.debug("gameConfig", gameConfig);
	gameRomConfig = gameRomConfigs[gameConfig['romName']]
	gameControlObjs = {
		"up": $(".d-pad-table .up-arrow"),
		"down": $(".d-pad-table .down-arrow"),
		"left": $(".d-pad-table .left-arrow"),
		"right": $(".d-pad-table .right-arrow"),
		"a": $(".d-pad-table .a-button"),
		"b": $(".d-pad-table .b-button"),
		"select": $(".d-pad-table .select-button"),
		"start": $(".d-pad-table .start-button"),
		
	};

	setUIControls();

	if (gameRomConfig['platform'] == 'gameboy') {
    	windowingInitialize(gameRomConfig['romFile']);
    }
}

backButton = function() {
	if (gameRomConfig != null) {
		if (gameRomConfig['platform'] == 'gameboy') {
			pause();
		}
	}

	$(".section#setup").style.display = 'none';
	$(".section#game").style.display = 'none';
	$(".connect-popup").style.display = '';
	$(".loading").style.display = '';
	$("#rom-selector").innerHTML = ''; // prevent dups
	socket.onmessage = socket.onopen = socket = null;
	$(".section#welcome").style.display = 'block';

}