import os
import requests
from dotenv import load_dotenv

load_dotenv()
token = os.getenv('DISCORD_BOT_TOKEN')
guild_id = os.getenv('DISCORD_GUILD_ID')
headers = {'Authorization': f'Bot {token}'}

me = requests.get(f'https://discord.com/api/v10/users/@me', headers=headers).json()
bot_id = me['id']
member = requests.get(f'https://discord.com/api/v10/guilds/{guild_id}/members/{bot_id}', headers=headers).json()
print('Bot Member roles:', member.get('roles'))

roles = requests.get(f'https://discord.com/api/v10/guilds/{guild_id}/roles', headers=headers).json()
for r in roles:
    if r['id'] in member.get('roles', []):
        print(f"Role {r['name']}: permissions {r['permissions']}")

