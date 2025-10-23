import axios from 'axios';

const FONNTE_TOKEN = process.env.FONNTE_TOKEN!;
const FONNTE_API_URL = 'https://api.fonnte.com/send';

// Store OTP temporarily (gunakan Redis di production)
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

/**
 * Generate 6-digit OTP code
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via WhatsApp using Fonnte
 * @param phoneNumber - Format: 6285257510502 (tanpa +, tanpa -, tanpa spasi)
 */
export const sendWhatsAppOTP = async (phoneNumber: string) => {
  try {
    // Clean phone number (remove +, -, spaces)
    const cleanNumber = phoneNumber.replace(/[\+\-\s]/g, '');
    
    // Generate OTP
    const code = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 menit
    
    // Store OTP
    otpStore.set(cleanNumber, { code, expiresAt, attempts: 0 });
    
    // Prepare message
    const message = `🔐 *Kode Verifikasi Login*\n\n` +
                   `Kode Anda: *${code}*\n\n` +
                   `⏰ Berlaku selama 10 menit\n` +
                   `⚠️ Jangan bagikan kode ini kepada siapapun!`;
    
    // Send via Fonnte
    const response = await axios.post(
      FONNTE_API_URL,
      {
        target: cleanNumber,
        message: message,
        countryCode: '62', // Indonesia
      },
      {
        headers: {
          'Authorization': FONNTE_TOKEN,
        },
      }
    );
    
    console.log('✅ OTP sent to:', cleanNumber);
    console.log('Fonnte response:', response.data);
    
    return {
      success: true,
      message: 'OTP berhasil dikirim',
      data: response.data
    };
  } catch (error: any) {
    console.error('❌ Error sending OTP via Fonnte:', error.response?.data || error.message);
    
    // Handle specific Fonnte errors
    if (error.response?.status === 401) {
      throw new Error('Invalid Fonnte token');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid phone number format');
    }
    
    throw new Error('Gagal mengirim OTP');
  }
};

/**
 * Verify OTP code
 * @param phoneNumber - Format: 6285257510502
 * @param code - 6-digit OTP code
 */
export const verifyWhatsAppOTP = (phoneNumber: string, code: string) => {
  // Clean phone number
  const cleanNumber = phoneNumber.replace(/[\+\-\s]/g, '');
  
  const stored = otpStore.get(cleanNumber);
  
  if (!stored) {
    return { 
      valid: false, 
      message: 'Kode tidak ditemukan. Silakan kirim ulang.' 
    };
  }
  
  // Check expiration
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(cleanNumber);
    return { 
      valid: false, 
      message: 'Kode sudah kadaluarsa. Silakan kirim ulang.' 
    };
  }
  
  // Check attempts (max 3 attempts)
  if (stored.attempts >= 3) {
    otpStore.delete(cleanNumber);
    return { 
      valid: false, 
      message: 'Terlalu banyak percobaan. Silakan kirim ulang kode.' 
    };
  }
  
  // Verify code
  if (stored.code !== code.trim()) {
    stored.attempts += 1;
    otpStore.set(cleanNumber, stored);
    
    return { 
      valid: false, 
      message: `Kode salah. Sisa percobaan: ${3 - stored.attempts}` 
    };
  }
  
  // Success - delete OTP
  otpStore.delete(cleanNumber);
  console.log('✅ OTP verified for:', cleanNumber);
  
  return { 
    valid: true, 
    message: 'Verifikasi berhasil!' 
  };
};

/**
 * Resend OTP (with rate limiting)
 */
export const resendWhatsAppOTP = async (phoneNumber: string) => {
  const cleanNumber = phoneNumber.replace(/[\+\-\s]/g, '');
  
  // Check if there's an existing valid OTP
  const existing = otpStore.get(cleanNumber);
  if (existing && (Date.now() < existing.expiresAt)) {
    const remainingTime = Math.ceil((existing.expiresAt - Date.now()) / 1000);
    
    // Don't allow resend if less than 1 minute passed
    if (remainingTime > 540) { // 9 minutes remaining = less than 1 minute passed
      return {
        success: false,
        message: 'Mohon tunggu sebentar sebelum kirim ulang kode.'
      };
    }
  }
  
  // Send new OTP
  return await sendWhatsAppOTP(phoneNumber);
};

/**
 * Clear OTP for a phone number (for testing/debugging)
 */
export const clearOTP = (phoneNumber: string) => {
  const cleanNumber = phoneNumber.replace(/[\+\-\s]/g, '');
  otpStore.delete(cleanNumber);
  console.log('🗑️ OTP cleared for:', cleanNumber);
};

/**
 * send WhatsApp message (non-OTP)
 */
export const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
  try {
    const cleanNumber = phoneNumber.replace(/[\+\-\s]/g, '');
    
    const response = await axios.post(
      FONNTE_API_URL,
      {
        target: cleanNumber,
        message: message,
        countryCode: '62',
      },
      {
        headers: {
          'Authorization': FONNTE_TOKEN,
        },
      }
    );
    
    console.log('✅ Message sent to:', cleanNumber);
    console.log('Fonnte response:', response.data);
    
    return {
      success: true,
      message: 'Pesan berhasil dikirim',
      data: response.data
    };
  } catch (error: any) {
    console.error('❌ Error sending message via Fonnte:', error.response?.data || error.message);
    throw new Error('Gagal mengirim pesan');
  }
};