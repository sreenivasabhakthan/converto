const FORMATS = [
  'PDF', 'DOCX', 'PNG', 'JPG', 'WEBP', 'CSV', 'JSON', 'XML', 'TXT',
  'XLSX', 'PPTX', 'GIF', 'BMP', 'TIFF', 'HTML', 'YAML', 'RTF', 'SVG',
];

const double = [...FORMATS, ...FORMATS];

export default function Marquee() {
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div className="marquee-track">
        {double.map((fmt, i) => (
          <span key={`a-${i}`} className="marquee-item">
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: `hsl(${(i * 20) % 360}, 70%, 55%)`,
            }} />
            .{fmt}
          </span>
        ))}
      </div>
    </div>
  );
}
