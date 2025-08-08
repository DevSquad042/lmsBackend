import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  console.log("Sending email to:", to);

  if (!to || typeof to !== "string" || to.trim() === "") {
    throw new Error("Recipient email is missing");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Byway" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
