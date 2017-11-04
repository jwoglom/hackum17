from django.conf.urls import url
from main.views import *

urlpatterns = [
	url(r'^$', index, name='index'),
	url(r'^websocket_demo$', websocket_demo, name='websocket_demo'),
	url(r'^send_get$', send_get, name='send_get'),
	url(r'^start_clicker_listener$', start_clicker_listener, name='start_clicker_listener')
]