from django.shortcuts import render
from django.http import HttpResponse
from channels import Group
import json

# Create your views here.
def index(request):
	return render(request, 'index.html')

def send_message(request):
	Group('users').send({
		'text': json.dumps({
			'message': "foo"
		})
	})
	return HttpResponse("sent value")