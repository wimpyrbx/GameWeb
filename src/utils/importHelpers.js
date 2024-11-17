// Add this helper function at the top
const mapRatingToId = async (ratingString) => {
  try {
    const response = await fetch('http://localhost:3001/api/ratings');
    const ratings = await response.json();
    
    // Normalize the rating string
    const normalizedRating = ratingString?.trim().toUpperCase() || '';
    
    // Try to find an exact match first
    for (const rating of ratings) {
      if (rating.name.toUpperCase() === normalizedRating) {
        return rating.id;
      }
    }

    // If no exact match, try to match PEGI ratings with numbers
    if (normalizedRating.includes('PEGI')) {
      const pegiNumber = normalizedRating.match(/\d+/);
      if (pegiNumber) {
        const pegiMatch = ratings.find(r => 
          r.name.includes(pegiNumber[0]) && r.system === 'PEGI'
        );
        if (pegiMatch) return pegiMatch.id;
      }
    }

    // Return null if no match found
    return null;
  } catch (error) {
    console.error('Error mapping rating:', error);
    return null;
  }
};

export const determineRegion = (rating) => {
  if (!rating) return 'PAL';
  rating = rating.toUpperCase();
  
  if (rating.includes('NTSC')) {
    return 'NTSC-U';
  } else if (rating.includes('CERO')) {
    return 'NTSC-J';
  } else if (rating.includes('ACB')) {
    return 'PAL';
  } else if (rating.includes('BBFC')) {
    return 'PAL';
  } else if (rating.includes('PEGI')) {
    return 'PAL';
  }
  
  return 'PAL';
};

// Add the adjustNOKPrice function
function adjustNOKPrice(price) {
  if (!price) return null;
  
  if (price < 25) {
    return Math.ceil(price / 25) * 25;
  } else if (price < 50) {
    return Math.ceil(price / 5) * 5;
  } else if (price < 100) {
    return Math.ceil(price / 10) * 10;
  } else {
    return Math.ceil(price / 25) * 25;
  }
}

export const parseGamesList = (text) => {
  // Split into lines and remove empty lines
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim());
  
  // Get headers from first line
  const headers = lines[0].split('\t');
  console.log('Found headers:', headers);
  
  // First, get the console ID
  return fetch('http://localhost:3001/api/consoles')
    .then(response => response.json())
    .then(async (consoles) => {  // Make this callback async
      const xbox360 = consoles.find(c => c.name === 'Xbox 360');
      if (!xbox360) {
        throw new Error('Xbox 360 console not found in database');
      }

      // Process each line
      const gamesPromises = lines.slice(1).map(async (line, index) => {  // Make this callback async
        try {
          const values = line.split('\t');
          
          // Create a map of the TSV columns to values
          const tsvData = {};
          headers.forEach((header, i) => {
            tsvData[header] = values[i]?.trim() || null;
          });

          // Extract year from release date
          let releaseYear = null;
          if (tsvData['Release Date']) {
            const dateMatch = tsvData['Release Date'].match(/\d{4}/);
            if (dateMatch) {
              releaseYear = parseInt(dateMatch[0]);
            }
          }

          // Get rating ID - now using await since mapRatingToId is async
          const ratingId = await mapRatingToId(tsvData.PEGI_Final);

          // Map the TSV data to our database fields
          const parsedGame = {
            title: tsvData.ProductName,
            ratingId: ratingId,  // Use the mapped rating ID
            pricechartingUrl: tsvData.PricechartingUrl,
            coverUrl: tsvData.CoverUrl,
            pricechartingId: tsvData.PricechartingID,
            developer: tsvData.Developer,
            publisher: tsvData.Publisher,
            releaseYear: releaseYear,
            genre: tsvData.Genre,
            
            // USD Prices - ensure they're converted to numbers
            Loose_USD: parseFloat(tsvData.Pricecharting_Loose) || null,
            CIB_USD: parseFloat(tsvData.Pricecharting_Complete) || null,
            NEW_USD: parseFloat(tsvData.Pricecharting_New) || null,
            BOX_USD: parseFloat(tsvData.Pricecharting_BoxOnly) || null,
            MANUAL_USD: parseFloat(tsvData.Pricecharting_ManualOnly) || null,

            // Fixed values
            consoleId: xbox360.id,
            regionId: determineRegion(tsvData.PEGI_Final) === 'PAL' ? 1 : 2
          };

          // Calculate NOK prices
          const rate = 10.5;
          const Loose_NOK = parsedGame.Loose_USD ? parsedGame.Loose_USD * rate : null;
          const CIB_NOK = parsedGame.CIB_USD ? parsedGame.CIB_USD * rate : null;
          const NEW_NOK = parsedGame.NEW_USD ? parsedGame.NEW_USD * rate : null;
          const BOX_NOK = parsedGame.BOX_USD ? parsedGame.BOX_USD * rate : null;
          const MANUAL_NOK = parsedGame.MANUAL_USD ? parsedGame.MANUAL_USD * rate : null;

          // Calculate NOK2 prices
          const Loose_NOK2 = adjustNOKPrice(Loose_NOK);
          const CIB_NOK2 = adjustNOKPrice(CIB_NOK);
          const NEW_NOK2 = adjustNOKPrice(NEW_NOK);
          const BOX_NOK2 = adjustNOKPrice(BOX_NOK);
          const MANUAL_NOK2 = adjustNOKPrice(MANUAL_NOK);

          return {
            ...parsedGame,
            Loose_NOK,
            CIB_NOK,
            NEW_NOK,
            BOX_NOK,
            MANUAL_NOK,
            Loose_NOK2,
            CIB_NOK2,
            NEW_NOK2,
            BOX_NOK2,
            MANUAL_NOK2,
            isSpecial: 0,
            isKinect: parsedGame.title.toLowerCase().includes('kinect') ? 1 : 0
          };
        } catch (error) {
          console.error(`Error parsing line ${index + 2}:`, error);
          console.error('Line content:', line);
          return null;
        }
      });

      // Wait for all games to be processed
      const games = await Promise.all(gamesPromises);
      
      // Filter out any null entries
      const validGames = games.filter(game => game && game.title);
      
      console.log('Total valid games parsed:', validGames.length);
      return validGames;
    });
}; 