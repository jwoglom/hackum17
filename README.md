iClicker Plays Pokemon
======================

A project developed by James Woglom and Christopher Rybicki that allows students with iClicker polling devices to crowdsource actions in single-player games like Tetris and Pokemon. Designed as a spin-off of the popular worldwide gaming phenomenon [Twitch Plays Pokemon](https://en.wikipedia.org/wiki/Twitch_Plays_Pokémon), our API has been open sourced through a GPL 3.0 license allowing input from iClicker devices to be used for any JavaScript based game or service via HTML5 WebSockets.

Look at our [wiki pages](https://github.com/jwoglom/hackum17/wiki) for information on the hardware and APIs!

## Installation 

1. Install and run [Zadig](http://zadig.akeo.ie/)
2. Choose "iClicker Base" and install the libusb-win32 driver
3. Install `virtualenvwrapper-win` through `pip`
4. Create a virtual environment and do `pip install -r requirements.txt`
5. Install redis in WSL: `apt-get install redis-server`
6. Run redis in WSL: `redis-server`
7. Run `./manage.py runserver`

For full installation instructions, view our helpful [wiki pages](https://github.com/jwoglom/hackum17/wiki).
