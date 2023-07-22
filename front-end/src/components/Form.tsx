import React, { useState } from 'react';
import './form.css';
import { JobOffer } from './JobOffersList';

interface FormProps {
	selectedOffer: JobOffer; 
}

const Form: React.FC<FormProps> = ({ selectedOffer }) => {
	const [cvFile, setCvFile] = useState<File | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
	});
	const [isFormSubmitted, setIsFormSubmitted] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

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
		setFormData({ name: '', email: '' });
		setCvFile(null);
		setIsFormSubmitted(false);
		setIsSuccess(false);
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
		if (cvFile) {
			dataToSend.append('cv', cvFile, cvFile.name);
		}

		try {
			const response = await fetch('http://localhost:5000/api/sendEmail', {
				method: 'POST',
				body: dataToSend,
			});
			if (!response.ok) {
				throw new Error(`Network response was not ok - Status: ${response.status}, Message: ${response.statusText}`);
			}
			const data = await response.json();
			setIsFormSubmitted(true);
			setIsSuccess(true);
		} catch (error) {
			console.error('Błąd podczas wysyłania formularza:', error);
			setIsFormSubmitted(true);
			setIsSuccess(false);
		}
	};

	return (
		<div className='formContainer'>
			{!isFormSubmitted ? (
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
							<label htmlFor='cv'>CV (plik PDF):</label>
							<input type='file' id='cv' name='cv' accept='.pdf' onChange={handleFileChange} />
						</div>
						<button type='submit'>Wyślij</button>
					</form>
				</>
			) : (
				<div className='responseMessage'>
					{isSuccess ? <p>Formularz został pomyślnie wysłany!</p> : <p>Wystąpił błąd podczas wysyłania formularza.</p>}
				</div>
			)}
		</div>
	);
};

export default Form;
