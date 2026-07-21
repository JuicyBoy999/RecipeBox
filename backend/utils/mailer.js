const nodemailer = require("nodemailer");

let transporterPromise;

const getTransporter = () => {
  if (transporterPromise) return transporterPromise;

  if (process.env.EMAIL_HOST) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }),
    );
  } else {
    transporterPromise = nodemailer.createTestAccount().then((testAccount) =>
      nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }),
    );
  }

  return transporterPromise;
};

const sendPasswordResetEmail = async (to, resetLink) => {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: '"RecipeBox" <no-reply@recipebox.app>',
    to,
    subject: "Reset your RecipeBox password",
    html: `
      <p>We received a request to reset your RecipeBox password.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`Password reset email preview: ${previewUrl}`);
  }

  return info;
};

module.exports = { sendPasswordResetEmail };
