var nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const { SEND_GRID_API_KEY, ADMIN_SEND_GRID_EMAIL } = require('./config');

const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key: SEND_GRID_API_KEY,
    },
  })
);

const htmlContent = ` <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
        <h2
          style="text-align: center; text-transform: uppercase;color: teal;
            "
        >
          Welcome to Codding With Saddam.
        </h2>

        <div style=" font-size: 1.3rem ">
          <p>Congratulations! You successfully signed up to Saddam App!</p>
          <p> click the button below to flow Saddam on Gitub </p>

          <a
            href="https://github.com/saddamarbaa"
            style="background: crimson; text-decoration: none; color: white; padding: 10px 30px; margin: 10px 0; display: inline-block;  border-radius: 6px;"
          >
            Follow Me
          </a>
        </div>
      </div>`;

const sendEmail = (userEmail) => {
  const emailContent = {
    from: ADMIN_SEND_GRID_EMAIL,
    to: userEmail,
    subject: 'Signup succeeded!',
    html: htmlContent,
  };

  transporter.sendMail(emailContent, function (err, info) {
    if (err) {
      console.log('Sending Email error:', error);
    } else {
      console.log(`Successfully  send email to ${userEmail}...`);
    }
  });
};

module.exports = sendEmail;
