import requests
from bs4 import BeautifulSoup as soup
import json
import os
from datetime import datetime, timezone
import time
import time as timer

import utils
import tclscrapper as tcl

def characterDBSync(overrideData=False, overrideAssets=False):
    characterNames, characterOBJs = getCharacterList()
    for name in characterNames:
        if(name == "Traveler"):
            continue
        key = utils.toKey(name)
        obj = characterOBJs[characterNames.index(name)]
        # data
        if not os.path.exists(f"../genshindata/public/data/characters/{key}.json") or overrideData:
            characterJSON = scrapeCharacter(name)

            tclsoup = tcl.scrapeCharacter(name, characterJSON["element"])
            d = tcl.parseCharacterDescription(tclsoup)
            if d and d != "" and d != "None":
                characterJSON["description"] = d
                #print(characterJSON["description"])
            utils.saveJSON(characterJSON, "../genshindata/public/data/characters", override=False)
            print(f"Saved {name}.json")
            #timer.sleep(1)
        # assets
        if not os.path.exists(f"../genshindata/public/assets/characters/{key}/") or overrideAssets:
            imgOBJ = scrapeCharacterAssets(name)
            # iconOBJ = tcl.scrapeCharacterIcons(name, obj.vision) @only works if character is in tcl
            utils.saveIMGS(name, imgOBJ, "../genshindata/public/assets/characters", override=False)
            print(f"Saved {name} assets")

def weaponDBSync(overrideData=False, overrideAssets=False):
    weaponNames = getWeaponList()
    print(weaponNames)
    for name in weaponNames:
        key = utils.toKey(name)
        if not os.path.exists(f"../genshindata/public/data/weapons/{key}.json"): 
            print(f"ripping {name}")
            weaponJSON = None
            weaponJSON = scrapeWeapon(name)
            utils.saveJSON(weaponJSON, "../genshindata/public/data/weapons")
            print(f"Saved {name}.json")
            #timer.sleep(1)
        if not os.path.exists(f"../genshindata/public/assets/weapons/{key}/"):
            print(f"ripping {name} assets")
            imgOBJ = scrapeWeaponAssets(name)
            utils.saveIMGS(name, imgOBJ, "../genshindata/public/assets/weapons", override=overrideAssets)
            print(f"Saved {name} assets")

def artifactDBSync(overrideData=False, overrideAssets=False):
    artNames, artOBJs = getArtifactList()
    for i in range(len(artNames)):
        name = artNames[i]
        obj = artOBJs[i]
        key = utils.toKey(name)
        if not os.path.exists(f"../genshindata/public/data/artifacts/{key}.json") or overrideData:
            print(f"saving {name}...")
            artifactJSON = scrapeArtifact(name, obj)
            utils.saveJSON(artifactJSON, "../genshindata/public/data/artifacts", override=overrideData)
            print(f"Saved {name}.json")
            #timer.sleep(1)
        if not os.path.exists(f"../genshindata/public/assets/artifacts/{key}/") or overrideAssets:
            print(f"saving {name} assets...")
            imgOBJ = scrapeArtifactAssets(name)
            utils.saveIMGS(name, imgOBJ, "../genshindata/public/assets/artifacts", override=overrideAssets)
            print(f"Saved {name} assets")

"""
character scraping
"""

# def parseStatTable(page_soup):
#     table_soup = page_soup.find("table", {"class": "ascension-stats"}) # get ascension table
#     tbody = table_soup.find("tbody") # get tbody
#     trs = tbody.find_all("tr") # get all trs
#     print(trs)
#     header = trs.pop(0) #remove the first tr
#     # filter out any trs that have the id "mw-customcollapsible-toggle-ascension"
#     cost_trs = [tr for tr in trs if tr.get("id") == "mw-customcollapsible-toggle-ascension"]
#     trs = [tr for tr in trs if tr.get("id") != "mw-customcollapsible-toggle-ascension"]

#     print(header)

#     # get the last th from the header and get text from spand -> b -> a tag and store it
#     specialStat = header.find_all("th")[-1].find("span").find("b").find("a").text
#     # make a dictionary called characterStats
#     stats = { 
#         "LVL": [],
#         "BaseHP": [],
#         "BaseATK": [],
#         "BaseDEF": [],
#         "AscensionStatType": specialStat,
#         "AscensionStatValue": [],
#         "AscensionPhase": [],
#         "AscentionCost": []
#     }
#     prevAscensionPhase = 0
#     prevSpecialStatAmount = 0
#     for tr in trs:
#         tds = tr.find_all("td")
#         if len(tds) == 4:
#             stats["AscensionStatValue"].append(prevSpecialStatAmount)
#             stats["AscensionPhase"].append(prevAscensionPhase)
#             stats["LVL"].append(tds[0].text)
#             stats["BaseHP"].append(tds[1].text.replace(",", ""))
#             stats["BaseATK"].append(tds[2].text)
#             stats["BaseDEF"].append(tds[3].text)
            
