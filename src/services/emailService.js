export async function sendMockEmail(toEmail, subject, message) {
    await new Promise(res => setTimeout(res, 100));
    console.log(`[MOCK EMAIL ALERT]`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${message}\n`);
}
  