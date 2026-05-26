export function welcomeEmailTemplate(userName:string){
    const subject = "Welcome to Mournix E-commerce!";
    const html = `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 12px;">

    <h2 style="color: #111;">Welcome to Mournix 👋</h2>

    <p>Hi <b>${userName}</b>,</p>

    <p>
      Your account has been created successfully 🎉  
      You're now part of a growing marketplace where you can explore, shop, and even become a seller.
    </p>

    <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px;">
      <p style="margin: 0;"><b>What you can do next:</b></p>
      <ul style="padding-left: 20px;">
        <li>Browse and discover products 🛍️</li>
        <li>Apply to become a seller 🏪</li>
        <li>Manage your profile ⚙️</li>
      </ul>
    </div>

    <p>
      We're excited to have you on board. If you ever need help, feel free to reach out.
    </p>

    <hr style="margin: 25px 0;" />

    <p style="font-size: 12px; color: gray;">
      Mournix E-commerce Team ❤️  
      Building the future of online shopping
    </p>

  </div>
</div>`
return{subject, html}
}