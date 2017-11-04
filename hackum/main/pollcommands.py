from main.iclickerlib import IClickerBase, IClickerPoll, log, close_pole
from main.shortcuts import send_message, reply_send
import json
from channels import Group
import signal
import threading


poll = None
def start_poll(reply_channel):
    print('Trying to start the IClicker poll')
    Group('users').send({
        "text": json.dumps({"foo": "bar"})
    })

    log.setLevel(0)
    poll_type = 'alpha'
    poll_duration = False
    freq1 = 'a'
    freq2 = 'b'
    welcome_msg = 'WELCOME'
    #
    # Initiate the polling
    #
    print('Finding iClicker base...')
    reply_send(reply_channel, {
        "type": "poll_init",
        "status": "finding"
    })
    base = IClickerBase()
    base.get_base()

    print('Initializing iClicker base...')
    send_message({
        "type": "poll_init",
        "status": "initializing"
    })
    base.initialize(freq1, freq2, welcome_msg)
        
    # If we have successfully started a poll, set up a signal handler
    # to clean up when we get a SIGINT (ctrl+c or kill) command
    poll = IClickerPoll(base)
    
    #signal.signal(signal.SIGINT, lambda *x: close_pole(poll))
    
    print('Poll started!')
    send_message({
        "type": "poll_init",
        "status": "started"
    })

    poll.start_poll(poll_type)

    # If we made it this far and stop_timer wasn't triggered, we were asked to stop another
    # way, so we should stop the stop_timer
    stop_timer.cancel()
    
def stop_poll():
    close_pole(poll)