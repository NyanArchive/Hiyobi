const nodemailer = require("nodemailer");

module.exports = class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "localhost",
      port: 25,
      secure: false, // true for 465, false for other ports
    });
  }

  async sendMail({ to, subject, html }) {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    var mailOptions = {
      from: '"hiyobi_noreply" <noreply@hiyobi.me>',
      to: to,
      subject: subject,
      text: html,
    };

    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error(error);
      }
    });
  }
};
