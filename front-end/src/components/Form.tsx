import React, { useState } from 'react';
import './form.css';

export interface JobOffer {
	id?: string;
	title?: string;
	description?: string;
	price?: number;
	location?: string;
}

interface FormProps {
	selectedOffer: JobOffer;
	onClose: () => void;
}

const Form: React.FC<FormProps> = ({ selectedOffer, onClose }) => {
	const [cvFile, setCvFile] = useState<File | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
	});
	const [isFormSubmitted, setIsFormSubmitted] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [isFormVisible, setIsFormVisible] = useState(true);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prevData => ({ ...prevData, [name]: value }));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setCvFile(e.target.files[0]);
		}
	};

	const handleClose = () => {
		setIsFormVisible(false);
		setTimeout(() => {
			setFormData({ name: '', email: '' });
			setCvFile(null);
			setIsFormSubmitted(false);
			setIsSuccess(false);
			setIsFormVisible(true);
			onClose();
		}, 0); 
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name || !formData.email) {
			alert('Proszę wypełnić wszystkie pola formularza.');
			return;
		}

		const dataToSend = new FormData();
		if (formData.name) {
			dataToSend.append('name', formData.name);
		}
		if (formData.email) {
			dataToSend.append('email', formData.email);
		}
		if (selectedOffer.id) {
			dataToSend.append('selectedOfferId', selectedOffer.id);
		}
		if (selectedOffer.title) {
			dataToSend.append('selectedOfferTitle', selectedOffer.title);
		}
		if (selectedOffer.location) {
			dataToSend.append('selectedOfferLocation', selectedOffer.location);
		}
		if (cvFile) {
			dataToSend.append('cv', cvFile, cvFile.name);
		}

		try {
			const response = await fetch('https://jobboard-fyzl.onrender.com/api/sendEmail', {
				method: 'POST',
				body: dataToSend,
			});
			if (!response.ok) {
				throw new Error(`Network response was not ok - Status: ${response.status}, Message: ${response.statusText}`);
			}
			const data = await response.json();
			setIsFormSubmitted(true);
			setIsSuccess(true);
			// setIsFormVisible(false); // Remove this line to keep the form visible after successful submission
		} catch (error) {
			console.error('Błąd podczas wysyłania formularza:', error);
			setIsFormSubmitted(true);
			setIsSuccess(false);
		}
	};

	return (
		<div className='formContainer'>
			{isFormVisible && !isFormSubmitted ? (
				<>
					<button className='closeButton' onClick={handleClose}>
						Zamknij
					</button>
					<form onSubmit={handleSubmit}>
						<div>
							<label htmlFor='name'>Imię i nazwisko:</label>
							<input type='text' id='name' name='name' value={formData.name} onChange={handleChange} />
						</div>
						<div>
							<label htmlFor='email'>Adres e-mail:</label>
							<input type='email' id='email' name='email' value={formData.email} onChange={handleChange} />
						</div>
						<div>
							<label>Wybrana oferta:</label>
							<p>{selectedOffer.title}</p>
						</div>
						<div>
							<label>Lokacja oferty:</label>
							<p>{selectedOffer.location}</p>
						</div>
						<div>
							<label htmlFor='cv'>CV (plik PDF):</label>
							<input type='file' id='cv' name='cv' accept='.pdf' onChange={handleFileChange} />
						</div>
						<button type='submit'>Wyślij</button>
					</form>
				</>
			) : (
				<div className='responseMessage'>
					{isSuccess ? <p>Formularz został pomyślnie wysłany!</p> : <p>Wystąpił błąd podczas wysyłania formularza.</p>}
					<button className='closeButton' onClick={handleClose}>
						Zamknij
					</button>
				</div>
			)}
		</div>
	);
};

export default Form;
