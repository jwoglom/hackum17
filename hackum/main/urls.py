from django.conf.urls import url
from main.views import index, send_get

urlpatterns = [
	url(r'^$', index, name='index'),
	url(r'^send_get$', send_get, name='send_get')
]