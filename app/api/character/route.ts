"use server"
import { stat } from "fs";
import mongoose from "mongoose"
import { NextResponse } from "next/server";

// export async function GET(request, response){
//     const URI = `${process.env.MONGO_URI}`
//     let client;

//     try {
//         client = await mongoose.connect(URI)
//         console.log('db connected')
//     }
    
//     catch(error){
//         console.log('there was an error connecting to the db in the try catch block:', error) 
//     }

//     const data = await request.json();
//     const { name, rarity, element, weapon, region, baseStates, ascensionStat, createdAt } = data;

//     return NextResponse.json({
//         hello: "world",
//     });
// }