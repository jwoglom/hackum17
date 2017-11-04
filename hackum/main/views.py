from django.shortcuts import render
from django.http import HttpResponse
from main.shortcuts import send_message

# Create your views here.
def index(request):
	return render(request, 'index.html')

def websocket_demo(request):
	return render(request, 'websocket-demo.html')

def send_get(request):
	send_message({"get": request.GET.get('message')})
	return HttpResponse("sent value of GET.message")

def start_clicker_listener(request):
	pass