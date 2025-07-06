
/**
 * Query the GC SIM database for team calculations
 */
export const queryGCSIMDatabase = async (params: {
    characters?: string[];
    excludeCharacters?: string[];
    limit?: number;
    skip?: number;
    acceptedTags?: number[];
    rejectedTags?: number[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) => {
    const {
        characters,
        excludeCharacters,
        limit = 10,
        skip = 0,
        acceptedTags,
        rejectedTags,
        sortBy = "summary.mean_dps_per_target",
        sortOrder = "desc"
    } = params;

    // Build the query object
    const query: any = {
        limit,
        skip,
        sort: {
            [sortBy]: sortOrder === 'desc' ? -1 : 1
        }
    };

    // Build the $and array for complex queries
    const andConditions: any[] = [];

    // Add character inclusion filters
    if (characters && characters.length > 0) {
        characters.forEach(char => {
            andConditions.push({
                "summary.char_names": char.toLowerCase()
            });
        });
    }

    // Add character exclusion filters
    if (excludeCharacters && excludeCharacters.length > 0) {
        excludeCharacters.forEach(char => {
            andConditions.push({
                "summary.char_names": {
                    $ne: char.toLowerCase()
                }
            });
        });
    }

    // Add accepted tags filter (include teams with these tags)
    if (acceptedTags && acceptedTags.length > 0) {
        andConditions.push({
            accepted_tags: {
                $in: acceptedTags
            }
        });
    }

    // Add rejected tags filter (exclude teams with these tags)
    if (rejectedTags && rejectedTags.length > 0) {
        andConditions.push({
            accepted_tags: {
                $nin: rejectedTags
            }
        });
    }

    // Only add query if we have conditions
    if (andConditions.length > 0) {
        query.query = {
            $and: andConditions
        };
    }

    // Encode the query as URL parameter
    const encodedQuery = encodeURIComponent(JSON.stringify(query));
    const url = `https://simpact.app/api/db?q=${encodedQuery}`;


    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add source URL to each result
        if (data.data && Array.isArray(data.data)) {
            data.data = data.data.map((item: any) => ({
                source: `https://gcsim.app/db/${item._id}`,
                description: item.description,
                team_members: item.summary.char_names,
                dps: item.summary.mean_dps_per_target,
                assumptions: item.summary.team,
            }));
        }
        
        return data.data
        
    } catch (error) {
        console.error('Error querying GC SIM database:', error);
        throw error;
    }
};

async function main() {
    let res = await queryGCSIMDatabase({
        characters: ['Mavuika'],
        limit: 1,
    })
    console.log(res)

}

main().catch(console.error)



