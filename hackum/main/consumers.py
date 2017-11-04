import json
from channels import Group

def ws_connect(message):
	Group('users').add(message.reply_channel)
	Group('users').send({
		'text': json.dumps({
			'type': 'connect'
		})
	})

def ws_disconnect(message):
	Group('users').send({
        'text': json.dumps({
            'type': 'disconnect'
        })
    })
	Group('users').discard(message.reply_channel)

