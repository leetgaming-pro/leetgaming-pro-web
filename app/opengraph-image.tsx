import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "LeetGaming PRO - Competitive Gaming Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Gradient accent bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #DCFF37, #b8e600, #DCFF37)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          {/* Logo text */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#DCFF37",
              letterSpacing: "-2px",
              display: "flex",
              alignItems: "baseline",
            }}
          >
            <span>LeetGaming</span>
            <span
              style={{
                fontSize: "48px",
                color: "#ffffff",
                marginLeft: "8px",
                fontWeight: 700,
              }}
            >
              .PRO
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "28px",
              color: "#a0a0a0",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.4,
            }}
          >
            Competitive gaming platform with matchmaking,
            tournaments, and analytics
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {["Matchmaking", "Tournaments", "Leaderboards", "Analytics"].map(
              (feature) => (
                <div
                  key={feature}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "20px",
                    border: "1px solid #333",
                    color: "#DCFF37",
                    fontSize: "18px",
                    background: "rgba(220, 255, 55, 0.08)",
                  }}
                >
                  {feature}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#666",
            fontSize: "18px",
          }}
        >
          <span>leetgaming.pro</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
