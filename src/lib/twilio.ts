import twilio from 'twilio';

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const formatPhone = (phone: string) => {
  // Hilangkan 0 di depan dan tambahkan kode negara
  return `+62${phone.replace(/^0/, '')}`;
};

export const sendWhatsAppMess = async (to: string, message: string) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${formatPhone(to)}`
    });
    
    console.log('WhatsApp message sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

export const sendVerificationCode = async (to: string) => {
  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({
        to: formatPhone(to),
        channel: 'whatsapp'
      });
    
    console.log('Verification sent:', verification.status);
    return verification;
  } catch (error) {
    console.error('Error sending verification:', error);
    throw error;
  }
};

export const verifyCode = async (to: string, code: string) => {
  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({
        to: formatPhone(to),
        code: code
      });
    
    console.log('Verification check:', verification.status);
    return verification;
  } catch (error) {
    console.error('Error checking verification:', error);
    throw error;
  }
};
