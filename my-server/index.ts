import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import multer, { Multer } from 'multer';
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
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
const upload: Multer = multer();
interface Attachment {
	filename: string;
	content: Buffer;
}
app.post('/api/sendEmail', upload.single('cv'), (req: Request, res: Response) => {
	const { name, email, selectedOfferId } = req.body;

	if (!name || !email || !selectedOfferId) {
		return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
	}
	const mailOptions: nodemailer.SendMailOptions & { attachments: Attachment[] } = {
		from: process.env.EMAIL_USER,
		to: process.env.RECIPIENT_EMAIL,
		subject: 'Nowy formularz od: ' + name,
		text: `Wiadomość od: ${name}\nE-mail: ${email} Selected-Offer ID: ${selectedOfferId}`,
		attachments: [],
	};

	if (req.file) {
		mailOptions.attachments.push({
			filename: req.file.originalname,
			content: req.file.buffer,
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
});

app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`);
});
