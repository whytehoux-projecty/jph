'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Institution {
    id: number;
    name: string;
    type: 'acquisition' | 'partnership';
    year: number;
    logo: string;
}

const MergerShowcase = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    // Sample data - replace with your actual merged institutions
    const institutions: Institution[] = [
        {
            id: 1,
            name: "Heritage Trust Bank",
            type: "acquisition",
            year: 2023,
            logo: "HTB"
        },
        {
            id: 2,
            name: "Colonial Financial Services",
            type: "acquisition",
            year: 2024,
            logo: "CFS"
        },
        {
            id: 3,
            name: "Premier Community Bank",
            type: "partnership",
            year: 2024,
            logo: "PCB"
        },
        {
            id: 4,
            name: "United Credit Union",
            type: "partnership",
            year: 2024,
            logo: "UCU"
        },
        {
            id: 5,
            name: "Liberty Savings & Loan",
            type: "partnership",
            year: 2025,
            logo: "LSL"
        }
    ];

    // Duplicate for seamless loop
    const duplicatedInstitutions = [...institutions, ...institutions, ...institutions];

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    }
                });
            },
            { threshold: 0.2 }
        );

        const currentSection = sectionRef.current;
        if (currentSection) {
            observer.observe(currentSection);
        }

        return () => {
            if (currentSection) {
                observer.unobserve(currentSection);
            }
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                background: 'linear-gradient(135deg, #f8f9f7 0%, #ffffff 100%)',
                padding: '100px 20px',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Decorative background pattern */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.03,
                backgroundImage: `radial-gradient(circle, #7D9B7B 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
                pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
                {/* Section Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '60px',
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'all 0.8s ease-out'
                }}>
                    <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '42px',
                        fontWeight: '700',
                        color: '#2C3E2A',
                        marginBottom: '16px',
                        letterSpacing: '-0.5px'
                    }}>
                        Built on a Legacy of Trust
                    </h2>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '18px',
                        color: '#5A6C57',
                        maxWidth: '700px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        Through strategic partnerships and acquisitions, we&apos;ve united 5 trusted financial
                        institutions under one roof. Expanded services, broader reach, same local expertise.
                    </p>
                </div>

                {/* Marquee Container */}
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        overflow: 'hidden',
                        padding: '40px 0',
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                        transition: 'all 0.8s ease-out 0.3s'
                    }}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Gradient overlays for fade effect */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '150px',
                        background: 'linear-gradient(to right, #f8f9f7, transparent)',
                        zIndex: 2,
                        pointerEvents: 'none'
                    }} />
                    <div style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '150px',
                        background: 'linear-gradient(to left, #f8f9f7, transparent)',
                        zIndex: 2,
                        pointerEvents: 'none'
                    }} />

                    {/* Scrolling logos */}
                    <div style={{
                        display: 'flex',
                        animation: isPaused ? 'none' : 'scroll 30s linear infinite',
                        willChange: 'transform'
                    }}>
                        {duplicatedInstitutions.map((institution, index) => (
                            <LogoCard key={`${institution.id}-${index}`} institution={institution} />
                        ))}
                    </div>
                </div>

                {/* Trust indicators */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '60px',
                    marginTop: '60px',
                    flexWrap: 'wrap',
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'all 0.8s ease-out 0.6s'
                }}>
                    <TrustBadge
                        number="100+"
                        label="Years Combined Experience"
                    />
                    <TrustBadge
                        number="5"
                        label="Trusted Institutions United"
                    />
                    <TrustBadge
                        number="$2B+"
                        label="Assets Under Management"
                    />
                </div>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
        </section>
    );
};

interface LogoCardProps {
    institution: Institution;
}

const LogoCard: React.FC<LogoCardProps> = ({ institution }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                minWidth: '280px',
                height: '180px',
                margin: '0 20px',
                background: '#ffffff',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px',
                boxShadow: isHovered
                    ? '0 12px 40px rgba(125, 155, 123, 0.15)'
                    : '0 4px 20px rgba(0, 0, 0, 0.06)',
                border: `2px solid ${isHovered ? '#7D9B7B' : '#E8EDE7'}`,
                transform: isHovered ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)',
                transition: 'all 0.3s ease-in-out',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Hover background effect */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(125, 155, 123, 0.05), rgba(212, 175, 122, 0.05))',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.3s ease'
            }} />

            {/* Logo placeholder - replace with actual logo image */}
            <div style={{
                width: '100px',
                height: '100px',
                background: `linear-gradient(135deg, ${isHovered ? '#7D9B7B' : '#C8D5C7'}, ${isHovered ? '#D4AF7A' : '#E8DCC8'})`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px',
                fontWeight: '700',
                color: '#ffffff',
                filter: isHovered ? 'none' : 'grayscale(0.3)',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 1
            }}>
                {institution.logo}
            </div>

            {/* Institution name */}
            <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: '600',
                color: isHovered ? '#2C3E2A' : '#5A6C57',
                textAlign: 'center',
                transition: 'color 0.3s ease',
                position: 'relative',
                zIndex: 1
            }}>
                {institution.name}
            </div>

            {/* Type badge */}
            <div style={{
                marginTop: '8px',
                padding: '4px 12px',
                background: isHovered ? '#7D9B7B' : '#E8EDE7',
                color: isHovered ? '#ffffff' : '#5A6C57',
                borderRadius: '12px',
                fontSize: '11px',
                fontFamily: "'Inter', sans-serif",
                fontWeight: '500',
                textTransform: 'capitalize',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 1
            }}>
                {institution.type} • {institution.year}
            </div>
        </div>
    );
};

interface TrustBadgeProps {
    number: string;
    label: string;
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ number, label }) => {
    return (
        <div style={{
            textAlign: 'center'
        }}>
            <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '36px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #7D9B7B, #D4AF7A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px'
            }}>
                {number}
            </div>
            <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                color: '#5A6C57',
                fontWeight: '500'
            }}>
                {label}
            </div>
        </div>
    );
};

export default MergerShowcase;
