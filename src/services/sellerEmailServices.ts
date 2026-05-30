import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};
export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams): Promise<void> {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_EMAIL_SENDER as string,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message);
    }

    console.log("Email sent:", data);
  
}