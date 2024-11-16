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

export const parseGamesList = (text) => {
  // Split into lines and remove empty lines
  const lines = text.split('\n').filter(line => line.trim());
  
  // Get headers from first line to help with debugging
  const headers = lines[0].split('\t');
  console.log('Found headers:', headers);
  
  // Process each line
  const games = lines.slice(1).map(line => {
    const values = line.split('\t');
    
    // Map values to their corresponding headers
    const [
      ProductName,
      ,
      PEGI_Final,
      EbayLookup,
      PriceChartingLookup,
      PricechartingUrl,
      ,
      CoverUrl,
      ,
      PricechartingID,
      Developer,
      Publisher,
      ReleaseDate,
      Genre,
      PEGI,
      Pricecharting_Loose,
      Pricecharting_Complete,
      Pricecharting_New,
      Pricecharting_BoxOnly,
      Pricecharting_ManualOnly
    ] = values.map(field => field?.trim() || null);

    // Parse price values to numbers or null
    const prices = {
      loose: Pricecharting_Loose ? parseFloat(Pricecharting_Loose) : null,
      cib: Pricecharting_Complete ? parseFloat(Pricecharting_Complete) : null,
      new: Pricecharting_New ? parseFloat(Pricecharting_New) : null,
      box: Pricecharting_BoxOnly ? parseFloat(Pricecharting_BoxOnly) : null,
      manual: Pricecharting_ManualOnly ? parseFloat(Pricecharting_ManualOnly) : null
    };

    return {
      title: ProductName,
      rating: PEGI_Final,
      pricechartingUrl: PricechartingUrl,
      coverUrl: CoverUrl,
      pricechartingId: PricechartingID,
      developer: Developer,
      publisher: Publisher,
      releaseDate: ReleaseDate,
      genre: Genre,
      prices,
      Pricecharting_Loose,
      Pricecharting_Complete,
      Pricecharting_New,
      Pricecharting_BoxOnly,
      Pricecharting_ManualOnly
    };
  });
  
  return games;
}; 