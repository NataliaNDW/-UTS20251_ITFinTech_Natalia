import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
    try {
        const { phoneNumber, code } = await request.json();

        const formattedPhone = phoneNumber.startsWith('+')
            ? phoneNumber
            : `+${phoneNumber}`;

        // Verify OTP
        const verificationCheck = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
            .verificationChecks.create({
                to: formattedPhone,
                code: code
            });

        if (verificationCheck.status === 'approved') {
            return NextResponse.json({
                success: true,
                verified: true,
                message: 'Phone number verified successfully'
            });
        } else {
            return NextResponse.json({
                success: false,
                verified: false,
                message: 'Invalid OTP code'
            }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
