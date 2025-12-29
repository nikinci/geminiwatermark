import { ImageResponse } from 'next/og'
import { FEATURES } from '@/lib/features-data'

export const runtime = 'edge'

export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

interface Props {
    params: Promise<{
        slug: string
    }>
}

export default async function Image({ params }: Props) {
    const { slug } = await params
    // Fallback to first feature if slug not found (shouldn't happen with correct static params)
    const feature = FEATURES.find((f) => f.slug === slug) || FEATURES[0]

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0b',
                    backgroundImage: 'radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: 30,
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '2px solid rgba(34, 197, 94, 0.2)',
                        marginBottom: 40,
                    }}
                >
                    {/* We can't render lucide icons directly in edge runtime easily without converting to SVG string 
                        So we'll use a generic "Feature" icon style or just the letter/symbol logic if we wanted.
                        For high quality, let's just use the Zap icon SVG code for now, or a generic shape.
                        Actually, since we want specific icons, let's use a generic sleek badge.
                     */}
                    <div
                        style={{
                            fontSize: 60,
                            color: '#22c55e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                        }}
                    >
                        #1
                    </div>
                </div>

                <div
                    style={{
                        fontSize: 70,
                        fontWeight: 900,
                        color: 'white',
                        marginBottom: 20,
                        textAlign: 'center',
                        maxWidth: '80%',
                        lineHeight: 1.1,
                    }}
                >
                    {feature.title}
                </div>

                <div
                    style={{
                        fontSize: 32,
                        color: '#a1a1aa',
                        textAlign: 'center',
                        maxWidth: '70%',
                        lineHeight: 1.5,
                    }}
                >
                    {feature.description}
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <div style={{ fontSize: 24, color: '#22c55e', fontWeight: 700 }}>GeminiWatermark.ai</div>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#52525b' }} />
                    <div style={{ fontSize: 24, color: '#52525b' }}>Advanced AI Feature</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
