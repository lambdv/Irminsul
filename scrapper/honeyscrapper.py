import requests
from bs4 import BeautifulSoup
import json
import os
import re

def parseStatTable(page_soup):
    JSON = json.dumps({})
    # table_soup = page_soup.find("table", {"class": "ascension-stats"}) # get ascension table
    # # print(ascensionTable.encode('utf-8'))

    # tbody = table_soup.find("tbody") # get tbody

    # trs = tbody.find_all("tr") # get all trs
    # header = trs.pop(0) #remove the first tr
    
    # # filter out any trs that have the id "mw-customcollapsible-toggle-ascension"
    # trs = [tr for tr in trs if tr.get("id") != "mw-customcollapsible-toggle-ascension"]
    # #print(trs)

    # # get the last th from the header and get text from spand -> b -> a tag and store it
    # specialStat = header.find_all("th")[-1].find("span").find("b").find("a").text
    # # print(specialStat)

    # stats = { # make a dictionary called characterStats
    #     "LVL": [],
    #     "BaseHP": [],
    #     "BaseATK": [],
    #     "BaseDEF": [],
    #     "AscensionStatType": specialStat,
    #     "AscensionStatValue": [],
    #     "AscensionPhase": [],
    # }

    # prevAscensionPhase = 0
    # prevSpecialStatAmount = 0

    # for tr in trs:
    #     tds = tr.find_all("td")
    #     if len(tds) == 4:
    #         stats["AscensionStatValue"].append(prevSpecialStatAmount)
    #         stats["AscensionPhase"].append(prevAscensionPhase)
    #         stats["LVL"].append(tds[0].text)
    #         stats["BaseHP"].append(tds[1].text.replace(",", ""))
    #         stats["BaseATK"].append(tds[2].text)
    #         stats["BaseDEF"].append(tds[3].text)
            
    #     elif len(tds) == 6:
    #         prevAscensionPhase = int(''.join(filter(str.isdigit, tds[0].text)))
    #         prevSpecialStatAmount = tds[5].text if "%" in tds[5].text else "0%"
    #         stats["AscensionPhase"].append(prevAscensionPhase)
    #         stats["LVL"].append(tds[1].text)
    #         stats["BaseHP"].append(tds[2].text.replace(",", ""))
    #         stats["BaseATK"].append(tds[3].text)
    #         stats["BaseDEF"].append(tds[4].text)
    #         stats["AscensionStatValue"].append(prevSpecialStatAmount)
    # JSON = json.dumps(stats)
    return JSON





def parseTalents(page_soup):
    #print(page_soup.encode('utf-8'))
    talent_container_soup = page_soup.find_all("div", {"class": "talent-table-container"})
    print(talent_container_soup)





    
def scrapCharacter(id):
    url = "https://gensh.honeyhunterworld.com/" + id + "?lang=EN"
    page = requests.get(url)

    # print(page.content)
    # #write to index.html
    with open("index.html", "w", encoding="utf-8") as file:
        file.write(page.content.decode('utf-8'))

    content_str = page.content.decode('utf-8')
    # cleaned_content = re.sub(r'<script.*?>.*?</script>', '', content_str, flags=re.DOTALL)
    # cleaned_content = re.sub(r'<style.*?>.*?</style>', '', cleaned_content, flags=re.DOTALL)
    # cleaned_content = re.sub(r'<!--.*?-->', '', cleaned_content, flags=re.DOTALL)
    # page_soup = BeautifulSoup(content_str, "html.parser")


    # Print the cleaned and parsed content
    # print(page_soup.prettify())

    # statTable = parseStatTable(page_soup)
    # print (statTable)
