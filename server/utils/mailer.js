const nodemailer = require("nodemailer");

let transporter;

const parseBoolean = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  return undefined;
};

const getTransportOptions = () => {
  const service = process.env.SMTP_SERVICE?.trim();
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = parseBoolean(process.env.SMTP_SECURE) ?? port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;

  if ((!service && !host) || !user || !pass) {
    throw new Error(
      "Email delivery is not configured. Set SMTP_SERVICE or SMTP_HOST plus SMTP_USER and SMTP_PASS."
    );
  }

  return {
    ...(service ? { service } : { host, port }),
    secure,
    auth: {
      user,
      pass,
    },
  };
};

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport(getTransportOptions());
  }

  return transporter;
};

const getFromAddress = () =>
  process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim();

exports.sendPasswordResetOtpEmail = async ({ to, otp, role }) => {
  const transporterInstance = getTransporter();
  const portalLabel = role === "admin" ? "admin" : "student";
  const from = getFromAddress();

  if (!from) {
    throw new Error(
      "Email delivery is not configured. Set SMTP_FROM or SMTP_USER before sending OTP emails."
    );
  }

  await transporterInstance.sendMail({
    from,
    to,
    subject: `LMS ${portalLabel} password reset OTP`,
    text: `Your LMS ${portalLabel} password reset OTP is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">LMS Password Reset</h2>
        <p>Your one-time password for the ${portalLabel} portal is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">
          ${otp}
        </p>
        <p>This OTP expires in 10 minutes.</p>
        <p>If you did not request this reset, you can ignore this email.</p>
      </div>
    `,
  });
};
