import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cards } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const card = await db
      .select()
      .from(cards)
      .where(eq(cards.id, id))
      .limit(1)

    if (!card.length) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(card[0])
  } catch (error) {
    console.error('Failed to fetch card:', error)
    return NextResponse.json(
      { error: 'Failed to fetch card' },
      { status: 500 }
    )
  }
}
