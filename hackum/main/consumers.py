import json
from channels import Group
from main.pollcommands import start_poll, stop_poll
from main.shortcuts import send_message

def ws_connect(message):
    Group('users').add(message.reply_channel)
    Group('users').send({
        'text': json.dumps({
            'type': 'connect'
        })
    })

def ws_disconnect(message):
    send_message({
        'type': 'disconnect'
    })
    print("DISCONNECT", message.reply_channel)
    Group('users').discard(message.reply_channel)

def ws_message(message):
    print("WS Received:", message.content)
    send_message({'type': 'got_message', 'text': message.content['text']})
    msg = json.loads(message.content['text'])
    mtype = msg['type']

    if mtype == "start_poll":
        print("StartPoll received:", message.content)
        try:
            start_poll(msg['poll_type'], msg['channel'], msg['name'].upper())
        except Exception as e:
            print("str(e) = ", str(e))
            if "requested resource is in use" in str(e):
                send_message({
                    'type': 'poll_init',
                    'status': 'already_running'
                })
            else:
                send_message({
                    'type': 'start_poll_error',
                    'text': str(e)
                })
                raise e
    elif mtype == "stop_poll":
        print("StopPoll received:", message.content)
        ws_stop_poll(message)
    elif mtype == "message_back":
        send_message({
            'type': 'message_back_response',
            'text': message.content['text']
        })


def ws_stop_poll(message):
    print("StopPoll received:", message.content)
    stop_poll()