import React from "react";
import { Link } from "react-router-dom";

const LANDING_IMG1 = "https://cdn.multifolks.com/desktop/images/landing-img1.svg";
const LANDING_IMG2 = "https://cdn.multifolks.com/desktop/images/landing-img2.svg";

const steps = [
  {
    number: "01",
    title: "Upload Your Updated Prescription",
    body: "Share your prescription or send us a photo at support@multifolks.com. We'll take it from there — no guesswork, no confusion.",
  },
  {
    number: "02",
    title: "Get a Precise Fit",
    body: "Our proprietary tool measures your PD and fitting height, so your next pair is truly aligned to your eyes — not just close enough.",
  },
  {
    number: "03",
    title: "Lenses Matched to Your Routine",
    body: "We recommend lenses tailored to how you actually live — sharper screen vision, seamless distance clarity, or smoother transitions across all zones.",
  },
];

const coatings = [
  { icon: "✦", label: "Anti-Glare" },
  { icon: "◈", label: "Scratch-Resistant" },
  { icon: "◎", label: "Anti-Reflective" },
];

const ReplacingExistingLanding: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-white font-sans text-[#1F1F1F]"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .mf-page { font-family: 'DM Sans', sans-serif; }
        .mf-display { font-family: 'Playfair Display', Georgia, serif; }

        .mf-hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(26px, 4vw, 48px);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #1a1a18;
          text-transform: uppercase;
        }

        .mf-section-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8a8072;
        }

        .mf-step-number {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 52px;
          font-weight: 400;
          color: #e8e2d9;
          line-height: 1;
          font-style: italic;
          flex-shrink: 0;
        }

        .mf-step-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a18;
          line-height: 1.3;
        }

        .mf-callout {
          background: #f9f6f1;
          border-left: 3px solid #c8a96e;
        }

        .mf-badge {
          background: #f9f6f1;
          border: 1px solid #e8e2d9;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #3d3930;
        }

        .mf-badge-icon {
          color: #c8a96e;
          font-size: 16px;
        }

        .mf-cta {
          background: #1a1a18;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.08em;
          padding: 16px 40px;
          border-radius: 4px;
          text-decoration: none;
          display: inline-block;
          transition: background 0.2s;
        }
        .mf-cta:hover { background: #3d3930; }

        .mf-adjust-note {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #6b6560;
          line-height: 1.7;
        }

        .mf-body {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          line-height: 1.75;
          color: #3d3930;
        }

        .mf-step-card {
          border-top: 1px solid #e8e2d9;
          padding-top: 28px;
          padding-bottom: 28px;
        }
        .mf-step-card:last-child {
          border-bottom: 1px solid #e8e2d9;
        }

        .mf-footnote-block {
          border: 1px solid #e8e2d9;
          border-radius: 6px;
          padding: 28px 32px;
          background: #fdfcfa;
        }

        /* Full-width hero */
        .mf-hero-full {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 320px;
          background: #fff;
        }

        /* Two-column content layout */
        .mf-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          width: 100%;
        }

        .mf-col-left {
          padding: 56px 64px 56px 48px;
          border-right: 1px solid #e8e2d9;
        }

        .mf-col-right {
          padding: 56px 48px 56px 64px;
        }

        /* ── Mobile responsive ── */
        @media (max-width: 768px) {
          .mf-hero-full {
            flex-direction: column;
            text-align: center;
            padding: 32px 24px;
            min-height: auto;
            gap: 24px;
          }

          .mf-hero-full img {
            width: 120px !important;
          }

          .mf-hero-title {
            font-size: clamp(22px, 6vw, 32px) !important;
          }

          .mf-two-col {
            grid-template-columns: 1fr !important;
          }

          .mf-col-left {
            padding: 32px 24px !important;
            border-right: none !important;
            border-bottom: 1px solid #e8e2d9;
          }

          .mf-col-right {
            padding: 32px 24px !important;
          }

          .mf-footnote-block {
            padding: 20px 20px !important;
          }

          .mf-cta {
            width: 100%;
            text-align: center;
            padding: 16px 24px !important;
          }
        }
      `}</style>

      <div className="mf-page pt-14 pb-24" style={{ width: "100%" }}>

        {/* ── Hero Banner — Full Width ── */}
        <div className="mf-hero-full">
          <img
            src={LANDING_IMG1}
            alt=""
            width={220}
            style={{ height: "auto", objectFit: "contain", flexShrink: 0 }}
          />
          <div style={{ flex: 1, textAlign: "center", padding: "0 40px" }}>
            <p className="mf-section-label" style={{ marginBottom: "16px" }}>Already wearing multifocals</p>
            <h1 className="mf-hero-title">
              Time for a<br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>smarter upgrade.</em>
            </h1>
          </div>
          <img
            src={LANDING_IMG2}
            alt=""
            width={220}
            style={{ height: "auto", objectFit: "contain", flexShrink: 0 }}
          />
        </div>

        {/* ── Two-Column Section ── */}
        <div className="mf-two-col" style={{ borderTop: "1px solid #e8e2d9", marginTop: "40px" }}>

          {/* Left Column */}
          <div className="mf-col-left">
            <p className="mf-step-title" style={{ marginBottom: "16px" }}>
              Your eyes have changed. Your lenses should too.
            </p>
            <p className="mf-body" style={{ marginBottom: "20px" }}>
              Maybe your current pair isn't keeping up — or your screen hours have gone up.
              Maybe you just want something lighter, clearer, and better aligned with how you live now.
            </p>
            <p className="mf-body" style={{ marginBottom: "20px" }}>
              Whatever the reason, <strong>you shouldn't have to settle for lenses that almost work.</strong>
            </p>
            <p className="mf-body" style={{ marginBottom: "40px" }}>
              At MultiFolks, we help experienced multifocal wearers upgrade with confidence — using
              precise fitting tools, optical expertise, and lenses that feel right from day one.
            </p>

            {/* Steps */}
            <div>
              <p className="mf-section-label" style={{ marginBottom: "24px" }}>Here is how it works</p>
              {steps.map((step) => (
                <div key={step.number} className="mf-step-card">
                  <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                    <span className="mf-step-number">{step.number}</span>
                    <div style={{ paddingTop: "8px" }}>
                      <h3 className="mf-step-title" style={{ marginBottom: "8px" }}>
                        {step.title}
                      </h3>
                      <p className="mf-body" style={{ margin: 0 }}>
                        {step.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="mf-col-right">
            {/* What's included */}
            <p className="mf-step-title" style={{ marginBottom: "16px" }}>Built-in. No extras needed.</p>
            <p className="mf-body" style={{ marginBottom: "16px" }}>
              Every pair comes with <strong>high-performance multifocal lenses</strong> and all the
              right coatings already included:
            </p>
            <ul style={{ listStyle: "disc", paddingLeft: "20px", marginBottom: "12px" }}>
              {coatings.map((c) => (
                <li key={c.label} className="mf-body" style={{ marginBottom: "6px" }}>{c.label}</li>
              ))}
            </ul>
            <p className="mf-body" style={{ marginBottom: "40px", color: "#6b6560" }}>
              No mystery pricing. Just a better pair, built for your real day-to-day.
            </p>

            {/* Callout */}
            <div className="mf-callout" style={{ padding: "20px 24px", marginBottom: "24px" }}>
              <p className="mf-body" style={{ margin: 0 }}>
                Upgrading doesn't mean starting over. We use everything we know about your existing
                prescription to build a pair that feels like a natural step forward — not a reset.
              </p>
            </div>

            {/* Guarantee block */}
            <div className="mf-footnote-block" style={{ marginBottom: "40px" }}>
              <p className="mf-step-title" style={{ marginBottom: "12px", fontStyle: "normal", fontSize: "16px" }}>
                Not feeling quite right?
              </p>
              <p className="mf-adjust-note" style={{ margin: 0 }}>
                If your glasses don't feel quite right, we'll adjust or remake them at no cost.
                We know what it feels like to get a pair that's almost there — and we're committed
                to making sure yours isn't.
              </p>
            </div>

            {/* Perks */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "40px" }}>
              {["Use your HSA / FSA", "Claim it later", "Free worldwide shipping"].map((perk) => (
                <span key={perk} className="mf-badge">
                  <span className="mf-badge-icon">✓</span>
                  {perk}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div>
              <p
                className="mf-display"
                style={{
                  fontSize: "clamp(18px, 2.5vw, 26px)",
                  color: "#1a1a18",
                  marginBottom: "24px",
                  lineHeight: 1.3,
                }}
              >
                A new fit for your upgraded life.
              </p>
              <Link to="/collection" className="mf-cta">
                Explore Our Collection
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReplacingExistingLanding;