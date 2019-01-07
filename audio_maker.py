import sys
import requests
import os
import datetime
from textwrap import wrap
import time
import wget
import random
import subprocess
import shutil

keys = open('keys.txt', 'r').read().split()

voice = "female"
speed= "0"
prosody= "0"


args = sys.argv
try:
	path = args[1]
	voice = args[2]
	speed= args[3]
	prosody= args[4]
except:
	pass


def merge_files(path):
	f = open(f"{path}/list.txt", "w")
	for item in os.listdir(path):
		if '.mp3' in item:
			f.write(f'file {item}\n')
	f.close()
	p = subprocess.run('ffmpeg -f concat -safe 0 -i {}/list.txt -c copy {}/full.mp3'.format(path, path))

def download(path, voice=voice, speed=speed, prosody=prosody):
    file = f'{path}/input.txt'

    content = open(file, 'r', encoding='utf-8').read()
    wraptexts = wrap(content, 480)
    count = 0
    for i in range(len(wraptexts)):
        if os.path.exists("{}{:03}.mp3".format(path, i)):
            continue
        while True:
            try:
                if count >= 50:
                    return False
                time.sleep(1)
                text = wraptexts[i]
                api_key = random.choice(keys)
                print('\n', api_key)
                url = "http://api.openfpt.vn/text2speech/v4?api_key={}&voice={}&speed={}&prosody={}".format(api_key, voice, speed, prosody)
                # print(voice)
                response = requests.post(url, data=text.encode('utf-8'), headers={'voice':voice, 'speed':speed, 'prosody':prosody})
                response = response.json()
                print('\n', response['async'])
                file = response['async']
                
                count2 = 0
                while True:
                    if count2 >= 300:
                        break
                    try:
                        print("downloading file {}/{} ".format(i+1, len(wraptexts)), "{}\{:03}.mp3".format(path, i))
                        wget.download(file, "{}/{:03}.mp3".format(path, i))
                        count2 = 0
                        count = 0
                        break
                    except:
                        count2 += 1
                        time.sleep(1)
                if count2 == 0:
                    break
            except :
                
                print('Waiting...', end='')
                count += 1
                continue
			
    print('\nCOMPLETE')
    return True

def remove_all(path):
	for item in os.listdir(f'{path}'):
		if item.endswith(".mp3"):
			os.remove(os.path.join(path, item))
	print('remove all file mp3')
def remove_files(path):
	for item in os.listdir(f'{path}'):
		if item.endswith(".mp3") and item !='full.mp3' and item != "out.mp3":
			os.remove(os.path.join(path, item))
	print('remove all file mp3')

def run_all(path, voice=voice, speed=speed, prosody=prosody):
    remove_all(path)
    result = download(path, voice, speed, prosody)
    if result:
        merge_files(path)
        remove_files(path)
    else:
        print('SOME FILE IS NOT OK')

run_all(path, voice, speed, prosody)