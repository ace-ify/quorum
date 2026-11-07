import os
import requests
from dotenv import load_dotenv

load_dotenv()
token = os.getenv('DISCORD_BOT_TOKEN')
guild_id = os.getenv('DISCORD_GUILD_ID')
headers = {'Authorization': f'Bot {token}'}

r = requests.get(f'https://discord.com/api/v10/guilds/{guild_id}/channels', headers=headers)
print('Status:', r.status_code)
if r.status_code == 200:
    for ch in r.json():
        print(f"{ch['id']} : #{ch['name']} (type {ch['type']})")
else:
    print('Error:', r.text)

