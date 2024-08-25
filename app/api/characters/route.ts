import { NextResponse } from "next/server";
import fs from 'fs';

export async function GET(req: any, res: any){

    let characters = [];

    //look at all json files in data directory and add them to the characters array
    fs.readdirSync('./data/characters').forEach(file => {
        let character = JSON.parse(fs.readFileSync(`./data//characters/${file}`).toString())
        characters.push(character)
    });

    return NextResponse.json({
        "data": characters
    });
}