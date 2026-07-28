require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : "MISSING");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.replace(/\s+/g, ''),
  },
});

async function test() {
  try {
    console.log("Sending test email...");
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test",
      text: "Hello"
    });
    console.log("✅ Email sent!");
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

test();