import express, { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import multer, { Multer } from 'multer';
import { body, validationResult } from 'express-validator';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

const allowedOrigins = ['http://localhost:3000', 'https://jobboard-fyzl.onrender.com'];
const corsOptions: cors.CorsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
};
app.use(cors(corsOptions));

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

interface Attachment {
	filename: string;
	content: Buffer;
	contentType: string;
}

const upload: Multer = multer();

app.post(
	'/api/sendEmail',
	upload.single('cv'),
	[
		body('name').notEmpty().withMessage('Imię i nazwisko jest wymagane.'),
		body('email').isEmail().withMessage('Podaj prawidłowy adres e-mail.'),
		body('selectedOfferId').notEmpty().withMessage('Nieprawidłowy identyfikator oferty.'),
		body('selectedOfferTitle').notEmpty().withMessage('Nieprawidłowy tytuł oferty.'),
		body('selectedOfferLocation').notEmpty().withMessage('Nieprawidłowa lokalizacja oferty.'),
	],
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ success: false, message: errors.array() });
		}

		const { name, email, selectedOfferId, selectedOfferTitle, selectedOfferLocation } = req.body;

		const mailOptions: nodemailer.SendMailOptions & { attachments: Attachment[] } = {
			from: process.env.EMAIL_USER,
			to: process.env.RECIPIENT_EMAIL,
			subject: 'Nowy formularz od: ' + name,
			text: `Wiadomość od: ${name}\nE-mail: ${email}\nSelected-Offer ID: ${selectedOfferId}\nSelected-Offer Title: ${selectedOfferTitle}\nSelected-Offer Location: ${selectedOfferLocation}`,
			attachments: [],
		};

		if (req.file) {
			const allowedMimeTypes = ['application/pdf'];
			const fileMimeType = req.file.mimetype;
			const isMimeTypeAllowed = allowedMimeTypes.includes(fileMimeType);

			if (!isMimeTypeAllowed) {
				return res.status(400).json({ success: false, message: 'Dozwolony tylko plik PDF.' });
			}

			const fileSize = req.file.size;
			if (fileSize > 10 * 1024 * 1024) {
				return res.status(400).json({ success: false, message: 'Maksymalny rozmiar załącznika to 10MB.' });
			}

			mailOptions.attachments.push({
				filename: req.file.originalname,
				content: req.file.buffer,
				contentType: fileMimeType,
			});
		}

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error('Błąd podczas wysyłania e-maila:', error);
				res.status(500).json({ success: false, message: 'Błąd podczas wysyłania e-maila' });
			} else {
				console.log('E-mail został wysłany:', info.response);
				res.json({ success: true, message: 'E-mail został pomyślnie wysłany' });
			}
		});
	}
);

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error('Błąd:', err);
	res.status(500).json({ success: false, message: 'Wystąpił błąd serwera.' });
});

app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`);
});
