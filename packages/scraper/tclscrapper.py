import requests
from bs4 import BeautifulSoup
import json
import utils
import wikiscrapper as wiki

# Global icon mapping
ICON_MAPPING = {
    "skill_1.png": "skill",
    "skill_2.png": "skill2", 
    "ult.png": "burst",
    "passive_0.png": "a1",
    "passive_1.png": "a4",
    "passive_2.png": "passive",
    "passive_3.png": "p3",
    "const_0.png": "c1",
    "const_1.png": "c2", 
    "const_2.png": "c3",
    "const_3.png": "c4",
    "const_4.png": "c5",
    "const_5.png": "c6",
    "polearm.png": "polearm",
    "bow.png": "bow",
    "claymore.png": "claymore", 
    "sword.png": "sword",
    "catalyst.png": "catalyst",
}

def parseCharacterIcons(soup):
    urls = []
    base_url = "https://library.keqingmains.com"
    
    #find all image tags with class "char-skill-icon" and get the src
    for img in soup.find_all("img", {"class": "char-skill-icon"}):
        url = img["src"]
        # Handle relative URLs by adding base URL
        if url.startswith('/'):
            url = base_url + url
        elif not url.startswith(('http://', 'https://')):
            url = base_url + '/' + url
        urls.append(url)
    
    if len(urls) == 0:
        return {}

    #convert array into json map where keys are the name of the icon and values are the url
    json_map = {}
    for url in urls:
        icon_name = url.split("/")[-1]
        json_map[icon_name] = url

    # Create new map with converted keys and cleaned URLs
    new_map = {}
    for key, url in json_map.items():
        # Remove .png from key before lookup
        base_key = key.replace(".png", "")
        if base_key + ".png" in ICON_MAPPING:
            new_key = ICON_MAPPING[base_key + ".png"]
            new_map[new_key] = url
        else:
            # For any keys not in the mapping, clean and keep as-is
            clean_key = key.replace(".png", "").lower().replace(" ", "_")
            new_map[clean_key] = url

    return new_map

#turn urls into a json map where keys are the name of the icon and values are the url

def parseCharacterDescription(soup):
    #get firrst blockquote
    blockquote = soup.find("blockquote")
    if blockquote is None:
        return ""
    return blockquote.text


def scrapeCharacter(name, vision=""):
    url = "https://library.keqingmains.com/characters/" + vision.lower() + "/" + name.lower().replace(" ", "-")
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    return soup




def syncCharacterIcons(name = None, element = None):
    characterNames = []
    characterOBJs = []

    if name is None:
        characterNames, characterOBJs = wiki.getCharacterList()
    else:
        characterNames = [name]
        characterOBJs = [{
            "name": name,
            "vision": element
        }]

    for name in characterNames:
        if name == "Traveler":
            continue
        
        obj = characterOBJs[characterNames.index(name)]
        element = obj["vision"]
        print("loading: " + name + " " + element)

        try:
            s = scrapeCharacter(name, element)
            iconOBJ = parseCharacterIcons(s)

            
            #remove the key that is a weapon (polearm, bow, claymore, sword, catalyst)
            weapon_types = ["polearm", "bow", "claymore", "sword", "catalyst"]
            iconOBJ = {k: v for k, v in iconOBJ.items() if k not in weapon_types}

            #get all keys in the iconOBJ that are not in the ICON_MAPPING
            routeKeys = [k for k in iconOBJ.keys() if k not in ICON_MAPPING.values()]
            #  print(routeKeys)

            # route keys not in ICON_MAPPING to passive
            unknownKeys = []
            for key in routeKeys:
                if key not in ICON_MAPPING:
                    unknownKeys.append(key)

            print(unknownKeys)

            if len(unknownKeys) == 1:
                iconOBJ["passive"] = iconOBJ[unknownKeys[0]]
                del iconOBJ[unknownKeys[0]]

            print(json.dumps(iconOBJ, indent=4))
            utils.saveIMGS(name, iconOBJ, "../genshindata/public/assets/characters", override=True)
            print(f"Saved icons")
        except Exception as e:
            print(f"Error processing {name}: {str(e)}")
            continue
