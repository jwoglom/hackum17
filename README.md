hackum17
========

For Windows:
* install and run Zadig (http://zadig.akeo.ie/)
* Choose "iClicker Base" and install the libusb-win32 driver
* pip install virtualenvwrapper-win pypiwin32
* mkvirtualenv hackum17
* workon hackum17
* pip install -r requirements.txt
* Install redis in WSL (bash.exe); apt-get install redis-server
* Run redis in WSL (redis-server)
* ./manage.py runserver on port 8000

Linux/Mac:
* mkvirtualenv hackum17 --python=$(which python3)
* workon hackum17
* pip install -r requirements.txt
* Install redis (apt-get install redis-server or brew install redis)