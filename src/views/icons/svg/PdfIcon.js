const PdfIcon = ({ width = 24, height = 24, fill = '#E03E2F', className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill={fill}
    className={className}
  >
    <path d="M6 2h7l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
    <path fill="#fff" d="M14 2v5h5" />
    <text x="6" y="17" fontWeight="bold" fontSize="7" fill="#fff" fontFamily="Arial, sans-serif">
      PDF
    </text>
  </svg>
)

export default PdfIcon
