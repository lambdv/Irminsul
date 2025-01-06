import requests
from bs4 import BeautifulSoup as soup
import json
import os
# from selenium import webdriver
# from selenium.webdriver.chrome.service import Service
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from webdriver_manager.chrome import ChromeDriverManager

# https://proxyscrape.com/free-proxy-list

ip = "63.143.57.116"
port = "80"

proxies = {"http": "http://" + ip + ":" + port}

def getCharacterNameArray(leaked=False):
    url = "https://genshin.jmp.blue/characters"
    characterNames = []
    page = requests.get(url)
    page.raise_for_status()
    json_data = page.json()
    for character in json_data:
        characterNames.append(character.lower().replace(" ", "-"))
    return characterNames

def gdevScraper():
    url = "https://genshin.jmp.blue/characters"
    res = []
    for characterName in getCharacterNameArray():
        characterPage = requests.get(url + "/" + characterName, proxies=proxies)
        characterPage.raise_for_status()
        characterJson = {
            "url": characterName,
            "name": characterPage.json()["name"],
            "description": characterPage.json()["description"],
            "rarity": characterPage.json()["rarity"],
            "element": characterPage.json()["vision"],
            "weapon": characterPage.json()["weapon"],
            "nation": characterPage.json()["nation"],
        }
        print(characterJson)
        res.append(characterJson)
    return res

def scrapeAmbrCharacterURLS():
    # get the static page ambrcharacters.html from file system 
    page = open("ambrcharacters.html", "r")
    # in the div, there are a tags, for each a tag, get the href attribute and store it in the array
    page_soup = soup(page, "html.parser")
    characterURLs = []
    for a in page_soup.find_all("a"):
        characterURLs.append(a["href"])
    
    print(characterURLs)


def saveJsonArrayToFile(jsonArray, directory="", filename="", sameFile=True):
    if sameFile:
        with open(directory + filename, "w") as file:
            json.dump(jsonArray, file, indent=4)
    else:
        for item in jsonArray:
            with open(directory + item["name"] + ".json", "w") as file:
                json.dump(item, file, indent=4)

# chars = gdevScraper()
# saveJsonArrayToFile(jsonArray=chars, directory="", filename="characters.json")
scrapeAmbrCharacterURLS()
