import requests
from bs4 import BeautifulSoup
import json

def get_talent_data(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    talent_data = {
        "normal_attack": [],
        "skill": [],
        "burst": []
    }

    # Get Normal Attack Talent Data
    normal_attack_table = soup.find('div', {'class': 'tabItem_Ymn6', 'role': 'tabpanel'})
    if normal_attack_table:
        rows = normal_attack_table.find_all('tr')
        for row in rows:
            cols = row.find_all('td')
            for row in rows:
                cols = row.find_all('td')
                if len(cols) > 1:
                    talent = {
                        "name": cols[0].text.strip(),
                        "lv1": cols[1].text.strip() if len(cols) > 1 else "",
                        "lv2": cols[2].text.strip() if len(cols) > 2 else "",
                        "lv3": cols[3].text.strip() if len(cols) > 3 else "",
                        "lv4": cols[4].text.strip() if len(cols) > 4 else "",
                        "lv5": cols[5].text.strip() if len(cols) > 5 else "",
                        "lv6": cols[6].text.strip() if len(cols) > 6 else "",
                        "lv7": cols[7].text.strip() if len(cols) > 7 else "",
                        "lv8": cols[8].text.strip() if len(cols) > 8 else "",
                        "lv9": cols[9].text.strip() if len(cols) > 9 else "",
                        "lv10": cols[10].text.strip() if len(cols) > 10 else "",
                        "lv11": cols[11].text.strip() if len(cols) > 11 else ""
                    }
                    talent_data["normal_attack"].append(talent)

    # Get Skill Talent Data
    skill_table = normal_attack_table.find_next('div', {'class': 'tabItem_Ymn6', 'role': 'tabpanel'})
    if skill_table:
        rows = skill_table.find_all('tr')
        for row in rows:
            cols = row.find_all('td')
            if len(cols) > 1:
                talent = {
                    "name": cols[0].text.strip(),
                    "lv1": cols[1].text.strip() if len(cols) > 1 else "",
                    "lv2": cols[2].text.strip() if len(cols) > 2 else "",
                    "lv3": cols[3].text.strip() if len(cols) > 3 else "",
                    "lv4": cols[4].text.strip() if len(cols) > 4 else "",
                    "lv5": cols[5].text.strip() if len(cols) > 5 else "",
                    "lv6": cols[6].text.strip() if len(cols) > 6 else "",
                    "lv7": cols[7].text.strip() if len(cols) > 7 else "",
                    "lv8": cols[8].text.strip() if len(cols) > 8 else "",
                    "lv9": cols[9].text.strip() if len(cols) > 9 else "",
                    "lv10": cols[10].text.strip() if len(cols) > 10 else "",
                    "lv11": cols[11].text.strip() if len(cols) > 11 else "",
                    "lv12": cols[12].text.strip() if len(cols) > 12 else "",
                    "lv13": cols[13].text.strip() if len(cols) > 13 else ""
                }
                talent_data["skill"].append(talent)

    # Get Burst Talent Data
    burst_table = skill_table.find_next('div', {'class': 'tabItem_Ymn6', 'role': 'tabpanel'})
    if burst_table:
        rows = burst_table.find_all('tr')
        for row in rows:
            cols = row.find_all('td')
            if len(cols) > 1:
                talent = {
                    "name": cols[0].text.strip(),
                    "lv1": cols[1].text.strip() if len(cols) > 1 else "",
                    "lv2": cols[2].text.strip() if len(cols) > 2 else "",
                    "lv3": cols[3].text.strip() if len(cols) > 3 else "",
                    "lv4": cols[4].text.strip() if len(cols) > 4 else "",
                    "lv5": cols[5].text.strip() if len(cols) > 5 else "",
                    "lv6": cols[6].text.strip() if len(cols) > 6 else "",
                    "lv7": cols[7].text.strip() if len(cols) > 7 else "",
                    "lv8": cols[8].text.strip() if len(cols) > 8 else "",
                    "lv9": cols[9].text.strip() if len(cols) > 9 else "",
                    "lv10": cols[10].text.strip() if len(cols) > 10 else "",
                    "lv11": cols[11].text.strip() if len(cols) > 11 else "",
                    "lv12": cols[12].text.strip() if len(cols) > 12 else "",
                    "lv13": cols[13].text.strip() if len(cols) > 13 else ""
                }
                talent_data["burst"].append(talent)

    return json.dumps(talent_data, indent=4)

