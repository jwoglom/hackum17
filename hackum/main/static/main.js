window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);

$("#start-button").onclick = function start() {
	$("#welcome").style.display = 'none';
	$("#setup").style.display = '';
}