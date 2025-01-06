import requests
from bs4 import BeautifulSoup as soup
import json
import os
from datetime import datetime, timezone
import time
import html2text
import time as timer

def toKey(name):
    return name.lower().replace(" ", "-").replace("'", "").replace(".", "").replace("_", "-").replace("\"", "").replace("(", "").replace(")", "")

def characterDBSync():
    characterNames = getCharacterList()
    for name in characterNames:
        if(name == "Traveler"):
            continue
        key = toKey(name)
        if not os.path.exists(f"data/characters/{key}.json"):
            characterJSON = scrapeCharacter(name)
            saveJSON(characterJSON, "data/characters")
            print(f"Saved {name}.json")
            #timer.sleep(1)
        if not os.path.exists(f"assets/characters/{key}/"):
            imgOBJ = scrapeCharacterAssets(name)
            saveIMGS(name, imgOBJ, "assets/characters", override=False)
            print(f"Saved {name} assets")

def weaponDBSync():
    weaponNames = getWeaponList()
    for name in weaponNames:
        key = toKey(name)
        if not os.path.exists(f"data/weapons/{key}.json"): 
            print(f"ripping {name}")
            weaponJSON = None
            weaponJSON = scrapeWeapon(name)
            saveJSON(weaponJSON, "data/weapons")
            print(f"Saved {name}.json")
            #timer.sleep(1)
        if not os.path.exists(f"assets/weapons/{key}/"):
            print(f"ripping {name} assets")
            imgOBJ = scrapeWeaponAssets(name)
            saveIMGS(name, imgOBJ, "assets/weapons", override=True)
            print

def artifactDBSync():
    artNames, artOBJs = getArtifactList()
    for i in range(len(artNames)):
        name = artNames[i]
        obj = artOBJs[i]
        key = toKey(name)
        #if not os.path.exists(f"data/artifacts/{key}.json"):
        print(f"saving {name}...")
        artifactJSON = scrapeArtifact(name, obj)
        saveJSON(artifactJSON, "data/artifacts", override=True)
        print(f"Saved {name}.json")
            #timer.sleep(1)
        # if not os.path.exists(f"assets/artifacts/{key}/"):
        #     print(f"saving {name} assets...")
        #     imgOBJ = scrapeArtifactAssets(name)
        #     saveIMGS(name, imgOBJ, "assets/artifacts", override=False)
        #     print(f"Saved {name} assets")

"""
character scraping
"""

def saveHTML(filename, html):
    with open(f"{filename}.html", "w", encoding="utf-8") as file:
        file.write(html)

def printSoup(soup):
    print(soup.prettify())



def parseStatTable(page_soup):
    table_soup = page_soup.find("table", {"class": "ascension-stats"}) # get ascension table
    tbody = table_soup.find("tbody") # get tbody
    trs = tbody.find_all("tr") # get all trs
    header = trs.pop(0) #remove the first tr
    # filter out any trs that have the id "mw-customcollapsible-toggle-ascension"
    cost_trs = [tr for tr in trs if tr.get("id") == "mw-customcollapsible-toggle-ascension"]
    trs = [tr for tr in trs if tr.get("id") != "mw-customcollapsible-toggle-ascension"]

    # get the last th from the header and get text from spand -> b -> a tag and store it
    specialStat = header.find_all("th")[-1].find("span").find("b").find("a").text
    # make a dictionary called characterStats
    stats = { 
        "LVL": [],
        "BaseHP": [],
        "BaseATK": [],
        "BaseDEF": [],
        "AscensionStatType": specialStat,
        "AscensionStatValue": [],
        "AscensionPhase": [],
        "AscentionCost": []
    }
    prevAscensionPhase = 0
    prevSpecialStatAmount = 0
    for tr in trs:
        tds = tr.find_all("td")
        if len(tds) == 4:
            stats["AscensionStatValue"].append(prevSpecialStatAmount)
            stats["AscensionPhase"].append(prevAscensionPhase)
            stats["LVL"].append(tds[0].text)
            stats["BaseHP"].append(tds[1].text.replace(",", ""))
            stats["BaseATK"].append(tds[2].text)
            stats["BaseDEF"].append(tds[3].text)
            
        elif len(tds) == 6:
            prevAscensionPhase = int(''.join(filter(str.isdigit, tds[0].text)))
            prevSpecialStatAmount = tds[5].text if "%" in tds[5].text else "0%"
            stats["AscensionPhase"].append(prevAscensionPhase)
            stats["LVL"].append(tds[1].text)
            stats["BaseHP"].append(tds[2].text.replace(",", ""))
            stats["BaseATK"].append(tds[3].text)
            stats["BaseDEF"].append(tds[4].text)
            stats["AscensionStatValue"].append(prevSpecialStatAmount)
    
    prevAscensionPhase = 0 
    for tr in cost_trs:
        td = tr.find("td", recursive=False)

        # each matiral is represented by a div
        # each div has 2 spands, first with class "card-caption" for the name of the material and the second with class "card-content" for the amount
        # for the first span, get the most inner item (should be an image) and get the alt value (name of the material) and store it as name
        # for the second span, get the text and store it as amount while stripping the quotes
        materials = []
        for div in td.find_all("div", recursive=False):
            spans = div.find_all("span", recursive=False)
            if len(spans) != 2:
                print("Error: unexpected number of spans in div")
                return
            name = spans[0].find("a").find("img")["alt"]
            amount = ''.join(filter(str.isdigit, spans[1].text))
            materials.append({
                "name": name,
                "amount": amount
            })
        cost = {
            "AscensionPhase": prevAscensionPhase,
            "materials": materials
        }
        stats["AscentionCost"].append(cost)
        prevAscensionPhase += 1
    
    return stats

