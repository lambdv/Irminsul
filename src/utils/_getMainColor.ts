import sharp from 'sharp';

/**
 * Takes a url to an image, processes it and returns the main/dominant color
 * if useCache is true, it will find the colorcache file in the same directory as this code
 * if the file exists, it will try to find the key that matches the imageURL and return the color. if key is not found, it will process the image and return the color and then save the color to the cache file
 * if the file does not exist, it will process the image and return the color and then save the color to the cache file
 * if the file exists but is broken then it will clear the file and process the image and save the color to the cache file
 * @param imageURL - The URL of the image
 * @param useCache - Whether to use the cache
 * @returns The main color of the image as a string (rgb(r,g,b)) or null if there's an error
 */
export async function getMainColor(imageURL: string, useCache: boolean = true): Promise<string | null> {
    if (useCache) {
        try {
            // Try to read from cache file
            const fs = require('fs');
            const path = require('path');
            const cacheFile = path.join(process.cwd(), 'src/utils/colorcache.json');
            
            let cache = {};
            if (fs.existsSync(cacheFile)) {
                try {
                    cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
                    if (cache[imageURL]) {
                        return cache[imageURL];
                    }
                } catch (e) {
                    // Cache file is corrupted, clear it
                    fs.writeFileSync(cacheFile, '{}');
                    cache = {};
                }
            }

            // If we get here, need to process image and update cache
            const dominantColor = await processImage(imageURL);
            if (dominantColor) {
                cache[imageURL] = dominantColor;
                fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
            }
            return dominantColor;
        } catch (error) {
            console.error('Error with cache operations:', error);
            // Fall through to non-cached path
        }
    }

    return await processImage(imageURL);
}


async function processImage(imageURL: string): Promise<string | null> {
    try {
        // Fetch the image
        const response = await fetch(imageURL);
        const buffer = await response.arrayBuffer();

        // Process with sharp
        const image = sharp(Buffer.from(buffer));
        const stats = await image.stats();
        
        // Get the dominant channel values
        const channels = stats.channels;
        const dominantColor = `rgb(${Math.round(channels[0].mean)},${Math.round(channels[1].mean)},${Math.round(channels[2].mean)})`;

        // Adjust the color to be brighter
        return adjustColor(dominantColor);
    } catch (error) {
        console.error('Error getting main color:', error);
        return null; // Return null instead of fallback color
    }
}



function adjustColor(color: string): string {
    // Extract RGB values and boost them by 20%
    const rgb = color.match(/\d+/g)?.map(n => {
        const boosted = Math.round(Number(n) * 1.2);
        return Math.min(255, boosted);
    });
    
    if (!rgb) return color;
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}