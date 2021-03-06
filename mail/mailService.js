const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendMail = (mailContent) => {
  let Mail = {};
  Mail.from = process.env.EMAIL;
  Mail.to = mailContent.to;
  Mail.subject = mailContent.subject;
  if (mailContent.text) Mail.text = mailContent.text;
  if (mailContent.html)
    Mail.html = mailContent.html + "<p>Jaed Developers Team</p>";
  const mailOptions = Mail;
  try {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) throw error;
      return info.response;
    });
  } catch(err) {
    console.error(err)
  }
};

module.exports = { sendMail };
