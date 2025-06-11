import React from 'react'

const HospisoftLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <img src="/logo-remove.png" alt="Hospisoft Logo" style={{ height: 62, width: 'auto' }} />
    <svg
      width="100"
      height="32"
      viewBox="0 0 150 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4facfe" />
          <stop offset="100%" stopColor="#00f2fe" />
        </linearGradient>
      </defs>
      <text
        x="-5"
        y="28"
        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        fontWeight="700"
        fontSize="35"
        fill="url(#grad1)"
      >
        Hospisoft
      </text>
    </svg>
  </div>
)

export default HospisoftLogo