def parseStatTable2(page_soup):
    table_soup = page_soup.find("table", {"class": "ascension-stats"}) # get ascension table
    tbody = table_soup.find("tbody") # get tbody
    trs = tbody.find_all("tr") # get all trs
    header = trs.pop(0) #remove the first tr
    # filter out any trs that have the id "mw-customcollapsible-toggle-ascension"
    cost_trs = [tr for tr in trs if tr.get("id") == "mw-customcollapsible-toggle-ascension"]
    trs = [tr for tr in trs if tr.get("id") != "mw-customcollapsible-toggle-ascension"]

    # get the last th from the header and get text from spand -> b -> a tag and store it
    specialStat = header.find_all("th")[-1].find("span").find("b").find("a").text
    # make a dictionary called characterStats
    stats = []
    prevAscensionPhase = 0
    prevSpecialStatAmount = 0
    for tr in trs:
        tds = tr.find_all("td")
        if len(tds) == 4:
            stats.append({
                "LVL": tds[0].text,
                "BaseHP": tds[1].text.replace(",", ""),
                "BaseATK": tds[2].text,
                "BaseDEF": tds[3].text,
                "AscensionStatType": specialStat,
                "AscensionStatValue": prevSpecialStatAmount,
                "AscensionPhase": prevAscensionPhase,
            })

            
        elif len(tds) == 6:
            prevAscensionPhase = int(''.join(filter(str.isdigit, tds[0].text)))
            prevSpecialStatAmount = tds[5].text if "%" in tds[5].text else "0%"

            stats.append({
                "LVL": tds[1].text,
                "BaseHP": tds[2].text.replace(",", ""),
                "BaseATK": tds[3].text,
                "BaseDEF": tds[4].text,
                "AscensionStatType": specialStat,
                "AscensionStatValue": prevSpecialStatAmount,
                "AscensionPhase": prevAscensionPhase,
            })
    
    prevAscensionPhase = 0
    costs = []
    for tr in cost_trs:
        td = tr.find("td", recursive=False)

        # each matiral is represented by a div
        # each div has 2 spands, first with class "card-caption" for the name of the material and the second with class "card-content" for the amount
        # for the first span, get the most inner item (should be an image) and get the alt value (name of the material) and store it as name
        # for the second span, get the text and store it as amount while stripping the quotes
        materials = []
        for div in td.find_all("div", recursive=False):
            spans = div.find_all("span", recursive=False)
            if len(spans) != 2:
                print("Error: unexpected number of spans in div")
                return
            name = spans[0].find("a").find("img")["alt"]
            amount = ''.join(filter(str.isdigit, spans[1].text))
            materials.append({
                "name": name,
                "amount": amount
            })
        cost = {
            "AscensionPhase": prevAscensionPhase,
            "materials": materials
        }
        costs.append(cost)
        prevAscensionPhase += 1
    
    return stats, costs


