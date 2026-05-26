export function sellerDecisionEmailTemplate(
  status: "approved" | "rejected",
  userName: string
) {
  const isApproved = status === "approved";

  const subject = isApproved
    ? "🎉 Seller Application Approved"
    : "❌ Seller Application Rejected";

  const title = isApproved
    ? "Welcome to Your Seller Dashboard!"
    : "Seller Application Update";

  const message = isApproved
    ? `
      Congratulations ${userName}! 🎉

      Your seller application has been approved.
      You can now start listing your products and managing your store.

      Welcome aboard!
    `
    : `
      Hello ${userName},

      Unfortunately, your seller application was not approved at this time.

      You may review your details and reapply later.
      Keep improving — we’re rooting for you.
    `;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: auto; background: #fff; padding: 25px; border-radius: 10px;">

        <h2 style="color: ${isApproved ? "#16a34a" : "#dc2626"};">
          ${title}
        </h2>

        <p>${message.replace(/\n/g, "<br/>")}</p>

        ${
          isApproved
            ? `<p><b>Next Step:</b> Go to your seller dashboard and set up your store 🚀</p>`
            : `<p><b>Tip:</b> Improve your application and try again later.</p>`
        }

        <hr />

        <p style="font-size: 12px; color: gray;">
          Mournix E-commerce Team
        </p>
      </div>
    </div>
  `;

  return { subject, html };
}