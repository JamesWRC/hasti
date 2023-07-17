import requests
import time
URL = ''
path = URL + '/health'

for i in range(999999):
    request = requests.get(path)
    time.sleep(0.001)

    print(request.json())