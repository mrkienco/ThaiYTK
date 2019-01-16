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
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC 
import urllib.request
from pydub import AudioSegment
startTime = 2000
endTime = -2500

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

def get_type(voice):
    if voice in ['male', 'female', 'hatieumai', 'ngoclam', 'leminh']:
        return 'fpt'
    else:
        return 'vbee'

def download(path, voice=voice, speed=speed, prosody=prosody):
    file = f'{path}/input.txt'
    content = open(file, 'r', encoding='utf-8').read()
    type = get_type(voice)
    
    if type == 'fpt':
        wraptexts = wrap(content, 480)
    else:
        wraptexts = wrap(content, 4999)
    count = 0
    for i in range(len(wraptexts)):
        text = wraptexts[i]
        if os.path.exists("{}{:03}.mp3".format(path, i)):
            continue
        while True:
            try:
                if count >= 50:
                    return False
                time.sleep(1)
                if type == 'fpt':
                    
                    
                    api_key = random.choice(keys)
                    print('\n', api_key)
                    url = "http://api.openfpt.vn/text2speech/v4?api_key={}&voice={}&speed={}&prosody={}".format(api_key, voice, speed, prosody)
                    # print(voice)
                    response = requests.post(url, data=text.encode('utf-8'), headers={'voice':voice, 'speed':speed, 'prosody':prosody})
                    response = response.json()
                    print('\n', response['async'])
                    file = response['async']
                else:
                    driver = webdriver.Chrome()
                    driver.get("https://vbee.vn")

                    textarea = driver.find_element_by_class_name("ant-input")
                    textarea.clear()
                    textarea.send_keys(text)

                    button = driver.find_element_by_class_name("ant-btn")
                    button.click()

                    xp = '//*[@download]'
                    element = WebDriverWait(driver, 5000).until(EC.presence_of_element_located((By.XPATH, xp)))
                    file = element.get_attribute('href')
                count2 = 0
                while True:
                    if count2 >= 300:
                        break
                    try:
                        print("downloading file {}/{} ".format(i+1, len(wraptexts)), "{}\{:03}.mp3".format(path, i))
                        wget.download(file, "{}/{:03}.mp3".format(path, i))

                        if type != 'fpt':
                            song = AudioSegment.from_mp3("{}/{:03}.mp3".format(path, i))
                            extract = song[startTime:endTime]

                            # Saving
                            extract.export("{}/{:03}.mp3".format(path, i), format="mp3")
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