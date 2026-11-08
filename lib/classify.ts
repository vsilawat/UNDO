export interface Classification {
  scamType: string;
  confidence: number;
  isScam: boolean;
  redFlags: string[];
  nextSteps: string[];
}

/** Rules-only baseline: no message is sent to an external model. */
export function classify(message: string): Classification {
  const text = message.toLowerCase();
  const redFlags: string[] = [];
  if (/gift\s?cards?|wire|zelle|venmo|bitcoin|crypto/.test(text))
    redFlags.push("Requests a hard-to-reverse payment");
  if (/urgent|act now|final notice|within \d+\s?(?:hours?|minutes?)|suspend|locked|unusual activity/.test(text))
    redFlags.push("Creates urgency or threatens a consequence");
  if (/\bverify\b/.test(text))
    redFlags.push("Asks you to verify details through this message");
  if (/\b(?:code|otp|password|ssn|social security)\b/.test(text))
    redFlags.push("Requests a security code or private credential");
  if (/https?:\/\/|bit\.ly|tinyurl|click here|tap (?:this )?link/.test(text))
    redFlags.push("Directs you to a link instead of an official channel");
  if (/\b(?:irs|bank|usps|fedex|t-mobile|support team)\b/.test(text) && redFlags.length)
    redFlags.push("Claims to represent a trusted organization");

  const scamType = /\b(?:irs|tax|social security)\b/.test(text)
    ? "Government impersonation"
    : /\b(?:bank|account|card|zelle)\b/.test(text)
      ? "Bank impersonation"
      : /\b(?:package|delivery|usps|fedex)\b/.test(text)
        ? "Delivery scam"
        : redFlags.length ? "Phishing" : "unknown";

  if (redFlags.length >= 2) {
    return {
      scamType,
      confidence: Math.min(0.7 + redFlags.length * 0.06, 0.97),
      isScam: true,
      redFlags,
      nextSteps: ["Do not reply or open the link.", "Contact the organization using a number or website you already trust.", "If you shared information or sent money, complete the scope check below."],
    };
  }
  if (redFlags.length === 1) {
    return {
      scamType,
      confidence: 0.55,
      isScam: true,
      redFlags,
      nextSteps: ["This message is uncertain. Do not use its links or phone numbers.", "Verify it through the organization's official app or a known number."],
    };
  }
  // No signals is not proof of legitimacy; recognize only narrow routine notices.
  const routine = /(?:your package was delivered|appointment is confirmed|receipt for your purchase)/.test(text);
  return {
    scamType: routine ? "none" : "unknown",
    confidence: routine ? 0.72 : 0.5,
    isScam: !routine,
    redFlags: routine ? [] : ["No clear scam signals; unable to verify the sender"],
    nextSteps: routine
      ? ["No immediate action is indicated. Check the official account if you want to confirm."]
      : ["This message is uncertain. Verify it using a trusted channel before acting."],
  };
}
