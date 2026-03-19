import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { cards } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import CopyLinkButton from './CopyLinkButton'
import EnvelopeReveal from './EnvelopeReveal'

type Props = {
  params: Promise<{ id: string }>
}

async function getCard(id: string) {
  const result = await db
    .select()
    .from(cards)
    .where(eq(cards.id, id))
    .limit(1)

  return result[0] || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const card = await getCard(id)

  if (!card) {
    return { title: 'Card Not Found — MapleCard' }
  }

  const senderText = card.fromName ? ` from ${card.fromName}` : ''
  const title = `You received a card${senderText}!`
  const description =
    card.message.length > 120
      ? card.message.slice(0, 117) + '...'
      : card.message

  return {
    title: `${title} — MapleCard`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(card.backgroundImage
        ? { images: [{ url: card.backgroundImage, width: 600, height: 800 }] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(card.backgroundImage ? { images: [card.backgroundImage] } : {}),
    },
  }
}

export default async function CardPage({ params }: Props) {
  const { id } = await params
  const card = await getCard(id)

  if (!card) {
    notFound()
  }

  const hasBackground = !!card.backgroundImage
  const hasVideo = !!card.video
  const hasMedia = hasBackground || hasVideo

  const fontFamily = {
    lora: "var(--font-lora), 'Lora', serif",
    playfair: "var(--font-playfair), 'Playfair Display', serif",
    'dm-sans': "var(--font-dm-sans), 'DM Sans', sans-serif",
  }[card.font || 'lora'] || "var(--font-lora), 'Lora', serif"

  const messageColor = card.textColor || (hasMedia ? '#ffffff' : '#1a1a1a')
  const msgPos = (card as any).messagePosition || 'bottom'
  const justifyContent = msgPos === 'top' ? 'flex-start' : msgPos === 'center' ? 'center' : 'space-between'
  const stickerIds = ((card as any).stickers || '').split(',').filter(Boolean) as string[]
  const STICKER_MAP: Record<string, string> = {
    maple: '\u{1F341}', heart: '\u2764\uFE0F', star: '\u2B50', sparkle: '\u2728', gift: '\u{1F381}',
    balloon: '\u{1F388}', cake: '\u{1F382}', confetti: '\u{1F38A}', flower: '\u{1F338}',
    snowflake: '\u2744\uFE0F', moose: '\u{1FACE}', beaver: '\u{1F9AB}',
  }
  const stickerPositions = [
    { top: '8%', right: '8%', rotate: 15, size: 32 },
    { top: '12%', right: '22%', rotate: -10, size: 26 },
    { top: '6%', left: '8%', rotate: -20, size: 28 },
    { top: '18%', left: '18%', rotate: 8, size: 24 },
    { top: '5%', right: '40%', rotate: 25, size: 22 },
    { top: '22%', right: '10%', rotate: -5, size: 30 },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #faf8f3 0%, #f0ebe3 50%, #e8e0d5 100%)' }}>

      <EnvelopeReveal fromName={card.fromName}>
      {/* Card container */}
      <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-6">

        {/* The Card */}
        <div
          className="relative w-full overflow-hidden shadow-2xl"
          style={{
            aspectRatio: '3 / 4',
            borderRadius: '20px',
            backgroundColor: hasMedia ? '#000' : '#fff',
          }}
        >
          {/* Background image */}
          {hasBackground && (
            <img
              src={card.backgroundImage!}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Background video */}
          {hasVideo && !hasBackground && (
            <video
              src={card.video!}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Gradient overlay for media cards */}
          {hasMedia && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.7) 100%)',
              }}
            />
          )}

          {/* No-media elegant background */}
          {!hasMedia && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(160deg, #faf8f3 0%, #f5f0e8 100%)',
              }}
            />
          )}

          {/* Sticker overlays */}
          {stickerIds.map((stickerId, idx) => {
            const emoji = STICKER_MAP[stickerId] || '\u{1F341}';
            const pos = stickerPositions[idx % stickerPositions.length];
            const { rotate: r, size: s, ...cssPos } = pos;
            return (
              <span
                key={`${stickerId}-${idx}`}
                className="absolute z-20 pointer-events-none"
                style={{
                  fontSize: `${s}px`,
                  transform: `rotate(${r}deg)`,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  ...cssPos,
                }}
              >
                {emoji}
              </span>
            );
          })}

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full p-6" style={{ justifyContent }}>
            {/* Top: template pill */}
            <div>
              {card.template && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                  style={{
                    backgroundColor: hasMedia
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(192,57,43,0.1)',
                    color: hasMedia
                      ? 'rgba(255,255,255,0.9)'
                      : '#c0392b',
                    backdropFilter: hasMedia ? 'blur(4px)' : 'none',
                  }}
                >
                  {card.template}
                </span>
              )}
            </div>

            {/* Bottom: message + sender */}
            <div>
              {/* Message */}
              {card.message && (
                <p
                  className="text-lg leading-relaxed mb-4"
                  style={{
                    fontFamily,
                    fontStyle: 'italic',
                    color: messageColor,
                    textShadow: hasMedia
                      ? '0 1px 8px rgba(0,0,0,0.4)'
                      : 'none',
                    margin: '0 0 16px 0',
                  }}
                >
                  &ldquo;{card.message}&rdquo;
                </p>
              )}

              {/* Bilingual badge */}
              {card.bilingual && (
                <div className="mb-3">
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: hasMedia
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(192,57,43,0.08)',
                      color: hasMedia
                        ? 'rgba(255,255,255,0.8)'
                        : '#c0392b',
                    }}
                  >
                    EN / FR
                  </span>
                </div>
              )}

              {/* Sender footer */}
              <div
                className="flex items-center justify-between pt-3"
                style={{
                  borderTop: hasMedia
                    ? '1px solid rgba(255,255,255,0.2)'
                    : '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <div>
                  {card.fromName && (
                    <p
                      className="text-sm font-bold m-0"
                      style={{
                        color: hasMedia ? '#fff' : '#1a1a1a',
                        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      }}
                    >
                      {card.fromName}
                    </p>
                  )}
                  <p
                    className="text-[11px] mt-0.5 m-0"
                    style={{
                      color: hasMedia
                        ? 'rgba(255,255,255,0.6)'
                        : 'rgba(0,0,0,0.4)',
                    }}
                  >
                    {card.province || 'Canada'}
                  </p>
                </div>
                <span
                  className="text-xl"
                  style={{ opacity: hasMedia ? 0.6 : 0.3 }}
                >
                  🍁
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <CopyLinkButton />

          <a
            href="/"
            className="flex-1 text-center py-3 px-4 rounded-xl text-sm font-semibold no-underline transition-colors"
            style={{
              backgroundColor: '#c0392b',
              color: '#fff',
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            }}
          >
            Send Your Own
          </a>
        </div>

        {/* Branding footer */}
        <p
          className="text-xs mt-2"
          style={{
            color: 'rgba(0,0,0,0.35)',
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          }}
        >
          Made with 🍁 on{' '}
          <a
            href="/"
            className="no-underline font-semibold"
            style={{ color: '#c0392b' }}
          >
            MapleCard
          </a>
        </p>
      </div>
      </EnvelopeReveal>
    </div>
  )
}
