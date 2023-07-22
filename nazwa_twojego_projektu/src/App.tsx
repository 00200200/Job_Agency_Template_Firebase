import React from 'react';
import JobOffersList from './components/JobOffersList';

const App: React.FC = () => {
	return (
		<div>
			<h1>Agencja Pracy - Oferty Pracy</h1>
			<JobOffersList />
		</div>
	);
};

export default App;
