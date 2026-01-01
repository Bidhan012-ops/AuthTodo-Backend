const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const { base } = require("../model/userModel");
dotenv.config();
const sendVerifyotp = async (email, otp) => {
const client = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user:process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});
const dirPath = path.join(__dirname, 'otpformat.ejs');
const htmlTOsend= await ejs.renderFile(dirPath, {otp:otp});
client.sendMail(
    {
        from: "berabidhan98@gmail.com",
        to: email,
        subject: "Verify your OTP",
        html: htmlTOsend
    }
)
}
module.exports = sendVerifyotp;
