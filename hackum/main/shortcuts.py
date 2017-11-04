from channels import Group
import json
def send_message(obj):
	Group('users').send({
		"text": json.dumps(obj)
	})