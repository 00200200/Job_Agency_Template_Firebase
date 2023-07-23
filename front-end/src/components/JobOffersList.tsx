import React, { useEffect, useState } from 'react';
import db from '../firebase/firebaseConfig';
import { collection, QuerySnapshot, onSnapshot, DocumentData } from 'firebase/firestore';
import './jobofferslist.css';
import Form, { JobOffer } from './Form';

const JobOffersList: React.FC = () => {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'jobOffers'), (snapshot: QuerySnapshot<DocumentData>) => {
      const offers: JobOffer[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setJobOffers(offers);
    });
    return () => unsubscribe();
  }, []);

  const handleApplyClick = (offer: JobOffer) => {
    setSelectedOffer(offer);
  };

  const handleCloseForm = () => {
    setSelectedOffer(null);
  };

  return (
    <div className='jobOffersContainer'>
      <h2>Oferty pracy</h2>
      {jobOffers.map(offer => (
        <div className='jobOfferCard' key={offer.id}>
          <h3>{offer.title}</h3>
          <p>{offer.description}</p>
          <p>Cena: {offer.price}</p>
          <p>Miejsce pracy: {offer.location}</p>
          <button className='button' onClick={() => handleApplyClick(offer)}>
            Aplikuj
          </button>
        </div>
      ))}
      {selectedOffer && <Form selectedOffer={selectedOffer} onClose={handleCloseForm} />}
    </div>
  );
};

export default JobOffersList;
