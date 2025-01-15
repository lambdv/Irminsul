import { createCanvas, loadImage } from 'canvas'

export async function getMainColor(imageURL: string): Promise<string> {
    const fs = require('fs');
    const path = require('path');
    const cachePath = path.join(process.cwd(), 'src/utils/colorcache');
    // Try to read from cache first
    try {
        if (fs.existsSync(cachePath)) {
            const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
            if (cache[imageURL]) {
                // Don't adjust brightness of cached colors
                return cache[imageURL]
            }
        }
    } catch(e){console.log('Cache read error:', e)}
    

    // If not in cache, process the image
    let img;
    try { 
        img = await loadImage(process.cwd() + '/public' + imageURL) 
    } 
    catch(e) { 
        console.log('Image load error:', e);
        return "rgb(165, 165, 165)" 
    }

    // Maintain aspect ratio while scaling down
    const maxDimension = 250;
    const scale = Math.min(maxDimension / img.width, maxDimension / img.height);
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Scale image down to canvas size
    ctx.drawImage(img, 0, 0, width, height);
    const {data} = ctx.getImageData(0, 0, width, height);

    let maxCount = 0;
    let dominantColor = 'rgb(0,0,0)';
    
    // Use object instead of Map for better performance
    const colorCounts: {[key: string]: number} = {};

    // Process pixels in chunks of 4 (r,g,b,a)
    for (let i = 0; i < data.length; i += 4) {
        // Skip transparent pixels
        if (data[i + 3] < 128) continue;
        
        const color = `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
        const count = (colorCounts[color] || 0) + 1;
        colorCounts[color] = count;

        if (count > maxCount) {
            maxCount = count;
            dominantColor = color;
        }
    }

    // Adjust brightness before caching
    const adjustedColor = adjustBrightness(dominantColor);

    // Save to cache
    try {
        const cache = fs.existsSync(cachePath) 
            ? JSON.parse(fs.readFileSync(cachePath, 'utf8'))
            : {};
        cache[imageURL] = adjustedColor;
        fs.writeFileSync(cachePath, JSON.stringify(cache));
    } catch (e) {
        console.log('Cache write error:', e);
    }

    return adjustedColor;
}

function adjustBrightness(color: string, targetBrightness: number = 0.6): string {
    // Extract RGB values
    const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if (!match) return color;

    const [_, r, g, b] = match.map(Number);
    
    // Calculate current brightness (using perceived brightness formula)
    const currentBrightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Calculate adjustment factor
    const factor = targetBrightness / currentBrightness;
    
    // Adjust RGB values while keeping them in bounds
    const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
    const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
    const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
    
    return `rgb(${newR},${newG},${newB})`;
}

// const elementColorBias: { [key: string]: { r: number, g: number, b: number } } = {
//     geo: { r: 255, g: 165, b: 0 },    // Orange
//     pyro: { r: 255, g: 0, b: 0 },     // Red
//     hydro: { r: 0, g: 191, b: 255 },  // Blue
//     electro: { r: 147, g: 0, b: 255 }, // Purple
//     dendro: { r: 50, g: 205, b: 50 },  // Green
