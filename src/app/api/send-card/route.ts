import { NextRequest, NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { CardEmail } from '@/emails/CardEmail';
import React from 'react';

interface SendCardRequest {
  template: string;
  message: string;
  fromName: string;
  province: string;
  bilingual: boolean;
  stickers: string;
  recipientEmail: string;
  recipientName: string;
  imageData: string; // base64 PNG
  scheduledAt?: string; // ISO date string for scheduled send
}

export async function POST(request: NextRequest) {
  try {
    const body: SendCardRequest = await request.json();

    // Validate required fields
    if (!body.recipientEmail || !body.message || !body.fromName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert base64 image to a data URL (for now, use as-is)
    const imageDataUrl = body.imageData.startsWith('data:')
      ? body.imageData
      : `data:image/png;base64,${body.imageData}`;

    // Create the email
    const emailComponent = React.createElement(CardEmail, {
      cardImageUrl: imageDataUrl,
      message: body.message,
      fromName: body.fromName,
      bilingual: body.bilingual,
      recipientName: body.recipientName,
    });

    // Send via Resend (supports scheduled send)
    const sendPayload: any = {
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: body.recipientEmail,
      subject: `🍁 A MapleCard from ${body.fromName}!`,
      react: emailComponent,
    };

    if (body.scheduledAt) {
      sendPayload.scheduledAt = body.scheduledAt;
    }

    const result = await getResend().emails.send(sendPayload);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: result.data?.id,
      scheduled: !!body.scheduledAt,
    });
  } catch (error) {
    console.error('Error sending card:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send card' },
      { status: 500 }
    );
  }
}
