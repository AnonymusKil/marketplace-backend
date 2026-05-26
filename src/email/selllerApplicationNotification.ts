export function sellerApplicationNotificationTemplate(userName: string){
    const subject = "Seller Application Received";
    const html = `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px;">

        <h2 style="color: #333;">Seller Application Received</h2>

        <p>Dear <b>${userName}</b>,</p>

        <p>
          Thank you for applying to become a seller on our platform.
          Your application is currently under review.
        </p>

        <p>
          We will notify you once a decision has been made.
        </p>

        <hr />

        <p style="font-size: 12px; color: gray;">
          Best regards,<br/>
         Mournix E-commerce Team
        </p>
      </div>
    </div>`;


  return { subject, html };
}