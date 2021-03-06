window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);

var gameRomConfigs = {
	"tetris": {
		"romName": "tetris",
		"romFile": "/static/roms/tetris.txt",
		"gameTitle": "Tetris",
		"platform": "gameboy",
		"controlMap": {
			"up": "F",
			"down": "C",
			"left": "A",
			"right": "B",
			"a": "E",
			"b": "D"
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
			"up": "C",
			"down": "F",
			"left": "D",
			"right": "E",
			"a": "A",
			"b": "B",
			"select": "G",
			"start": "H"
		},
		"holdKey": false
	},
	"pokemony": {
		"romName": "pokemony",
		"romFile": "/static/roms/pokemony.txt",
		"gameTitle": "Pokemon Yellow",
		"platform": "gameboy",
		"controlMap": {
			"up": "C",
			"down": "F",
			"left": "D",
			"right": "E",
			"a": "A",
			"b": "B",
			"select": "G",
			"start": "H"
		},
		"holdKey": false
	},
	"marioland": {
		"romName": "marioland",
		"romFile": "/static/roms/marioland.txt",
		"gameTitle": "Super Mario Land",
		"platform": "gameboy",
		"controlMap": {
			"up": "F",
			"down": "C",
			"left": "A",
			"right": "B",
			"a": "E",
			"b": "D"
		},
		"holdKey": false
	},
	"tennis": {
		"romName": "tennis",
		"romFile": "/static/roms/tennis.txt",
		"gameTitle": "Tennis",
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
	},
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
var totalHitList = {
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
};

var keyHitTime = 150;
var oneCharacterResponses = true; // truncate manual responses to one character
var allowingiClickerInput = true;

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
	$("body").classList.remove("with-gboy");
	$(".section#setup").style.display = 'none';
	$(".section#game").style.display = 'block';

	var channel = $("#iclicker-channel").value.toLowerCase();
	var iclickerMode = $("#iclicker-mode").value;
	var gameMode = $("#game-mode").value;
	var rom = $("#rom-selector").value;
	iclickerConfig = {
		"poll_type": iclickerMode,
		"channel": channel,
		"name": "IC PLAYS" //rom.toUpperCase().substring(0, 8)
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
	/*if (iclickerHandledResponses.indexOf(resp) != -1) {
		return;
	}
	iclickerHandledResponses.push(resp);*/


	if (oneCharacterResponses && resp.response.length > 1) {
		resp.response = resp.response.substring(0, 1)
	}

	console.info("pollResponse", resp);
	// clicker_id, click_time, response, seq_num
	clickerNewRemote(resp.clicker_id)

	// empty send
	if ((""+resp.response).length > 0) {

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
			if (allowingiClickerInput) {
				hitKey(gcontrol);

				var gcontrolNice = gcontrol.substring(0, 1).toUpperCase()+gcontrol.substring(1);
				addRemoteAction(""+resp.response+" ("+gcontrolNice+")", resp.clicker_id);
			} else {
				var gcontrolNice = gcontrol.substring(0, 1).toUpperCase()+gcontrol.substring(1);
				addRemoteAction("[PAUSED] "+resp.response+" ("+gcontrolNice+")", resp.clicker_id);
			}
		}

		
	}



}
hitKey = function(keyName) {
	console.info("hitKey", keyName);
	if (currentlyHitList[keyName] == null) {
		console.error("Invalid keyName", keyName);
		return;
	}
	if (!(gameConfig['holdkey']) || (!keyHoldKey[keyName]) ||
		(keyHoldKey[keyName] && gameConfig['holdKey'] && currentlyHitList[keyName] == 0)) {
		GameBoyKeyDown(keyName);
	}
	if (gameControlObjs[keyName] != null) {
		gameControlObjs[keyName].classList.add('hit');
	}
	currentlyHitList[keyName]++;
	totalHitList[keyName]++;
	//console.debug("chit+",JSON.stringify(currentlyHitList));
	setTimeout(function() {
		currentlyHitList[keyName]--;
		//console.debug("chit-",JSON.stringify(currentlyHitList));
		if ((!gameConfig['holdKey']) || (!keyHoldKey[keyName]) || 
			(currentlyHitList[keyName] == 0 && keyHoldKey[keyName] && gameConfig['holdKey'])) {
			GameBoyKeyUp(keyName);
			if (gameControlObjs[keyName] != null) {
				gameControlObjs[keyName].classList.remove('hit');
			}
		}
	}, keyHitTime);
}

