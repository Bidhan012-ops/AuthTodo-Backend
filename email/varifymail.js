const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const { base } = require("../model/userModel");
dotenv.config();
const sendVerifyMail = async (email, token) => {
const client = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user:process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});
const dirPath = path.join(__dirname, 'emailformat.ejs');
const htmlTOsend= await ejs.renderFile(dirPath, {token:token,baseUrl:process.env.FRONTEND_URL});
client.sendMail(
    {
        from: "berabidhan98@gmail.com",
        to: email,
        subject: "Verify your email",
        html: htmlTOsend
    }
)
}
module.exports = sendVerifyMail;
