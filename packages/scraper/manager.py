import requests
from bs4 import BeautifulSoup
import json
# import utils # Commented out since html2text module is missing
# import wikiscrapper as wiki
# import tclscrapper as tcl
import os
import utils
import tclscrapper as tcl

# takes a folder name, gets all the individual json files in the folder, and compiles them into a single json file
# does not modifiy or delete any files loaded files
# output file should be an object with the key "data" and the value being an array of the objects in the json files
def compile_json_files(folder_path, output_path, output_file_name):
    # get all the json files in the folder
    json_files = [f for f in os.listdir(folder_path) if f.endswith('.json')]
    
    # create array to store all json objects
    json_array = []
    
    # read each json file and append to array
    for json_file in json_files:
        with open(os.path.join(folder_path, json_file), 'r') as jf:
            json_array.append(json.loads(jf.read()))
    
    # create output object with data array
    output_obj = {"data": json_array}
    
    # write compiled json to output file
    with open(os.path.join(output_path, output_file_name), 'w') as f:
        json.dump(output_obj, f, indent=4)



#go through public/assets/talents/characters and for each folder, if there is exactly 1 file that doesn't follow the naming convention, rename it to follow the convention
# def rename_talents(folder_path):
#     # get all the folders in the folder
#     folders = [f for f in os.listdir(folder_path) if os.path.isdir(os.path.join(folder_path, f))]
    
#     for folder in folders:
#         # print all the files in the folder
#         allFilesInFolder = os.listdir(os.path.join(folder_path, folder))
#         #print(allFilesInFolder)

#         #find folder with no files
#         if len(allFilesInFolder) == 0:
#             print(folder)




# def processamberrips():
#     #get all foldersin toprocess
#     allFoldersInToProcess = os.listdir("toprocess")

#     for folder in allFoldersInToProcess:
#         #for each folder, get all files
#         allFilesInFolder = os.listdir(os.path.join("toprocess", folder))
#         # print(allFilesInFolder)
#         # key = toKey(folder name)
#         # key = toKey()
#         key = utils.toKey(str(folder))

#         # map amber's naming convention to ours 

#         # ICON_MAPPING = {
#         #     "Skill_S_Chasca_01" : "skill",
#         #     "Skill_E_Chasca_01" : "burst",
#         #     "UI_Talent_S_Chasca_05" : "a1",
#         #     "UI_Talent_S_Chasca_06": "a4",
#         #     "UI_Talent_S_Chasca_08": "passive",
#         #     "UI_Talent_S_Chasca_09": "c1",
#         #     "UI_Talent_S_Chasca_10": "c2",
#         #     "UI_Talent_U_Chasca_01": "c3",


#         # }


# processamberrips()
