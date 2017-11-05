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
		}
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
		}
	}
};
var gamePlatforms = {
	"gameboy": {
		"platformTitle": "Game Boy"
	}
};

var gameRomConfig; // set dynamically
var gameControlObjs;

var iclickerConfig;
var gameConfig;

var iclickerRemotes = [];

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
		$("#loading-info").innerHTML += data.status+"\n";

		if (data.status == 'started') {
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
	}
}

handlePollResponse = function(resp) {
	console.info("pollResponse", resp);
	// clicker_id, click_time, response, seq_num
	clickerNewRemote(resp.clicker_id)

	// empty send
	if ((""+resp.response).length > 0) {
		addRemoteAction("Input: "+resp.response, resp.clicker_id);


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
	GameBoyKeyDown(keyName);
	if (gameControlObjs[keyName] != null) {
		gameControlObjs[keyName].classList.add('hit');
	}
	setTimeout(function() {
		GameBoyKeyUp(keyName);
		if (gameControlObjs[keyName] != null) {
			gameControlObjs[keyName].classList.remove('hit');
		}
	}, 150);
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