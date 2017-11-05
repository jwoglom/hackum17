from main.iclickerlib import IClickerBase, IClickerPoll, log, close_pole
from main.shortcuts import send_message, reply_send
import json
from channels import Group
import signal


def response_callback(response):
    send_message({
        "type": "poll_response",
        "response": {
            "clicker_id": response.clicker_id,
            "response": response.response,
            "seq_num": response.seq_num,
            "click_time": response.click_time
        }
    })

def start_poll(poll_type, channel_str='ab', name='WELCOME'):
    print('Trying to start the IClicker poll')
    send_message({
        "type": "poll_init",
        "status": "trying"
    })

    log.setLevel(0)
    poll_type = 'alphanumeric'
    poll_duration = False
    #
    # Initiate the polling
    #
    print('Finding iClicker base...')
    send_message({
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
    base.initialize(channel_str[0], channel_str[1], name)
        
    # If we have successfully started a poll, set up a signal handler
    # to clean up when we get a SIGINT (ctrl+c or kill) command
    poll = IClickerPoll(base, response_callback)
    
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
    if poll:
        close_pole(poll)

def handle_sigint():
    print("Handling SIGINT")
    stop_poll()