'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const nodemailer_1 = __importDefault(require('nodemailer'));
const cors_1 = __importDefault(require('cors'));
const dotenv_1 = __importDefault(require('dotenv'));
const multer_1 = __importDefault(require('multer'));
dotenv_1.default.config(); // Load environment variables from .env file
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use(express_1.default.json());
app.use((0, cors_1.default)()); // Add CORS middleware to the server
// Prepare transporter for sending emails using Gmail
const transporter = nodemailer_1.default.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
});
// Create a multer instance to handle file uploads
const upload = (0, multer_1.default)();
// Allow Cross-Origin Resource Sharing (CORS)
app.use((0, cors_1.default)());
// Endpoint for handling form submissions and sending emails
app.post('/api/sendEmail', upload.single('cv'), (req, res) => {
	const { name, email, selectedOfferId } = req.body;
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: process.env.RECIPIENT_EMAIL,
		subject: 'Nowy formularz od: ' + name,
		text: `Wiadomość od: ${name}\nE-mail: ${email} Selected-Offer ID: ${selectedOfferId}`,
		attachments: [], // Initialize an array to hold attachments (if any)
	};
	if (req.file) {
		// Add the CV attachment to the mailOptions
		mailOptions.attachments.push({
			filename: req.file.originalname,
			content: req.file.buffer, // Use the file buffer directly
		});
	}
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error('Błąd podczas wysyłania e-maila:', error);
			res.status(500).json({ success: false, message: 'Błąd podczas wysyłania e-maila' });
		} else {
			console.log('E-mail został wysłany:', info.response);
			// Since the buffer is already attached to the email, no need to clean up the buffer
			res.json({ success: true, message: 'E-mail został pomyślnie wysłany' });
		}
	});
});
app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`);
});
