import nodemailer from "nodemailer";

export async function sendSellerApplicationEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to send email",
    );
  }
}
