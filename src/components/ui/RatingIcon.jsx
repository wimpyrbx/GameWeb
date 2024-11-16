import React from 'react';

const RatingIcon = ({ rating }) => {
  if (!rating) return '-';

  // Normalize the rating string
  const ratingUpper = rating.toUpperCase();

  // PEGI Ratings
  if (ratingUpper.includes('PEGI')) {
    const age = ratingUpper.match(/\d+/);
    if (age) {
      return (
        <img 
          src={`/ratings/pegi/pegi_${age[0]}.webp`} 
          alt={`PEGI ${age[0]}`} 
          title={`PEGI ${age[0]}`}
          style={{ 
            height: '100%',
            width: 'auto',
            display: 'block'
          }}
        />
      );
    }
  }

  // ESRB Ratings
  if (ratingUpper.includes('ESRB') || ['E', 'E10+', 'T', 'M', 'AO'].includes(ratingUpper)) {
    let ratingCode = ratingUpper.replace('ESRB_', '').toLowerCase();
    return (
      <img 
        src={`/ratings/esrb/esrb_${ratingCode}.webp`} 
        alt={ratingCode} 
        title={`ESRB ${ratingCode.toUpperCase()}`}
        style={{ 
          height: '100%',
          width: 'auto',
          display: 'block'
        }}
      />
    );
  }

  // USK Ratings
  if (ratingUpper.includes('USK')) {
    const age = ratingUpper.match(/\d+/);
    if (age) {
      return (
        <img 
          src={`/ratings/usk/usk_${age[0]}.webp`} 
          alt={`USK ${age[0]}`} 
          title={`USK ${age[0]}`}
          style={{ 
            height: '100%',
            width: 'auto',
            display: 'block'
          }}
        />
      );
    }
  }

  // ACB Ratings
  if (ratingUpper.includes('ACB')) {
    let ratingCode = ratingUpper.replace('ACB_', '').toLowerCase();
    return (
      <img 
        src={`/ratings/acb/acb_${ratingCode}.webp`} 
        alt={ratingCode} 
        title={`ACB ${ratingCode.toUpperCase()}`}
        style={{ 
          height: '100%',
          width: 'auto',
          display: 'block'
        }}
      />
    );
  }

  // CERO Ratings
  if (ratingUpper.includes('CERO')) {
    let ratingCode = ratingUpper.replace('CERO_', '').toLowerCase();
    if (['a', 'b', 'c', 'd', 'z'].includes(ratingCode)) {
      return (
        <img 
          src={`/ratings/cero/cero_${ratingCode}.webp`} 
          alt={`CERO ${ratingCode.toUpperCase()}`} 
          title={`CERO ${ratingCode.toUpperCase()}`}
          style={{ 
            height: '100%',
            width: 'auto',
            display: 'block'
          }}
        />
      );
    }
  }

  // BBFC Ratings
  if (ratingUpper.includes('BBFC')) {
    let ratingCode = ratingUpper.replace('BBFC_', '').toLowerCase();
    if (['u', 'pg', '12', '12a', '15', '18', 'r18'].includes(ratingCode)) {
      return (
        <img 
          src={`/ratings/bbfc/bbfc_${ratingCode}.webp`} 
          alt={`BBFC ${ratingCode.toUpperCase()}`} 
          title={`BBFC ${ratingCode.toUpperCase()}`}
          style={{ 
            height: '100%',
            width: 'auto',
            display: 'block'
          }}
        />
      );
    }
  }

  // If no icon is available, return the text
  return rating;
};

export default RatingIcon; 