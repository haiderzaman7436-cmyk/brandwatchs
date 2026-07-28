require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// ✅ CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

/* ================= EMAIL CONFIG ================= */

// 🔥 FINAL WORKING TRANSPORTER
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.replace(/\s+/g, ""), // remove spaces
  },
});

// 🔥 VERIFY CONNECTION
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ Email server is ready");
  }
});

/* ================= EMAIL FUNCTION ================= */

const sendOrderEmails = async (orderDetails) => {
  const { customerEmail, customerName, phone, address, items, total, orderId } = orderDetails;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    /* SIMPLE RESET */
    body, table, td, p {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    
    /* MOBILE */
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .block { display: block !important; width: 100% !important; }
      .text-center { text-align: center !important; }
      .pl-0 { padding-left: 0 !important; }
      .pr-0 { padding-right: 0 !important; }
      .mb-15 { margin-bottom: 15px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:20px; background:#f4f4f4;">

  <!-- CONTAINER -->
  <table class="container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:0 auto; background:#ffffff;">
    <tr>
      <td style="padding:30px 20px; text-align:center; background:#000;">
        <h1 style="margin:0; color:#fff; font-size:28px;">LIORO</h1>
        <p style="margin:5px 0 0; color:#ccc; font-size:12px;">Premium Lifestyle</p>
      </td>
    </tr>
    
    <tr>
      <td style="padding:30px 20px;">
        <h2 style="margin:0 0 10px; font-size:22px;">Thank You, ${customerName}!</h2>
        <p style="margin:0 0 20px; color:#666;">Your order has been placed successfully.</p>
        
        <!-- ORDER INFO -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9f9; border-radius:8px; margin-bottom:20px;">
          <tr>
            <td style="padding:15px;">
              <p style="margin:0 0 5px;"><strong>Order #:</strong> ${orderId.slice(-8)}</p>
              <p style="margin:5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p style="margin:5px 0 0;"><strong>Payment:</strong> Cash on Delivery</p>
            </td>
          </tr>
        </table>
        
        <!-- CUSTOMER & SHIPPING -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td class="block" width="50%" style="padding-right:10px; vertical-align:top;" class="pr-0">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9f9; border-radius:8px; margin-bottom:15px;" class="mb-15">
                <tr>
                  <td style="padding:15px;">
                    <h3 style="margin:0 0 10px; font-size:14px;">CUSTOMER</h3>
                    <p style="margin:0 0 5px;"><strong>${customerName}</strong></p>
                    <p style="margin:5px 0; color:#666; font-size:13px;">${customerEmail}</p>
                    <p style="margin:5px 0 0; color:#666; font-size:13px;">${phone}</p>
                  </td>
                </tr>
              </table>
            </td>
            
            <td class="block" width="50%" style="padding-left:10px; vertical-align:top;" class="pl-0">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9f9f9; border-radius:8px;">
                <tr>
                  <td style="padding:15px;">
                    <h3 style="margin:0 0 10px; font-size:14px;">SHIPPING</h3>
                    <p style="margin:0; color:#666; font-size:13px;">
                      ${customerName}<br>
                      ${address.replace(/\n/g, '<br>')}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- ITEMS -->
        <h3 style="margin:20px 0 10px; font-size:16px;">Order Items</h3>
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #eee;">
          ${items.map(i => `
          <tr>
            <td style="padding:15px 0; border-bottom:1px solid #eee;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="60" style="vertical-align:middle;">
                    <img src="${i.image || 'https://via.placeholder.com/50'}" width="50" height="50" style="display:block; border-radius:4px;">
                  </td>
                  <td style="padding-left:10px; vertical-align:middle;">
                    <p style="margin:0 0 3px; font-weight:bold;">${i.name}</p>
                    <p style="margin:0; color:#666; font-size:12px;">Qty: ${i.quantity}</p>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <p style="margin:0; font-weight:bold;">₨ ${(i.price * i.quantity).toLocaleString()}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `).join('')}
        </table>
        
        <!-- TOTAL -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
          <tr>
            <td style="padding:10px 0; border-top:2px solid #000;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td><strong>Subtotal</strong></td>
                  <td align="right">₨ ${total.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;"><strong>Shipping</strong></td>
                  <td align="right" style="color:green;">FREE</td>
                </tr>
                <tr>
                  <td style="padding-top:10px;"><strong style="font-size:18px;">TOTAL</strong></td>
                  <td align="right" style="padding-top:10px;"><strong style="font-size:20px;">₨ ${total.toLocaleString()}</strong></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- BUTTON -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;">
          <tr>
            <td align="center">
              <a href="http://localhost:8080/shop/orders" style="display:inline-block; background:#000; color:#fff; padding:12px 25px; border-radius:4px; text-decoration:none; font-weight:bold;">VIEW ORDER</a>
            </td>
          </tr>
        </table>
        
       
    
    <!-- FOOTER -->
    <tr>
      <td style="padding:20px; text-align:center; background:#f9f9f9; border-top:1px solid #ddd;">
        <p style="margin:0; color:#666; font-size:11px;">© ${new Date().getFullYear()} Lioro. All rights reserved.</p>
      </td>
    </tr>
  </table>
  
</body>
</html>
`;

  try {
    // ✅ CUSTOMER EMAIL
    await transporter.sendMail({
      from: `"Lioro" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order Confirmation #${orderId}`,
      html,
    });

    console.log("✅ Customer email sent");

    // ✅ ADMIN EMAIL
    await transporter.sendMail({
      from: `"Lioro" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Order #${orderId}`,
      html,
    });

    console.log("✅ Admin email sent");

    return true;
  } catch (error) {
    console.log("❌ EMAIL ERROR:", error.message);
    return false;
  }
};

/* ================= ROUTES ================= */

// 🔥 MAIN ORDER ROUTE
app.post("/confirm-order", async (req, res) => {
  try {
    console.log("🔍 Incoming order:", req.body);

    const orderDetails = req.body;

    if (!orderDetails.customerEmail) {
      return res.status(400).json({ error: "Email required" });
    }

    const success = await sendOrderEmails(orderDetails);

    res.json({
      success,
      message: success ? "Emails sent" : "Email failed",
    });

  } catch (error) {
    console.log("❌ SERVER ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 🔥 TEST EMAIL ROUTE
app.get("/send-test", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "Your email system is working!",
    });

    res.send("✅ Test email sent");
  } catch (err) {
    console.log("❌ TEST ERROR:", err);
    res.send("❌ Test failed");
  }
});

/* ================= START SERVER ================= */

const PORT = 5000;

app.listen(PORT, () => {
  console.log("\n🚀 Server running on http://localhost:" + PORT);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("❌ EMAIL NOT CONFIGURED");
  } else {
    console.log("✅ Email configured:", process.env.EMAIL_USER);
  }
});