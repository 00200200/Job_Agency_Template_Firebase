"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const express_validator_1 = require("express-validator");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use(express_1.default.json());
// CORS Configuration
const allowedOrigins = ['http://localhost:3000'];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};
app.use((0, cors_1.default)(corsOptions));
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
app.post('/api/sendEmail', upload.single('cv'), [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Imię i nazwisko jest wymagane.'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Podaj prawidłowy adres e-mail.'),
    (0, express_validator_1.body)('selectedOfferId').notEmpty().withMessage('Nieprawidłowy identyfikator oferty.'),
    (0, express_validator_1.body)('selectedOfferTitle').notEmpty().withMessage('Nieprawidłowy tytuł oferty.'),
    (0, express_validator_1.body)('selectedOfferLocation').notEmpty().withMessage('Nieprawidłowa lokalizacja oferty.'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() });
    }
    const { name, email, selectedOfferId, selectedOfferTitle, selectedOfferLocation } = req.body;
    const mailOptions = {
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
        }
        else {
            console.log('E-mail został wysłany:', info.response);
            res.json({ success: true, message: 'E-mail został pomyślnie wysłany' });
        }
    });
}));
// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Błąd:', err);
    res.status(500).json({ success: false, message: 'Wystąpił błąd serwera.' });
});
app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
});
