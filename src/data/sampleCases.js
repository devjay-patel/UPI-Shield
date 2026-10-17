/**
 * Synthetic Demo Cases for Cyber Samvad 2026 Hackathon (Team ThreatZero).
 * All test cases run dynamically through the real risk engine.
 */
export const SAMPLE_CASES = [
  {
    id: "case-1",
    title: "1. Normal Payment (Grocery)",
    badge: "Normal",
    description: "Routine grocery store payment to saved contact.",
    input: {
      type: "pay",
      recipientName: "Ramesh Kirana Store",
      upiId: "ramesh.store@okbank",
      amount: "250",
      message: "Groceries payment",
      link: ""
    },
    expectedLevel: "LOW INDICATED RISK",
    expectedAction: "Looks okay – still confirm the name and amount before paying."
  },
  {
    id: "case-2",
    title: "2. Fake Collect / Cashback Scam",
    badge: "Suspicious",
    description: "Collect request claiming to give cashback if PIN is entered.",
    input: {
      type: "collect",
      recipientName: "Cashback Team",
      upiId: "cashback.rewards786@upi",
      amount: "4999",
      message: "Congratulations! Approve this request and enter your UPI PIN to receive your cashback. Urgent, expires in 5 minutes.",
      link: ""
    },
    expectedLevel: "VERY HIGH RISK",
    expectedAction: "Do not share your PIN"
  },
  {
    id: "case-3",
    title: "3. KYC Link + Impersonation",
    badge: "Suspicious",
    description: "Fake bank threat claiming KYC expiration with shortener link.",
    input: {
      type: "pay",
      recipientName: "Bank Support",
      upiId: "support.kyc@xyz",
      amount: "10",
      message: "Dear customer, your bank KYC is expired. Your account will be blocked today. Click http://bit.ly/kyc-update-now and pay Rs 10 to verify.",
      link: "http://bit.ly/kyc-update-now"
    },
    expectedLevel: ["HIGH RISK", "VERY HIGH RISK"],
    expectedAction: "Pause and verify"
  },
  {
    id: "case-4",
    title: "4. Prize Fee Scam",
    badge: "Suspicious",
    description: "Demanding processing fee upfront to claim lottery prize.",
    input: {
      type: "pay",
      recipientName: "Prize Department",
      upiId: "lottery.claim99@okhdfc",
      amount: "500",
      message: "Congratulations! You won Rs 20,000. Pay a processing fee now to receive your prize.",
      link: ""
    },
    expectedLevel: ["HIGH RISK", "VERY HIGH RISK"],
    expectedAction: "Pause and verify"
  },
  {
    id: "case-5",
    title: "5. QR Receive-Money Trick",
    badge: "Suspicious",
    description: "QR payload masquerading as payment reception trick.",
    input: {
      type: "pay",
      qrPayload: "upi://pay?pa=buyer.refund99@xyz&pn=Refund%20Desk&am=2000&cu=INR",
      qrDescription: "Scan this and enter PIN to receive Rs 2000",
      message: "",
      link: ""
    },
    expectedLevel: "VERY HIGH RISK",
    expectedAction: "Do not share your PIN"
  },
  {
    id: "case-6",
    title: "6. Educational Cyber Safety Message",
    badge: "Educational",
    description: "Legitimate safety advice mentioning PIN with negation words.",
    input: {
      type: "pay",
      recipientName: "Cyber Awareness Team",
      upiId: "awareness@okaxis",
      amount: "",
      message: "Never share your UPI PIN or OTP. You do not need to enter your PIN to receive money.",
      link: ""
    },
    expectedLevel: "LOW INDICATED RISK",
    expectedAction: "Looks okay – still confirm the name and amount before paying.",
    isEducationalExpected: true
  },
  {
    id: "case-7",
    title: "7. Unknown Recipient Check",
    badge: "Caution / Verify",
    description: "Payment to unknown contact without any scam vocabulary.",
    input: {
      type: "pay",
      recipientName: "Random Contact",
      upiId: "newuser9876@okaxis",
      amount: "800",
      message: "A new contact asked for Rs 800. Please verify the recipient and the reason before approving.",
      link: ""
    },
    expectedLevel: ["LOW INDICATED RISK", "CAUTION"],
    expectedAction: "Check recipient details"
  },
  {
    id: "case-8",
    title: "8. Hinglish Urgency Scam",
    badge: "Suspicious",
    description: "Vernacular high-pressure refund scam with threat of account lock.",
    input: {
      type: "pay",
      recipientName: "Customer Helpline",
      upiId: "refund.desk321@okbank",
      amount: "1500",
      message: "Turant pin daalo, aapka refund milega, warna account band ho jayega.",
      link: ""
    },
    expectedLevel: "VERY HIGH RISK",
    expectedAction: "Do not share your PIN"
  }
];
