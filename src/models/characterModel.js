const mongoose = require('mongoose')

const Character = mongoose.models.Character || mongoose.model('Character', new mongoose.Schema({
    name: { type: String, required: true },
    rarity: { type: Number, required: true },
    element: { type: String, required: true },
    weapon: { type: String, required: true },
    region: { type: String, required: true },
    baseStates: [
        {
            level: { type: Number }, 
            baseHP: { type: Number },
            baseDEF: { type: Number },
            ATK: { type: Number }
        }
    ],
    ascensionStat: { type: String, required: true }
}, { timestamps: true }))

module.exports = Character