def parseTalents(page_soup):
    talent_container_soup = page_soup.find_all("div", {"class": "talent-table-container"})
    # print(talent_container_soup)
    jumps_soup = page_soup.find_all("div", {"class": "talent-table-toc"})
    # print(jumps_soup)
    jumps = []
    #for each span in the div, get the a tag and get the text from it and store it in the jumps array
    for span in jumps_soup[0].find_all("span"):
        jumps.append(span.find("a").text)
    # print(jumps)
    talent_table_soup = page_soup.find_all("table", {"class": "talent-table"})
    talent_table_soup = talent_table_soup[0].find("tbody")
    talent_table_soup = talent_table_soup.find_all("tr", recursive=False)
    talent_table_soup.pop(0) # remove the first tr (header)
    if(len(talent_table_soup) % 2 != 0): #number of trs in the talent table should be even (title and body pairs)
        print("Error: Talent table is not even")
        return
    skill_talents = []
    passive_talents = []
    for i in range(len(talent_table_soup)//2):
        talent_tr_header = talent_table_soup[i*2]
        talent_tr_body = talent_table_soup[(i*2)+1]
        talent = parseTalentAux(talent_tr_header, talent_tr_body)
        if talent["type"] == "Utility Passive" or talent["type"] == "1st Ascension Passive" or talent["type"] == "4th Ascension Passive":
            passive_talents.append(talent)
        else:
            skill_talents.append(talent)
    return skill_talents, passive_talents


def parseTalentAux(talent_tr_header, talent_tr_body):
    JSON = {}
    # parse the header to get the talent name and type
    talent_name = talent_tr_header.find_all("td")[1].text #get second td
    talent_type = talent_tr_header.find_all("td")[2].text
    JSON["name"] = talent_name
    JSON["type"] = talent_type

    # get the td inside the body tr
    td_body = talent_tr_body.find_all("td")[0]

    # if there isn't a div inside the td, then it's a passive talent
    if not td_body.find("div"):
        JSON["description"] = td_body.text
        return JSON

    # if there is 1 div with class wds-tabber, then it's a talent with nexted tabs to be parsed
    elif len(td_body.find_all("div", recursive=False)) == 1:
        body = td_body.find("div", {"class": "wds-tabber"})
        tab_header_ul = body.find("ul")
        tab_header_ul = [li.text for li in tab_header_ul.find_all("li")] # reduce the ul to just a list of the li's text

        # map the divs in body with class wds-tab__content and map them to their text (in order) as key value pairs
        tab_content_divs = body.find_all("div", {"class": "wds-tab__content"})
        tab_content = {}
        for i in range(len(tab_content_divs)):
            tab_content[tab_header_ul[i]] = tab_content_divs[i]

        
        if tab_content.get("Description"):
            JSON["description"] = parseTalentDescription(tab_content["Description"])
        if tab_content.get("Attribute Scaling"):
            JSON["attributes"] = parseTalentAttributes(tab_content["Attribute Scaling"])
            # print(json.dumps(JSON["attributes"], indent=4))
        if tab_content.get("Advanced Properties"):
            JSON["properties"] = parseTalentProperties(tab_content["Advanced Properties"])
            # print(json.dumps(JSON["properties"], indent=4))
        
        # print(json.dumps(JSON, indent=4))

        return JSON
        
    raise Exception("while parsing talent, unexpected div structure: expected 0 or 1 div with class wds-tabber but found " + str(len(td_body.find_all("div", recursive=False))))

def parseTalentDescription(description_soup, prevStr=""):
    descriptionString = prevStr

    for tag in description_soup.children:
        if tag.name == "p":
            for child in tag.children:
                if child.name == "br":
                    descriptionString += "\n"
                elif child.name == "a":
                    descriptionString += child.text
                elif child.name == "b":
                    descriptionString += child.text
                else:
                    descriptionString += child.string if child.string else ""
            descriptionString += "\n"
        elif tag.name == "ul":
            for li in tag.find_all("li"):
                descriptionString += "- " + li.text + "\n"
        elif tag.name == "div":
            descriptionString += parseTalentDescription(tag, "")
        elif tag.name == "br":
            descriptionString += "\n"
        elif tag.name == "b":
            descriptionString += "**" + tag.text + "**\n"
        elif tag.name == "a":
            descriptionString += tag.text
        elif tag.string and not tag.name:
            descriptionString += tag.string
        # remove any number of new lines back to back
        while "\n\n" in descriptionString:
            descriptionString = descriptionString.replace("\n\n", "\n")

    return descriptionString.strip("\n")

def parseTalentAttributes(attributes_soup):
    attributes = []
    table = attributes_soup.find('table', class_='wikitable')
    rows = table.find_all('tr')

    for row in rows[1:]:  # Skip the header row
        cells = row.find_all('td')
        if len(cells) <= 1:  # Skip rows with only 1 td
            continue
        hit_type = row.find('th').text.strip().replace('\u00a0', ' ')
        values = []
        if cells:
            for cell in cells:
                try:
                    values.append(float(cell.text.strip().replace(',', '')))
                except ValueError:
                    values.append(cell.text.strip())  # Include non-numeric values as strings
        else:
            # Handle rows with colspan
            cell = row.find('td')
            if cell and cell.has_attr('colspan'):
                colspan = int(cell['colspan'])
                value = cell.text.strip()
                values = [value] * colspan

        if len(values) == 1:
            attributes.append({
                "hit": hit_type,
                "value": values[0]
            })
        else:
            attributes.append({
                "hit": hit_type,
                "values": values
            })

    return attributes

def parseTalentProperties(properties_soup):
    return []

def parseConstellations(page_soup):
    #get div wit class "constellation-table-container"
    container_soup = page_soup.find("div", {"class": "constellation-table-container"})
    #printSoup(container_soup)
    tbody_soup = container_soup.find("tbody")
    #printSoup(tbody_soup)
    trs = tbody_soup.find_all("tr", recursive=False)
    #skip first tr (header) 
    trs.pop(0)
    constellations = []
    for i in range(len(trs)//2):
        header = trs[i*2]
        body = trs[(i*2)+1]

        constellation_name = header.find_all("td")[1].find("a").text
        
        body_td = body.find_all("td")[0]

        constellation_description = ""

        if(body_td.find("div", {"class": "wds-tabber"})):
            wds_tabber = body_td.find("div", {"class": "wds-tabber"})
            jumps_soup = wds_tabber.find("ul")
            jumps = []
            for li in jumps_soup.find_all("li"):
                jumps.append(li.find("div").text)
            #index of decsription tab
            description_index = jumps.index("Description")
            #get that tab's div in the wds_tabber

            description_div = wds_tabber.find_all("div", {"class": "wds-tab__content"})[description_index]
            constellation_description = parseTalentDescription(description_div)
        else:
            constellation_description = parseTalentDescription(body_td)        

        #reduce header and body tr into an object/dictionary
        constellation = {
            "level": i+1, 
            "name": constellation_name,
            "description": constellation_description,
            "properties": []
        }
        constellations.append(constellation)
    # print(json.dumps(constellations, indent=4))
    return constellations


def parseDetails(page_soup):
    # Find name from h2 with "pi-title" class
    name = page_soup.find("h2", {"class": "pi-title"}).text.strip()

    # Find title from h2 with data-item-name "secondary_title"
    title = page_soup.find("h2", {"data-item-name": "secondary_title"}).text.strip()

    # Find rarity from td with data-source "quality" and get the image's alt value
    rarity = int(page_soup.find("td", {"data-source": "quality"}).find("img")["alt"].replace(" Stars", ""))

    # Find element from div with data-source "element"
    try:
        element = page_soup.find("td", {"data-source": "element"}).find("a").find("img")["alt"].replace("Element ", "").lower()
    except AttributeError:
        element = "none"

    # Find weapon from td with data-source "weapon"
    #get the second a tag in the td and get the text from it
    weapon = page_soup.find("td", {"data-source": "weapon"}).find_all("a")[1].text.lower()

    #get div with data-source "releaseDate" and get the div with pi-data-value init and then get the text from it
    #only get the first text before the br
    release_date = page_soup.find("div", {"data-source": "releaseDate"}).find("div", {"class": "pi-data-value"})
    # parse the soup  token by token until <br> is found
    release_date = parseTalentDescription(release_date)
    release_date = release_date.split("\n")[0].lower()

    #convert and store release date as 64 bit epoch time

    release_date_dt = datetime.strptime(release_date, "%B %d, %Y")
    release_date_dt = release_date_dt.replace(tzinfo=timezone.utc) # add timezone info
    release_date_epoch = int(release_date_dt.timestamp())


    # Find constellation from div with data-source "constellation", get the div inside of it then get the a and the text from it
    constellation = page_soup.find("div", {"data-source": "constellation"}).find("div", {"class": "pi-data-value"}).find("a").text.lower()


    #find region from 
    # <div class="pi-item pi-data pi-item-spacing pi-border-color" data-source="region">
    #         <h3 class="pi-data-label pi-secondary-font">Region</h3>
    #     <div class="pi-data-value pi-font"><a href="/wiki/Mondstadt" title="Mondstadt">Mondstadt</a></div>
    # </div>
    try:
        region = page_soup.find("div", {"data-source": "region"}).find("div", {"class": "pi-data-value"}).find("a").text.lower()
    except AttributeError:
        region = "none"

    # find affiliation from
    # <div class="pi-item pi-data pi-item-spacing pi-border-color" data-source="affiliation">
    #         <h3 class="pi-data-label pi-secondary-font">Affil­i­a­tion</h3>
    #     <div class="pi-data-value pi-font"><a href="/wiki/Knights_of_Favonius" title="Knights of Favonius">Knights of Favonius</a></div>
    # </div>

    affiliation = page_soup.find("div", {"data-source": "affiliation"}).find("div", {"class": "pi-data-value"}).text.lower()

    #find birthday from
    # <div class="pi-item pi-data pi-item-spacing pi-border-color" data-source="birthday">
    # 	    <h3 class="pi-data-label pi-secondary-font"><a href="/wiki/Birthday" title="Birthday">Birthday</a></h3>
    # 	    <div class="pi-data-value pi-font"><a href="/wiki/Birthday/Amber" title="Birthday/Amber">August 10th</a></div>
    # </div>

    birthday = page_soup.find("div", {"data-source": "birthday"}).find("div", {"class": "pi-data-value"}).find("a").text.lower()

    #find special dish from
    # <div class="pi-item pi-data pi-item-spacing pi-border-color" data-source="dish">
    #   <h3 class="pi-data-label pi-secondary-font"><a href="/wiki/Food#List_of_Special_Dishes" title="Food">Special Dish</a></h3>
    # 	<div class="pi-data-value pi-font"><span class="item"><span class="item-image"><span class="hidden" data-size="20" style="height:20px;width:20px"><a href="/wiki/Outrider%27s_Champion_Steak!" title="Outrider's Champion Steak!"><img alt="Outrider's Champion Steak!" src="https://static.wikia.nocookie.net/gensin-impact/images/9/95/Item_Outrider%27s_Champion_Steak%21.png/revision/latest/scale-to-width-down/20?cb=20201210061922" decoding="async" loading="lazy" width="20" height="20" data-image-name="Item Outrider's Champion Steak!.png" data-image-key="Item_Outrider%27s_Champion_Steak%21.png" data-relevant="1" data-src="https://static.wikia.nocookie.net/gensin-impact/images/9/95/Item_Outrider%27s_Champion_Steak%21.png/revision/latest/scale-to-width-down/20?cb=20201210061922" class=" lazyloaded"></a></span><span class="mobile-only"><a href="/wiki/Outrider%27s_Champion_Steak!" title="Outrider's Champion Steak!"><img alt="Outrider's Champion Steak!" src="data:image/gif;base64,R0lGODlhAQABAIABAAAAAP///yH5BAEAAAEALAAAAAABAAEAQAICTAEAOw%3D%3D" decoding="async" loading="lazy" width="30" height="30" data-image-name="Item Outrider's Champion Steak!.png" data-image-key="Item_Outrider%27s_Champion_Steak%21.png" data-relevant="1" data-src="https://static.wikia.nocookie.net/gensin-impact/images/9/95/Item_Outrider%27s_Champion_Steak%21.png/revision/latest/scale-to-width-down/30?cb=20201210061922" class="lazyload"></a></span></span><span class="item-text"> <a href="/wiki/Outrider%27s_Champion_Steak!" title="Outrider's Champion Steak!">Outrider's Champion Steak!</a></span></span></div>
    # </div>

    try:
        special_dish = page_soup.find("div", {"data-source": "dish"}).find("div", {"class": "pi-data-value"}).find("span", {"class": "item-text"}).find("a").text.lower()
    except AttributeError:
        special_dish = "none"


    #find alternate titles from...

    alternate_titles = page_soup.find("div", {"data-source": "title2"}).find("div", {"class": "pi-data-value"}).find("ul").find("li").text.lower()


    #find description from div class "mw-parser-output" and get the 4th p tag
    # description = parseTalentDescription(page_soup.find("div", {"class": "mw-parser-output"}).find_all("p")[2])
    description = ""

    details = {
        "name": name,
        "key": toKey(name),
        "title": title,
        "rarity": rarity,
        "element": element,
        "weapon": weapon,
        "release_date": release_date,
        "release_date_epoch": release_date_epoch,
        "constellation": constellation,
        "birthday": birthday,
        "affiliation": affiliation,
        "region": region,
        "special_dish": special_dish,
        "alternate_title": alternate_titles,
        "description": description
    }

    return details


def scrapeCharacter(name):
    url = "https://genshin-impact.fandom.com/wiki/" + name
    page = requests.get(url)
    page_soup = soup(page.content, "html.parser")


    details = parseDetails(page_soup)
    stat_table, costs = parseStatTable2(page_soup)
    talents, passives = parseTalents(page_soup)
    constellations = parseConstellations(page_soup)

    character = {
        **details,
        "ascension_stat": stat_table[0]["AscensionStatType"],
        "base_stats": stat_table,
        "ascension_costs": costs,
        "talents": talents,
        "passives": passives,
        "constellations": constellations,
    }

    # print(json.dumps(character, indent=4))
    return character

def scrapeCharacterAssets(name):
    url = "https://genshin-impact.fandom.com/wiki/" + name
    page = requests.get(url)
    page_soup = soup(page.content, "html.parser")

    #get img with alt "Wish"
    wish_img = page_soup.find("img", {"alt": "Wish"})["src"]
    wish_img = getHighResImage(wish_img)

    url = "https://genshin-impact.fandom.com/wiki/" + name + "/Gallery"
    page = requests.get(url)
    page_soup = soup(page.content, "html.parser")

    #get image with alt "Character Icon"
    icon_img = page_soup.find("img", {"alt": "Character Icon"})["src"]
    icon_img = getHighResImage(icon_img)

    #get image with title that includes Namecard and get the src
    namecard_img = page_soup.find("img", {"title": lambda x: x and "Namecard" in x})["src"]
    namecard_img = getHighResImage(namecard_img)
    
    imgOBJ = {
        "splash": wish_img,
        "avatar": icon_img,
        "namecard": namecard_img
    }
    #print(imgOBJ)

    return imgOBJ

def getCharacterList():
    url = "https://genshin-impact.fandom.com/wiki/Character/List"
    page = requests.get(url)
    page_soup = soup(page.content, "html.parser")

    mw_parser_output = page_soup.find("div", {"class": "mw-parser-output"})

    #get first table
    table = mw_parser_output.find("table")
    tbody = table.find("tbody")
    trs = tbody.find_all("tr")
    trs.pop(0) #remove the header
    names = []
    characterOBJs = []
    for tr in trs:
        tds = tr.find_all("td")
        name = tds[1].find("a").text

        names.append(name)
        # characterOBJs.append({
        #     "name": name,
        #     "key": name.lower().replace(" ", "-"),
        #     "rarity": int(tr.find_all("td")[2].find("img")["alt"].replace(" Stars", "")),
        #     "model": tds[6].text.strip(),
        #     "release_version": tds[8].text.strip()

        # })
    return names

def scrapeCharacters(names=None):
    if names is None:
        names, _ = getCharacterList()
    characters = []
    for name in names:
        characters.append(scrapeCharacter(name))
        # delay
        time.sleep(2)
    return characters

def saveJSON(data, path, override=False):
    key = data["key"]
    file_path = f"{path}/{key}.json"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not override and os.path.exists(file_path):
        return

    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4)

def readJSON(key, path):
    file_path = f"{path}/{key}.json"
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"No such file: '{file_path}'")
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)

