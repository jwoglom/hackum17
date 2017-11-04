window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);

$("#welcome #start-button").onclick = function() {
	$("#welcome").style.display = 'none';
	$("#setup").style.display = '';
}

$("#setup #iclicker-channel").addEventListener("keypress", function(evt) {
    if (!(evt.which >= 65 && evt.which <= 68) && !(evt.which >= 97 && evt.which <= 100)) {
        evt.preventDefault();
    }
});


$("#setup #start-button").onclick = function() {
	var channel = $("#iclicker-channel").value.toLowerCase();
	var mode = $("#iclicker-mode").value;
	var rom = $("#rom-selector").value;
	var config = {
		"poll_type": mode,
		"channel": channel,
		"name": rom.toUpperCase().substring(0, 8)
	};

	initWebsockets(function() {
		startPoll(config);
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