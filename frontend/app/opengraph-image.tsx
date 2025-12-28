import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'GeminiWatermark.ai - Remove AI Watermarks'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
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
                {/* Logo Container */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 40,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 100,
                            height: 100,
                            borderRadius: 24,
                            background: 'rgba(34, 197, 94, 0.15)',
                            border: '2px solid rgba(34, 197, 94, 0.3)',
                            marginRight: 30,
                        }}
                    >
                        {/* Scaled up Zap Icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="60"
                            height="60"
                            viewBox="0 0 24 24"
                            fill="#22c55e"
                            stroke="#22c55e"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span
                            style={{
                                fontSize: 80,
                                fontWeight: 800,
                                color: 'white',
                                lineHeight: 1,
                                letterSpacing: '-0.03em',
                            }}
                        >
                            GeminiWatermark
                        </span>
                        <span
                            style={{
                                fontSize: 80,
                                fontWeight: 800,
                                color: '#22c55e', // accent
                                lineHeight: 1,
                                letterSpacing: '-0.03em',
                            }}
                        >
                            .ai
                        </span>
                    </div>
                </div>

                {/* Tagline */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(to right, #4ade80, #22c55e)',
                        backgroundClip: 'text',
                        color: 'transparent',
                        fontSize: 40,
                        fontWeight: 600,
                        marginTop: 20,
                    }}
                >
                    Remove AI Watermarks Instantly & Free
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
