import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Premium Digital Solutions";
  const subtitle = searchParams.get("subtitle") || "Websites • Software • AI • Automation";
  const badge = searchParams.get("badge") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#0B1437",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Gold top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "#C9A227", display: "flex" }} />

        {/* Background circles */}
        <div style={{
          position: "absolute", top: "-100px", right: "-100px",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "rgba(201,162,39,0.07)", display: "flex",
        }} />
        <div style={{
          position: "absolute", bottom: "-80px", left: "-80px",
          width: "350px", height: "350px", borderRadius: "50%",
          background: "rgba(255,255,255,0.03)", display: "flex",
        }} />

        {/* Grid pattern overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px", display: "flex",
        }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", padding: "60px 80px", flex: 1, position: "relative", zIndex: 10 }}>

          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "auto" }}>
            {/* KVL Icon */}
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: "linear-gradient(135deg, #C9A227, #E8C547)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#0B1437", fontWeight: 900, fontSize: "22px", letterSpacing: "-1px" }}>K</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#ffffff", fontWeight: 800, fontSize: "26px", letterSpacing: "-0.5px" }}>KVL TECH</span>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>kvlbusinesssolutions.com</span>
            </div>
          </div>

          {/* Badge */}
          {badge && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.3)",
              borderRadius: "100px", padding: "6px 16px", width: "fit-content", marginBottom: "20px",
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C9A227", display: "flex" }} />
              <span style={{ color: "#C9A227", fontSize: "13px", fontWeight: 600, letterSpacing: "0.5px" }}>{badge}</span>
            </div>
          )}

          {/* Main title */}
          <div style={{
            color: "#ffffff", fontSize: title.length > 40 ? "48px" : "58px",
            fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px",
            marginBottom: "20px", maxWidth: "880px",
          }}>
            {title}
          </div>

          {/* Subtitle */}
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "22px", fontWeight: 400, letterSpacing: "0.3px" }}>
            {subtitle}
          </div>

          {/* Bottom row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", gap: "32px" }}>
              {["1200+ Clients", "99.9% Uptime", "24/7 Support"].map(stat => (
                <div key={stat} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ color: "#C9A227", fontWeight: 700, fontSize: "14px" }}>{stat.split(" ")[0]}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>{stat.split(" ").slice(1).join(" ")}</span>
                </div>
              ))}
            </div>
            <div style={{
              background: "#C9A227", borderRadius: "12px",
              padding: "12px 28px", display: "flex", alignItems: "center",
            }}>
              <span style={{ color: "#0B1437", fontWeight: 700, fontSize: "16px" }}>Book Free Demo →</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
