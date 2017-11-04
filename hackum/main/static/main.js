window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);

$("#welcome #start-button").onclick = function() {
	$(".section#welcome").style.display = 'none';
	$(".section#setup").style.display = 'block';
}

$("#setup #iclicker-channel").addEventListener("keypress", function(evt) {
    if (!(evt.which >= 65 && evt.which <= 68) && !(evt.which >= 97 && evt.which <= 100)) {
        evt.preventDefault();
    }
});

var iclickerConfig;
var gameConfig;
$("#setup #start-button").onclick = function() {
	$(".section#setup").style.display = 'none';
	$(".section#game").style.display = 'block';
	var channel = $("#iclicker-channel").value.toLowerCase();
	var mode = $("#iclicker-mode").value;
	var rom = $("#rom-selector").value;
	iclickerConfig = {
		"poll_type": mode,
		"channel": channel,
		"name": rom.toUpperCase().substring(0, 8)
	};

	gameConfig = {
		"platform": "gameboy",
		"rom": rom
	};

	initWebsockets(function() {
		startPoll(iclickerConfig);
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
			$("#game .loading").style.display = 'none';
			initGame();
		}
	}

	if (data.type == 'start_poll_error') {
		$("#loading-info").innerHTML += data.text+"\n";	
	}

	if (data.type == 'poll_response') {
		handlePollResponse(data.response);
	}
}

handlePollResponse = function(resp) {
	console.info("pollResponse", resp);
}

initGame = function() {
	console.debug("gameConfig", gameConfig);
}