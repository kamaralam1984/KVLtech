// MSG91 SMS Integration
// Setup: msg91.com > Account > API Key
// Add to .env: MSG91_AUTH_KEY=your_key, MSG91_SENDER_ID=KVLTCH, MSG91_TEMPLATE_ID=your_template_id

async function sendMsg91(phone: string, message: string): Promise<boolean> {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) {
    console.warn("MSG91_AUTH_KEY not set — SMS skipped");
    return false;
  }

  // Normalize phone (remove +91, spaces)
  const mobile = phone.replace(/\D/g, "").slice(-10);

  try {
    const res = await fetch("https://api.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: authKey,
      },
      body: JSON.stringify({
        template_id: process.env.MSG91_TEMPLATE_ID || "",
        sender: process.env.MSG91_SENDER_ID || "KVLTCH",
        short_url: "0",
        mobiles: `91${mobile}`,
        VAR1: message,
      }),
    });
    const data = await res.json();
    return data.type === "success";
  } catch (err) {
    console.error("SMS send failed:", err);
    return false;
  }
}

export async function sendOrderConfirmationSMS(phone: string, name: string, orderNumber: string) {
  const message = `Namaste ${name} ji! Aapka order ${orderNumber} confirm ho gaya hai. Track karein: kvlbusinesssolutions.com/client-portal - KVL TECH`;
  return sendMsg91(phone, message);
}

export async function sendOrderStatusSMS(phone: string, name: string, orderNumber: string, status: string) {
  const statusMap: Record<string, string> = {
    DESIGN_STARTED: "Design shuru ho gayi",
    DEVELOPMENT: "Development phase mein",
    REVIEW_TESTING: "Review & Testing phase",
    DELIVERED: "Deliver ho gaya",
  };
  const label = statusMap[status] || status;
  const message = `Namaste ${name} ji! Order ${orderNumber} update: ${label}. Details: kvlbusinesssolutions.com/client-portal - KVL TECH`;
  return sendMsg91(phone, message);
}