resetHitList = function() {
	for (n in currentlyHitList) {
		if (n != null) {
			currentlyHitList[n] = 0;
			totalHitList[n] = 0;
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

				if (gameRomConfig['controlMap'][btn] > 'E') {
					$(".above-e-message").style.display = 'block';
				}
			}
		}
	}
}

resetUIControls = function() {
	for (btn in gameControlObjs) {
		if (btn != null) {
			gameControlObjs[btn].classList.remove('present');
			gameControlObjs[btn].innerHTML = '.';
		}
	}
}

initGame = function() {
	resetHitList();
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

	$("#emulation-speed").onchange = function() {
		var es = $("#emulation-speed");
		$("#emulation-speed-text").innerHTML = parseInt(parseFloat(es.value)*100)/100;
		gameboy.setSpeed(parseFloat(es.value));
	}


	resetUIControls();
	setUIControls();

	generateChart();
	setInterval(updateChart, 100);

	addRemoteAction("Started "+gameRomConfig["gameTitle"]+"", "");

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
	$("#ui-remote-count").innerHTML = '0';
	resetHitList();
	iclickerHandledResponses = [];
	iclickerRemotes = [];
	iclickerHistory = [];
	resetUIControls();
	$("#remote-actions").innerHTML = '';
	$(".above-e-message").style.display = 'none';
	$(".section#welcome").style.display = 'block';
	$("body").classList.add("with-gboy");

}

var chart;
generateChart = function() {
    var color = Chart.helpers.color;
    window.chartColors = {
		red: 'rgb(255, 99, 132)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 205, 86)',
		green: 'rgb(75, 192, 192)',
		blue: 'rgb(54, 162, 235)',
		purple: 'rgb(153, 102, 255)',
		grey: 'rgb(201, 203, 207)'
	};

	chartData = generateChartData();


    var ctx = document.getElementById("chartCanvas").getContext("2d");
    chart = new Chart(ctx, {
      type: 'horizontalBar',
      data: chartData,
      options: {
          // Elements options apply to all of the options unless overridden in a dataset
          // In this case, we are setting the border of each horizontal bar to be 2px wide
          elements: {
              rectangle: {
                  borderWidth: 2,
              }
          },
          responsive: true,
          maintainAspectRatio: false,
          legend: {
              position: 'bottom',
          },
          title: {
              display: true,
              text: 'Total Key Hits'
          }
      }
  });

}

generateChartData = function() {
	var color = Chart.helpers.color;
    var keys = ["A", "B", "Up", "Down", "Left", "Right", "Select", "Start"]
    var dataTotal = [];
    for (var i=0; i<keys.length; i++) {
      var ky = keys[i];
      dataTotal[i] = totalHitList[ky.toLowerCase()];
    }
    var chartData = {
      labels: keys,
      datasets: [{
        'label': 'All Presses',
        backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
        borderColor: window.chartColors.red,
        borderWidth: 1,
        data: dataTotal
      }]
    };
    return chartData;
}

updateChart = function() {
	var ndata = generateChartData();
	chart.data.labels = ndata.labels;
	chart.data.datasets = ndata.datasets;
	chart.update({'duration': 0});
}

toggleInputs = function() {
	if (allowingiClickerInput) {
		allowingiClickerInput = false;
		$("#pause-inputs").innerHTML = "Allow Inputs";
	} else {
		allowingiClickerInput = true;
		$("#pause-inputs").innerHTML = "Pause Inputs";
	}
}