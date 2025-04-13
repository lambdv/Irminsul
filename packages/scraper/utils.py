import requests
from bs4 import BeautifulSoup as soup
import json
import os
from datetime import datetime, timezone
import time
import time as timer

def toKey(name):
    return name.lower().replace(" ", "-").replace("'", "").replace(".", "").replace("_", "-").replace("\"", "").replace("(", "").replace(")", "").replace("'", "").replace("'", "")

def saveHTML(filename, html):
    with open(f"{filename}.html", "w", encoding="utf-8") as file:
        file.write(html)

def printSoup(soup):
    print(soup.prettify())


def saveJSON(data, path, override=False):
    key = data["key"]
    file_path = f"{path}/{key}.json"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(file_path) and not override:
        return
    
    # merge by default rather than replace old data if it exists
    baseJSON = {}
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            baseJSON = json.load(file)

    with open(file_path, "w", encoding="utf-8") as file:
        productJSON = {**baseJSON, **data}
        json.dump(productJSON, file, indent=4)

def readJSON(key, path):
    file_path = f"{path}/{key}.json"
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"No such file: '{file_path}'")
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)
    

def saveIMGS(name, imgOBJ, path, override=False):
    key = toKey(name)
    # Create the character/weapon/artifact directory
    character_dir = f"{path}/{key}"
    if not os.path.exists(character_dir):
        os.makedirs(character_dir)
    
    # Save each image in the character directory
    for img_type, URL in imgOBJ.items():
        if not URL:  # Skip empty URLs
            continue
            
        file_path = f"{character_dir}/{img_type}.png"
        if not os.path.exists(file_path) or override:
            try:
                response = requests.get(URL)
                response.raise_for_status()  # Raise an exception for bad status codes
                with open(file_path, "wb") as f:
                    f.write(response.content)
            except Exception as e:
                print(f"Error saving {img_type} image for {name}: {str(e)}")