def saveIMGS(name, assetOBJ, path, override=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    flatName = toKey(name)
    #name folder in path named key
    os.makedirs(f"{path}/{flatName}", exist_ok=True)
    for fileName, URL in assetOBJ.items():
        #if the image already exists, skip it
        if not override and os.path.exists(f"{path}/{flatName}/{flatName}_{fileName}.png"):
            continue
        response = requests.get(URL)
        with open(f"{path}/{flatName}/{flatName}_{fileName}.png", "wb") as file:
            file.write(response.content)



def getWeaponList():
    url = "https://genshin-impact.fandom.com/wiki/Weapons/List"
    page = requests.get(url)
    page_soup = soup(page.content, "html.parser")

    mw_parser_output = page_soup.find("div", {"class": "mw-parser-output"})

    #get first table
    table = mw_parser_output.find("table")
    tbody = table.find("tbody")
    trs = tbody.find_all("tr")
    trs.pop(0) #remove the header
    names = []
    for tr in trs:
        tds = tr.find_all("td")
        name = tds[1].find("a").text

        names.append(name)
    return names


"""
weapon scraping
"""

def parseWeaponDetails(page_soup):

    #get aside with class "portable-infobox pi-background pi-europa pi-theme-character pi-layout-default" and role "region"
    aside = page_soup.find("aside", {"class": "portable-infobox"})

    #from aside get h2 with data-source "title" and get the text from it without html codes such as &shy "�"'
    name = aside.find("h2", {"data-source": "title"}).text
    name = ''.join(e for e in name if e.isalnum() or e.isspace() or e == "-")

    # get div (class "description-wrapper") and get the div (class "description-content") and parse the soup with parseTalentDescription
    description_wrapper = page_soup.find("div", {"class": "description-wrapper"}).find("div", {"class": "description-content"})
    description = parseTalentDescription(description_wrapper)

    detail_section_1_divs = aside.find("section").find("section").find_all("div", recursive=False)[1].find_all("div", recursive=False)

    category = detail_section_1_divs[0].find("div").text.strip().lower()
    rarity_text = detail_section_1_divs[1].find("div").find("img")["alt"]
    rarity = int(''.join(filter(str.isdigit, rarity_text)))  # Extract only digits
    
    series = detail_section_1_divs[2].find("div").find("a").text.strip().lower()

    how_to_get = []
    how_to_get_div = detail_section_1_divs[3].find("div", recursive=False)
    #for each section split by <hr> , get that section of html and parse it as a string using parseTalentDescription
    # <div class="pi-data-value pi-font"><a href="/wiki/Chests" class="mw-redirect" title="Chests">Chests</a><hr><a href="/wiki/Investigation" title="Investigation">Investigation</a><hr>Sold by <a href="/wiki/Schulz" title="Schulz">Schulz</a><hr>Comes bundled with new <a href="/wiki/Bow" title="Bow">bow</a> characters</div>


    release_date = page_soup.find("div", {"data-source": "releaseDate"}).find("div", {"class": "pi-data-value"})
    # parse the soup  token by token until <br> is found
    release_date = parseTalentDescription(release_date)
    release_date = release_date.split("\n")[0].lower()

    release_date_epoch = 0
    release_date_epoch = datetime.strptime(release_date, "%B %d, %Y").timestamp()

    base_atk_min = 0
    base_atk_max = 0
    sub_stat_type = "none"
    sub_stat_value_min = 0
    sub_stat_value_max = 0


    detail_section_2 = aside.find_all("section", recursive=False)[1].find("section").find_all("section", recursive=False)[1].find_all("div", recursive=False)
    
    base_atk_range = detail_section_2[0].text.strip().lower()
    base_atk_min = int(base_atk_range.split("-")[0])
    base_atk_max = int(base_atk_range.split("-")[1])

    if(len(detail_section_2) == 3):
        sub_stat_type = detail_section_2[1].text.strip().lower()
        sub_stat_value_min = detail_section_2[2].text.strip().lower().split("-")[0].replace(" ", "")
        sub_stat_value_max = detail_section_2[2].text.strip().lower().split("-")[1].replace(" ", "")

    
    refinements = []
    refinement_name = ""


    #get third section from aside
    detail_section_3 = aside.find_all("section", recursive=False)[2]
    # if details section 3 doesn't have a section tag, then it is empty
    if detail_section_3.find("section") is None:
        refinements = []
    else:
        detail_section_3 = detail_section_3.find("section").find_all("div", recursive=False)
        #skip first div
        detail_section_3.pop(0)
        for div in detail_section_3:
            refine_section = div.find("section", recursive=False)
            refine_table = refine_section.find("table", recursive=False)
            refine_thead = refine_table.find("thead", recursive=False)
            refine_tbody = refine_table.find("tbody", recursive=False)
            refinement_name = ''.join(c for c in refine_thead.text.lower() if c.isalnum() or c in '-_')
            refinement_description_soup = refine_tbody.find("tr").find("td")
            refinement_description = parseTalentDescription(refinement_description_soup)

            refinements.append(refinement_description)
            
    

    details = {
        "name": name,
        "key": toKey(name),
        "description": description,
        "rarity": rarity,
        "category": category,
        "series": series,
        "release_date": release_date,
        "release_date_epoch": release_date_epoch,
        # "how_to_get": how_to_get,
        "base_atk_min": base_atk_min,
        "base_atk_max": base_atk_max,
        "sub_stat_type": sub_stat_type,
        "sub_stat_value_min": sub_stat_value_min,
        "sub_stat_value_max": sub_stat_value_max,
        "refinement_name": refinement_name,
        "refinements": refinements
    }

    #print(json.dumps(details, indent=4))

    return details

def parseWeaponStatTable(page_soup, substat_type=None):

    stat_table_soup = page_soup.find("table", {"class": "ascension-stats"})
    tbody = stat_table_soup.find("tbody")

    trs = tbody.find_all("tr")
    trs.pop(0) #remove the header

    #filter out tr with ascension 
    value_trs = [tr for tr in trs if "ascension" not in tr.get("class", [])]

    stats_table = []

    prev_ascension_phase = 0

    for tr in value_trs:
        tds = tr.find_all("td")
        
        if(substat_type is None or substat_type == "none"):
            offset = 0
            if len(tds) == 3:
                prev_ascension_phase = int(''.join(filter(str.isdigit, tds[0].text.strip())))
                offset = 1
            stats_table.append({
                "level": tds[0 + offset].text.strip(),
                "base_atk": tds[1 + offset].text.strip(),
                "ascension_phase": prev_ascension_phase,
            })

        else:
            offset = 0
            if len(tds) == 4:
                prev_ascension_phase = int(''.join(filter(str.isdigit, tds[0].text.strip())))
                offset = 1
            stats_table.append({
                "level": tds[0 + offset].text.strip(),
                "base_atk": tds[1 + offset].text.strip(),
                "sub_stat_type": substat_type,
                "sub_stat_value": tds[2 + offset].text.strip(),
                "ascension_phase": prev_ascension_phase,
            })


    # print(json.dumps(stats_table, indent=4))

    return stats_table

def getHighResImage(image):
    start_index = image.find("scale-to-width-down")
    end_index = image.find("?")
    if start_index != -1 and end_index != -1:
        image = image[:start_index] + image[end_index:]
    return image

def scrapeWeapon(name):
    url = "https://genshin-impact.fandom.com/wiki/" + name
    page = requests.get(url)
    page_soup = soup(page.content, "html.parser")
    # saveHTML(name, str(page_soup))
    details = parseWeaponDetails(page_soup)
    stat_table = parseWeaponStatTable(page_soup, details["sub_stat_type"])
    weapon = {
        **details,
        "base_stats": stat_table,
    }
    return weapon

def scrapeWeaponAssets(name):
    url = "https://genshin-impact.fandom.com/wiki/" + name
    page = requests.get(url)
    page_soup = soup(page.content, "html.parser")

    # get image with alt "Base"
    base_image = page_soup.find("img", {"alt": "Base"})
    if base_image is None:
        base_image = page_soup.find("img", {"alt": "Pneuma-Aligned"})
    
    base_image = base_image["src"]

    # get image with alt "2nd Ascension"
    second_ascension_image = page_soup.find("img", {"alt": "2nd Ascension"})
    if second_ascension_image is None:
        second_ascension_image = page_soup.find("img", {"alt": "Ousia-Aligned"})
    second_ascension_image = second_ascension_image["src"]

    # get image with alt "Multi-Wish Artwork"
    wish_image = page_soup.find("img", {"alt": "Multi-Wish Artwork"})

    wish_image = "" if wish_image is None else wish_image["src"]

    full_image = page_soup.find("img", {"alt": "Full Icon"})
    full_image = "" if full_image is None else full_image["src"]



    #find "scale-to-width-down" in string and from then until ? is found, remove it

    
    wish_image = getHighResImage(wish_image)
    full_image = getHighResImage(full_image)

    result = {
        "base_avatar": base_image,
        "ascended_avatar": second_ascension_image,
    }
    
    if wish_image and wish_image != "":
        result["wish_art"] = wish_image
        
    if full_image and full_image != "":
        result["full_art"] = full_image

    return result


"""
artifact scraping
"""

def getArtifactList():
    url = "https://genshin-impact.fandom.com/wiki/Artifact/Sets"
    page = requests.get(url)
    page_soup = soup(page.content, "html.parser")

    mw_parser_output = page_soup.find("div", {"class": "mw-parser-output"})
    table_soup = mw_parser_output.find("table", {"class": "wikitable"})
    trs = table_soup.find("tbody").find_all("tr", recursive=False)
    trs.pop(0) #remove the header

    names = []
    objs = []
    for tr in trs:
        tds = tr.find_all("td")
        name = tds[0].find("a").text
        names.append(name)

        rarity_range = tds[1].text.strip()
        rarity_range = rarity_range.replace("★", "")
        rarity_min = 0
        rarity_max = 0
        if "-" in rarity_range:
            rarity_min = int(rarity_range.split("-")[0])
            rarity_max = int(rarity_range.split("-")[1])
        else:
            rarity_min = int(rarity_range)
            rarity_max = int(rarity_range)



        objs.append({
            "name": name,
            "key": toKey(name),
            "rarity_min": rarity_min,
            "rarity_max": rarity_max,
        })
    return names, objs

def parseArtifactDetails(page_soup, obj=None):

    mw_parser_output = page_soup.find("div", {"class": "mw-parser-output"})

    aside = mw_parser_output.find("aside", {"class": "portable-infobox"})

    name = aside.find("h2", {"data-source": "title"}).text

    #get all divs with class "description-content" in mw_parser_output
    description_divs = mw_parser_output.find_all("div", {"class": "description-content"})
    for i in range(len(description_divs)):
        description_divs[i] = parseTalentDescription(description_divs[i])
    
    flower_description = "" if 0 >= len(description_divs) else description_divs[0]
    feather_description = "" if 1 >= len(description_divs) else description_divs[1]
    sand_description = "" if 2 >= len(description_divs) else description_divs[2]
    goblet_description = "" if 3 >= len(description_divs) else description_divs[3]
    circlet_description = "" if 4 >= len(description_divs) else description_divs[4]

    #get div with data-source="flower"
    flower_div = aside.find("div", {"data-source": "flower"})
    # data source -> div -> a -> text
    flower_name = "" if flower_div is None else flower_div.find("div", {"class": "pi-data-value"}).find("a").text

    #get div with data-source="plume"
    feather_div = aside.find("div", {"data-source": "plume"})
    feather_name = "" if feather_div is None else feather_div.find("div", {"class": "pi-data-value"}).find("a").text

    #get div with data-source="sands"
    sand_div = aside.find("div", {"data-source": "sands"})
    sand_name = "" if sand_div is None else sand_div.find("div", {"class": "pi-data-value"}).find("a").text

    #get div with data-source="goblet"
    goblet_div = aside.find("div", {"data-source": "goblet"})
    goblet_name = "" if goblet_div is None else goblet_div.find("div", {"class": "pi-data-value"}).find("a").text

    #get div with data-source="circlet"
    circlet_div = aside.find("div", {"data-source": "circlet"})
    circlet_name = "" if circlet_div is None else circlet_div.find("div", {"class": "pi-data-value"}).find("a").text



    #get div with data-source="2pcBonus", get the div inside and parse it with 
    two_pc_bonus_div = aside.find("div", {"data-source": "2pcBonus"})
    two_pc_bonus = "" if two_pc_bonus_div is None else two_pc_bonus_div.text.strip().replace("2-Piece Bonus", "")



    #get div with data-source="4pcBonus", get the div inside and parse it with 
    four_pc_bonus_div = aside.find("div", {"data-source": "4pcBonus"})
    #remove <b>2-Piece Bonus</b><br/>
    four_pc_bonus = "" if four_pc_bonus_div is None else four_pc_bonus_div.text.strip().replace("4-Piece Bonus", "")

    rarity_min = 0
    rarity_max = 0

    if obj is not None:
        rarity_min = obj["rarity_min"]
        rarity_max = obj["rarity_max"]

    #get release version 
    # get div from  with class "change-history"
    # get div with class "change-history-header"
    # get text of div
    # remove "Release in Version " from text
    change_history_div = mw_parser_output.find("div", {"class": "change-history"})
    change_history_header = change_history_div.find("div", {"class": "change-history-header"})
    release_version = change_history_header.text.strip()
    # Use regex to only keep numbers and decimal points
    release_version = ''.join(c for c in release_version if c.isdigit() or c == '.')
    release_version = float(release_version)




    JSON = {
        "name": name,
        "key": toKey(name),
        "flower_description": flower_description,
        "feather_description": feather_description,
        "sand_description": sand_description,
        "goblet_description": goblet_description,
        "circlet_description": circlet_description,
        "flower_name": flower_name,
        "feather_name": feather_name,
        "sand_name": sand_name,
        "goblet_name": goblet_name,
        "circlet_name": circlet_name,
        "two_pc_bonus": two_pc_bonus,
        "four_pc_bonus": four_pc_bonus,
        "rarity_min": rarity_min,
        "rarity_max": rarity_max,
        "release_version": release_version,
        **(obj or {})
    }

    print(json.dumps(JSON, indent=4))

    return JSON


def scrapeArtifact(name, obj=None):
    url = "https://genshin-impact.fandom.com/wiki/" + name
    page = requests.get(url)
    page_soup = soup(page.content, "html.parser")

    details = parseArtifactDetails(page_soup, obj)

    
    JSON = {
        "name": name,
        **details
    }

    return JSON

def scrapeArtifactAssets(name):
    url = "https://genshin-impact.fandom.com/wiki/" + name
    page = requests.get(url)
    page_soup = soup(page.content, "html.parser")

    aside = page_soup.find("aside", {"class": "portable-infobox"})

    #get div with data-source="flower"
    flower_img = ""
    flower_div = aside.find("div", {"data-source": "flower"})
    if flower_div is not None:
        flower_img = flower_div.find("img")["src"]
        flower_img = getHighResImage(flower_img)

    #get div with data-source="plume"
    feather_div = aside.find("div", {"data-source": "plume"})
    feather_img = "" if feather_div is None else feather_div.find("img")["src"]
    feather_img = getHighResImage(feather_img)

    sand_img = ""
    #get div with data-source="sands"
    sand_div = aside.find("div", {"data-source": "sands"})
    if sand_div is not None:
        sand_img = sand_div.find("img")["src"]
        sand_img = getHighResImage(sand_img)

    goblet_img = ""
    #get div with data-source="goblet"
    goblet_div = aside.find("div", {"data-source": "goblet"})
    if goblet_div is not None:
        goblet_img = goblet_div.find("img")["data-src"]
        goblet_img = getHighResImage(goblet_img)

    circlet_img = ""
    #get div with data-source="circlet"
    circlet_div = aside.find("div", {"data-source": "circlet"})
    if circlet_div is not None:
        circlet_img = circlet_div.find("img")["data-src"]
        circlet_img = getHighResImage(circlet_img)

    json = {}

    if flower_img and flower_img != "":
        json["flower"] = flower_img
    if feather_img and feather_img != "":
        json["feather"] = feather_img
    if sand_img and sand_img != "":
        json["sands"] = sand_img
    if goblet_img and goblet_img != "":
        json["goblet"] = goblet_img
    if circlet_img and circlet_img != "":
        json["circlet"] = circlet_img

    return json