#         elif len(tds) == 6:
#             prevAscensionPhase = int(''.join(filter(str.isdigit, tds[0].text)))
#             prevSpecialStatAmount = tds[5].text if "%" in tds[5].text else "0%"
#             stats["AscensionPhase"].append(prevAscensionPhase)
#             stats["LVL"].append(tds[1].text)
#             stats["BaseHP"].append(tds[2].text.replace(",", ""))
#             stats["BaseATK"].append(tds[3].text)
#             stats["BaseDEF"].append(tds[4].text)
#             stats["AscensionStatValue"].append(prevSpecialStatAmount)
    
#     prevAscensionPhase = 0 
#     for tr in cost_trs:
#         td = tr.find("td", recursive=False)

#         # each matiral is represented by a div
#         # each div has 2 spands, first with class "card-caption" for the name of the material and the second with class "card-content" for the amount
#         # for the first span, get the most inner item (should be an image) and get the alt value (name of the material) and store it as name
#         # for the second span, get the text and store it as amount while stripping the quotes
#         materials = []
#         for div in td.find_all("div", recursive=False):
#             spans = div.find_all("span", recursive=False)
#             if len(spans) != 2:
#                 print("Error: unexpected number of spans in div")
#                 return
#             name = spans[0].find("a").find("img")["alt"]
#             amount = ''.join(filter(str.isdigit, spans[1].text))
#             materials.append({
#                 "name": name,
#                 "amount": amount
#             })
#         cost = {
#             "AscensionPhase": prevAscensionPhase,
#             "materials": materials
#         }
#         stats["AscentionCost"].append(cost)
#         prevAscensionPhase += 1
    
#     return stats

