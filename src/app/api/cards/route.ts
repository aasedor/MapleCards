import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { db } from '@/lib/db'
import { cards } from '@/lib/schema'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      template,
      message,
      fromName,
      province,
      bilingual,
      backgroundImage,
      video,
      font,
      textColor,
      stickers,
      messagePosition,
    } = body

    if (!template || !message) {
      return NextResponse.json(
        { error: 'Template and message are required' },
        { status: 400 }
      )
    }

    const id = nanoid(12)

    await db.insert(cards).values({
      id,
      template,
      message,
      fromName: fromName || null,
      province: province || null,
      bilingual: bilingual ?? false,
      backgroundImage: backgroundImage || null,
      video: video || null,
      font: font || 'lora',
      textColor: textColor || '#1a1a1a',
      stickers: stickers || null,
      messagePosition: messagePosition || 'bottom',
    })

    const baseUrl = request.nextUrl.origin
    const shareUrl = `${baseUrl}/card/${id}`

    return NextResponse.json({ id, shareUrl }, { status: 201 })
  } catch (error) {
    console.error('Failed to create card:', error)
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    )
  }
}
