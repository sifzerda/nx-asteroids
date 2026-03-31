// components/UnderConstructionBanner.js
{/* ----------------------------------------------- */}

const stripeStyle = {
  flex: 1,
  maxWidth: "150px",
  height: "14px",
  borderRadius: "4px",
  background:
    "repeating-linear-gradient(45deg, #facc15 0 10px, #000 10px 20px)",
};

export default function UnderConstructionBanner() {
  return (
    <div
      style={{
        width: "100%",
        background: "#111",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
      }}
    >
      <div style={stripeStyle} />

      <div
        style={{
          fontSize: "clamp(1rem, 3vw, 2.5rem)",
          fontWeight: 900,
          letterSpacing: "0.12em",
          color: "#facc15",
          textShadow: "2px 2px 0 #000",
          whiteSpace: "nowrap",
        }}
      >
        UNDER CONSTRUCTION
      </div>

      <div style={stripeStyle} />
    </div>
  );
}