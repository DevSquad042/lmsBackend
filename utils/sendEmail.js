import nodemailer from "nodemailer";

// Sends an email to a user with given subject and HTML content
const sendEmail = async (to, subject, html) => {
  // Set up Gmail transporter using credentials from .env
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define email details
  const mailOptions = {
    from: `"Byway" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;