def parseStatTable2(page_soup):
    table_soup = page_soup.find("table", {"class": "ascension-stats"}) # get ascension table
    tbody = table_soup.find("tbody") # get tbody
    trs = tbody.find_all("tr") # get all trs
    header = trs.pop(0) #remove the first tr
    # filter out any trs that have the id "mw-customcollapsible-toggle-ascension"
    cost_trs = [tr for tr in trs if tr.get("id") == "mw-customcollapsible-toggle-ascension"]
    trs = [tr for tr in trs if tr.get("id") != "mw-customcollapsible-toggle-ascension"]

    # get the last th from the header and get text from spand -> b -> a tag and store it
    specialStat = header.find_all("th")[-1].find("span").text


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
            prevSpecialStatAmount = tds[5].text
            if prevSpecialStatAmount == "—":
                prevSpecialStatAmount = "-"

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
    print(jumps)
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
    #utils.printSoup(container_soup)
    tbody_soup = container_soup.find("tbody")
    #utils.printSoup(tbody_soup)
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
    # Helper function to safely get text from an element
    def safe_get_text(element, default=""):
        if element is None:
            return default
        return element.text.strip().lower()

    # Helper function to safely get attribute from an element
    def safe_get_attr(element, attr, default=""):
        if element is None or not hasattr(element, 'attrs'):
            return default
        return element.get(attr, default)

    # Find name from h2 with "pi-title" class
    name = safe_get_text(page_soup.find("h2", {"class": "pi-title"}))

    # Find title from h2 with data-item-name "secondary_title"
    title = safe_get_text(page_soup.find("h2", {"data-item-name": "secondary_title"}))

    # Find rarity from td with data-source "quality" and get the image's alt value
    rarity_element = page_soup.find("td", {"data-source": "quality"})
    rarity = 0
    if rarity_element and rarity_element.find("img"):
        rarity_text = safe_get_attr(rarity_element.find("img"), "alt", "")
        rarity = int(''.join(filter(str.isdigit, rarity_text)))

    # Find element from div with data-source "element"
    element = "none"
    element_td = page_soup.find("td", {"data-source": "element"})
    if element_td:
        element_img = element_td.find("img")
        if element_img and "alt" in element_img.attrs:
            element = element_img["alt"].replace("Element ", "").lower()

    # Find weapon from td with data-source "weapon"
    weapon = "none"
    weapon_td = page_soup.find("td", {"data-source": "weapon"})
    if weapon_td:
        weapon_links = weapon_td.find_all("a")
        if len(weapon_links) > 1:
            weapon = safe_get_text(weapon_links[1])

    # Get release date
    release_date = "none"
    release_date_element = page_soup.find("div", {"data-source": "releaseDate"})
    if release_date_element:
        release_date_div = release_date_element.find("div", {"class": "pi-data-value"})
        if release_date_div:
            release_date = parseTalentDescription(release_date_div)
            release_date = release_date.split("\n")[0].lower()

    # Convert release date to epoch time
    release_date_epoch = 0
    try:
        if release_date != "none":
            release_date_dt = datetime.strptime(release_date, "%B %d, %Y")
            release_date_dt = release_date_dt.replace(tzinfo=timezone.utc)
            release_date_epoch = int(release_date_dt.timestamp())
    except ValueError:
        pass

    # Find constellation
    constellation = "none"
    constellation_div = page_soup.find("div", {"data-source": "constellation"})
    if constellation_div:
        constellation_link = constellation_div.find("a")
        if constellation_link:
            constellation = safe_get_text(constellation_link)

    # Find region
    region = "none"
    region_div = page_soup.find("div", {"data-source": "region"})
    if region_div:
        region_link = region_div.find("a")
        if region_link:
            region = safe_get_text(region_link)

    # Find affiliation
    affiliation = "none"
    affiliation_div = page_soup.find("div", {"data-source": "affiliation"})
    if affiliation_div:
        affiliation = safe_get_text(affiliation_div.find("div", {"class": "pi-data-value"}))

    # Find birthday
    birthday = "none"
    birthday_div = page_soup.find("div", {"data-source": "birthday"})
    if birthday_div:
        birthday_link = birthday_div.find("a")
        if birthday_link:
            birthday = safe_get_text(birthday_link)

    # Find special dish
    special_dish = "none"
    dish_div = page_soup.find("div", {"data-source": "dish"})
    if dish_div:
        dish_link = dish_div.find("a")
        if dish_link:
            special_dish = safe_get_text(dish_link)

    # Find alternate titles
    alternate_titles = "none"
    title2_div = page_soup.find("div", {"data-source": "title2"})
    if title2_div:
        title_ul = title2_div.find("ul")
        if title_ul:
            title_li = title_ul.find("li")
            if title_li:
                alternate_titles = safe_get_text(title_li)

    # Find description
    description = ""
    mw_parser_output = page_soup.find("div", {"class": "mw-parser-output"})
    if mw_parser_output:
        paragraphs = mw_parser_output.find_all("p")
        if len(paragraphs) > 2:
            description = parseTalentDescription(paragraphs[2])

    details = {
        "name": name,
        "key": utils.toKey(name),
        "title": title,
        "rarity": rarity,
        "element": element,
        "vision": element,
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

    # Helper function to safely get image URL
    def safe_get_image_url(element, attr="src"):
        if element is None or not hasattr(element, 'attrs'):
            return ""
        return element.get(attr, "")

    # Helper function to process image URL
    def process_image_url(url):
        if not url:
            return ""
        return getHighResImage(url)

    # Get wish image
    wish_img_element = page_soup.find("img", {"alt": "Wish"})
    wish_img = process_image_url(safe_get_image_url(wish_img_element))

    # Get gallery page for other images
    url = "https://genshin-impact.fandom.com/wiki/" + name + "/Gallery"
    page = requests.get(url)
    page_soup = soup(page.content, "html.parser")

    # Get character icon
    icon_img_element = page_soup.find("img", {"alt": "Character Icon"})
    icon_img = process_image_url(safe_get_image_url(icon_img_element))

    # Get namecard image
    namecard_img_element = page_soup.find("img", {"title": lambda x: x and "Namecard" in x})
    namecard_img = process_image_url(safe_get_image_url(namecard_img_element))

    # Create image object with only non-empty URLs
    imgOBJ = {}
    
    if wish_img:
        imgOBJ["splash"] = wish_img
    if icon_img:
        imgOBJ["avatar"] = icon_img
    if namecard_img:
        imgOBJ["namecard"] = namecard_img

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
        characterOBJs.append({
            "name": name,
            "key": name.lower().replace(" ", "-"),
            "rarity": int(tr.find_all("td")[2].find("img")["alt"].replace(" Stars", "")),
            "model": tds[6].text.strip(),
            "release_version": tds[8].text.strip(),
            "vision": tds[3].text.strip()
        })
    return names, characterOBJs

def scrapeCharacters(names=None):
    if names is None:
        names, _ = getCharacterList()
    characters = []
    for name in names:
        characters.append(scrapeCharacter(name))
        # delay
        time.sleep(2)
    return characters


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

    detail_section_2 = []


    #sectionsTest = aside.find_all("section", recursive=False)
    #print(len(sectionsTest))

    #detail_section_2 = aside.find_all("section", recursive=False)[1].find("section").find_all("section", recursive=False)[1].find_all("div", recursive=False)

    detail_section_2 = aside.find_all("section", recursive=False)[1].find_all("section", recursive=True)[-1].find_all("div", recursive=False)




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
        "key": utils.toKey(name),
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
    # utils.saveHTML(name, str(page_soup))
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
        "baseicon": base_image,
        "ascendedicon": second_ascension_image,
    }
    
    if wish_image and wish_image != "":
        result["splash"] = wish_image
        
    if full_image and full_image != "":
        if wish_image != "":
            result["splash2"] = full_image
        else:
            result["splash"] = full_image

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
            "key": utils.toKey(name),
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
        "key": utils.toKey(name),
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

# def missingWeaponAssets():
#     weapons = getWeaponList()
#     notmissing = weapons
#     for weapon in weapons:
#         key = utils.toKey(weapon)
#         if not os.path.exists(f"../genshindata/public/assets/weapons/{key}/splash.png"):
#            # missing.append(key)
#            notmissing.remove(weapon)

#     print(json.dumps(notmissing, indent=4))
#     # sort by alphabetical order
#     notmissing.sort()
#     return notmissing