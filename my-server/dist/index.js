"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
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
const upload = (0, multer_1.default)();
app.post('/api/sendEmail', upload.single('cv'), (req, res) => {
    const { name, email, selectedOfferId } = req.body;
    if (!name || !email || !selectedOfferId) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }
    const mailOptions = {
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
        }
        else {
            console.log('E-mail został wysłany:', info.response);
            res.json({ success: true, message: 'E-mail został pomyślnie wysłany' });
        }
    });
});
app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
});
