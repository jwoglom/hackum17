from django.conf.urls import url
from main.views import index, send_message

urlpatterns = [
	url(r'^$', index, name='index'),
	url(r'^send_message$', send_message, name='send_message')
]