import wikiscrapper  as wiki
import tclscrapper   as tcl
import os
import time as timer
import json
import manager as m
import utils

# wiki.weaponDBSync()
# wiki.characterDBSync(overrideData=False, overrideAssets=False)
# wiki.artifactDBSync()

# m.compile_json_files("../genshindata/public/data/artifacts", "../genshindata/public/data/", "artifacts.json")
# m.compile_json_files("../genshindata/public/data/characters", "../genshindata/public/data/", "characters.json")
# m.compile_json_files("../genshindata/public/data/weapons", "../genshindata/public/data/", "weapons.json")

# c = wiki.scrapeCharacter("ororon")

#tcl.syncCharacterIcons()


# characterNames = ["chasca"]
# for name in characterNames:

#     key = utils.toKey(name)
#     obj = [characterNames.index(name)]

#     imgOBJ = wiki.scrapeCharacterAssets(name)
#     # iconOBJ = tcl.scrapeCharacterIcons(name, obj.vision)
#     utils.saveIMGS(name, imgOBJ, "../genshindata/public/assets/characters", override=True)
#     print(f"Saved {name} assets")




# wiki.weaponDBSync()
# wiki.characterDBSync(overrideData=False, overrideAssets=False)
# wiki.artifactDBSync()

# m.compile_json_files("../genshindata/public/data/artifacts", "../genshindata/public/data/", "artifacts.json")
# m.compile_json_files("../genshindata/public/data/characters", "../genshindata/public/data/", "characters.json")
# m.compile_json_files("../genshindata/public/data/weapons", "../genshindata/public/data/", "weapons.json")



# def updateDatabase():
#     wiki.weaponDBSync(overrideData=False, overrideAssets=False)
#     wiki.characterDBSync(overrideData=False, overrideAssets=False)
#     wiki.artifactDBSync(overrideData=False, overrideAssets=False)

#     m.compile_json_files("../genshindata/public/data/artifacts", "../genshindata/public/data/", "artifacts.json")
#     m.compile_json_files("../genshindata/public/data/characters", "../genshindata/public/data/", "characters.json")
#     m.compile_json_files("../genshindata/public/data/weapons", "../genshindata/public/data/", "weapons.json")

# updateDatabase()


