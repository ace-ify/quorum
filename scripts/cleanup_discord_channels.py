import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()
token = os.getenv('DISCORD_BOT_TOKEN')
guild_id = os.getenv('DISCORD_GUILD_ID')
headers = {'Authorization': f'Bot {token}'}

legacy_channel_names = [
    "living-room",
    "saboteur-den",
    "confession-marcus",
    "confession-elena",
    "confession-arthur",
    "confession-maya",
    "confession-human",
    "evicted-lounge"
]

r = requests.get(f'https://discord.com/api/v10/guilds/{guild_id}/channels', headers=headers)
if r.status_code == 200:
    channels = r.json()
    for ch in channels:
        name = ch['name']
        cid = ch['id']
        if name in legacy_channel_names:
            print(f"Deleting legacy channel #{name} ({cid})...")
            del_r = requests.delete(f'https://discord.com/api/v10/channels/{cid}', headers=headers)
            print(f"Deleted #{name}: status {del_r.status_code}")
            time.sleep(0.5)

print("Legacy channels cleanup complete!")

