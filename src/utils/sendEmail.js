import nodemailer from "nodemailer";
import logger from "./logger.js";

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.mailtrap.io",
    port: process.env.MAIL_PORT || 2525,
    auth: {
        user: process.env.MAIL_USER, // e.g. Mailtrap User
        pass: process.env.MAIL_PASS  // e.g. Mailtrap Pass
    }
});

const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: 'RuTube Support <support@rutube.com>',
            to,
            subject,
            html
        };

        const mailResponse = await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully to ${to}`);
        return mailResponse;
    } catch (error) {
        logger.error(`Failed to send email to ${to}: ${error.message}`);
        throw error; // Let the controller handle the error if it fails
    }
};

export { sendEmail };
