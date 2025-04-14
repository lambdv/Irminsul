import sharp from 'sharp';

/**
 * Get the main color of an image
 * @param imageURL - The URL of the image
 * @returns The main color of the image
 */
export async function getMainColor(imageURL: string): Promise<string> {
    const fs = require('fs');
    const path = require('path');
    const cachePath = path.join(process.cwd(), 'src/utils/colorcache');
    // Try to read from cache first
    try {
        if (fs.existsSync(cachePath)) {
            const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
            if (cache[imageURL]) {
                return cache[imageURL]
            }
        }
    } catch(e){console.log('Cache read error:', e)}

    // If not in cache, process the image
    try {
        // Fetch the image
        const response = await fetch(imageURL);
        const buffer = await response.arrayBuffer();

        // Process with sharp
        const image = sharp(Buffer.from(buffer));
        
        // Resize image maintaining aspect ratio
        const maxDimension = 250;
        const metadata = await image.metadata();
        const scale = Math.min(maxDimension / (metadata.width || 1), maxDimension / (metadata.height || 1));
        const width = Math.round((metadata.width || 1) * scale);
        const height = Math.round((metadata.height || 1) * scale);
        
        image.resize(width, height);

        const { data, info } = await image
            .raw()
            .toBuffer({ resolveWithObject: true });

        const colorCounts: {[key: string]: number} = {};

        // Count colors
        for (let i = 0; i < data.length; i += info.channels) {
            // Skip transparent pixels
            if (info.channels === 4 && data[i + 3] < 128) continue;

            //ignore shades of white or black or gray
            if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) continue;
            if (data[i] < 10 && data[i + 1] < 10 && data[i + 2] < 10) continue;
            if (data[i] > 150 && data[i + 1] > 150 && data[i + 2] > 150) continue;
            
            const color = `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
            colorCounts[color] = (colorCounts[color] || 0) + 1;
        }

        // Get top 5 most common colors
        const top5Colors = Object.entries(colorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([color]) => color);

        // Calculate vibrancy for each color with frequency weighting
        const colorVibrancy = top5Colors.map((color, index) => {
            const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
            if (!match) return { color, vibrancy: 0 };

            const [_, r, g, b] = match.map(Number);
            
            // Calculate color vibrancy using standard deviation of RGB values
            const mean = (r + g + b) / 3;
            const variance = ((r - mean) ** 2 + (g - mean) ** 2 + (b - mean) ** 2) / 3;
            const baseVibrancy = Math.sqrt(variance);

            // Apply frequency weighting - earlier indices (more frequent colors) get higher weights
            const frequencyWeight = 1 + (5 - index) * 0.15; // Weight ranges from 1.75 to 1.15
            const weightedVibrancy = baseVibrancy * frequencyWeight;

            return { color, vibrancy: weightedVibrancy };
        });

        // Get the most vibrant color
        const mostVibrantColor = colorVibrancy.reduce((prev, curr) => 
            curr.vibrancy > prev.vibrancy ? curr : prev
        ).color;

        // Adjust brightness
        const adjustedColor = adjustBrightness(mostVibrantColor);

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

    } catch (error) {
        console.error('Error getting main color:', error);
        return 'rgb(165, 165, 165)'; // Fallback color
    }
}

/**
 * helper function to adjust the brightness of a color
 * @param color 
 * @param targetBrightness 
 * @returns 
 */
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