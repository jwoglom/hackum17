from channels import Group
import json
def send_message(obj, immediately=True):
	print("Sending to users:",obj)
	Group('users').send({
		"text": json.dumps(obj)
	}, immediately=immediately)

def reply_send(reply_channel, obj, immediately=True):
	print("Sending to reply channel ", reply_channel,":",obj)
	reply_channel.send({
		"text": json.dumps(obj)
	}, immediately=immediately)