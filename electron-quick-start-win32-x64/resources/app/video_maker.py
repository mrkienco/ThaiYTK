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
    opacity = args[6]
except:
	pass

audio = MP3(f"{path}\\full.mp3")
length = audio.info.length
# if not os.path.exists('{path}\\bg-mono.mp4'):
#     subprocess.run(f'ffmpeg.exe -y -i {path}\\background.mp4 -ac 1 {path}\\bg-mono.mp4')
subprocess.run(f'ffmpeg.exe -y -framerate 1/{time} -loop 1 -i {path}\\%03d.{format} -i  {path}\\full.mp3 -c:v libx264 -r {fps} -t {length} -pix_fmt yuv420p -c:a aac -strict experimental  -s {dimension} {path}\\full.mp4')
# subprocess.run(f'ffmpeg.exe -y -i {path}\\full.mp4 -i {path}\\bg-mono.mp4 -filter_complex "[0:v]setpts=PTS-STARTPTS, scale={dimension}[top];[1:v]setpts=PTS-STARTPTS, scale={dimension},format=yuva420p,colorchannelmixer=aa={opacity}[bottom];[top][bottom]overlay=shortest=1" -ac 1 -c:a aac -vcodec libx264 {path}\\out.mp4')