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
from mutagen.mp3 import MP3



args = sys.argv
try:
    path = args[1]
    time = args[2]
    format = args[3]
    fps = args[4]
    dimension = args[5]

except:
	pass

audio = MP3(f"{path}\\full.mp3")
length = audio.info.length

subprocess.run(f'ffmpeg.exe -y -framerate 1/{time} -loop 1 -i {path}\\%03d.{format} -i  {path}\\full.mp3 -c:v libx264 -r {fps} -t {length} -pix_fmt yuv420p -c:a aac -strict experimental  -s {dimension} {path}\\full.mp4')