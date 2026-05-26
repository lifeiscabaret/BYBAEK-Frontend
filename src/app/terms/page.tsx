"use client";

import { useState } from "react";
import Link from "next/link";

const content = {
  en: {
    badge: "Legal",
    title: "Terms of\nService",
    subtitle: "By using BYBAEK, you agree to the following terms. Please read them carefully.",
    updated: "Effective date: May 2026",
    sections: [
      {
        title: "Article 1 — Service Provider",
        text: "This service is provided by BYBAEK (Representative: Jihyun Lee).",
      },
      {
        title: "Article 2 — Service Description",
        text: "BYBAEK is an AI-powered Instagram marketing automation service for barbershop owners. The AI generates captions and hashtags tailored to the user's style preferences, selects treatment photos stored in OneDrive, and automatically uploads posts to Instagram.",
      },
      {
        title: "Article 3 — Ownership of AI-Generated Content",
        text: "The copyright of AI-generated posts (captions, hashtags, etc.) belongs to the user who requested them.",
      },
      {
        title: "Article 4 — Instagram Auto-Upload",
        text: "By using this service, you consent to BYBAEK automatically uploading posts to the connected Instagram business account. Auto-upload can be toggled in Settings, and a 'Review before upload' option is available.",
      },
      {
        title: "Article 5 — OneDrive Photo Access",
        text: "By using this service, you consent to BYBAEK accessing photos stored in your Microsoft OneDrive for use as candidate images for posts. Access is limited to the folder designated by the user.",
      },
      {
        title: "Article 6 — Disclaimer",
        text: "BYBAEK does not guarantee the accuracy or appropriateness of AI-generated content, and is not liable for disputes with third parties arising from post uploads. BYBAEK is not responsible for service limitations caused by policy changes at Instagram or Microsoft.",
      },
      {
        title: "Article 7 — Governing Law & Jurisdiction",
        text: "These terms shall be governed by and construed in accordance with the laws of the Republic of Korea. Any disputes arising in connection with the use of the service shall be subject to the jurisdiction of Korean courts.",
      },
    ],
    footerLinks: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Support", href: "/support" }],
  },
  ko: {
    badge: "법적 고지",
    title: "이용\n약관",
    subtitle: "BYBAEK를 이용하시면 아래 약관에 동의하신 것으로 간주됩니다. 이용 전 반드시 확인해 주세요.",
    updated: "시행일: 2026년 5월",
    sections: [
      {
        title: "제1조 (서비스 제공자)",
        text: "본 서비스는 바이백(대표: 이지현)이 제공합니다.",
      },
      {
        title: "제2조 (서비스 내용)",
        text: "BYBAEK은 AI 기반 바버샵 인스타그램 마케팅 자동화 서비스입니다. 사용자가 요청한 스타일에 맞춰 AI가 캡션 및 해시태그를 생성하고, OneDrive에 저장된 시술 사진을 선택하여 인스타그램에 게시물을 자동 업로드합니다.",
      },
      {
        title: "제3조 (AI 생성 콘텐츠의 저작권)",
        text: "AI가 생성한 게시물(캡션, 해시태그 등)의 저작권은 해당 게시물을 요청한 사용자에게 귀속됩니다.",
      },
      {
        title: "제4조 (인스타그램 자동 업로드)",
        text: "사용자는 본 서비스가 연동된 인스타그램 비즈니스 계정에 게시물을 자동 업로드하는 것에 동의합니다. 자동 업로드 여부는 설정에서 변경할 수 있으며, 업로드 전 검토 기능을 활성화할 수 있습니다.",
      },
      {
        title: "제5조 (OneDrive 사진 접근)",
        text: "사용자는 본 서비스가 Microsoft OneDrive에 저장된 사진에 접근하여 게시물 후보 이미지로 활용하는 것에 동의합니다. 접근 범위는 사용자가 지정한 폴더에 한정됩니다.",
      },
      {
        title: "제6조 (면책 조항)",
        text: "회사는 AI가 생성한 콘텐츠의 정확성, 적절성을 보장하지 않으며, 게시물 업로드로 인해 발생하는 제3자와의 분쟁에 대해 책임지지 않습니다. 인스타그램 및 Microsoft의 서비스 정책 변경으로 인한 기능 제한에 대해 회사는 책임을 지지 않습니다.",
      },
      {
        title: "제7조 (준거법 및 관할법원)",
        text: "본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련한 분쟁은 대한민국 법원을 관할법원으로 합니다.",
      },
    ],
    footerLinks: [{ label: "개인정보처리방침", href: "/privacy" }, { label: "고객지원", href: "/support" }],
  },
};

export default function TermsPage() {
  const [lang, setLang] = useState<"ko" | "en">("en");
  const c = content[lang];

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#0f0f0f",
      color: "#f5f5f5",
      fontFamily: "'Georgia', serif",
    }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid #222",
        padding: "24px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
        }}>
          <img src="/BYBAEK_icon.svg" alt="BYBAEK" style={{ width: "28px", height: "28px", objectFit: "contain" }} />
          <span style={{
            fontSize: "18px",
            fontWeight: "300",
            letterSpacing: "0.15em",
            color: "#fff",
            fontFamily: "sans-serif",
          }}>BYBAEK</span>
        </Link>

        <div style={{
          display: "flex",
          border: "1px solid #333",
          borderRadius: "6px",
          overflow: "hidden",
        }}>
          {(["en", "ko"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: "6px 16px",
                fontSize: "12px",
                fontFamily: "sans-serif",
                fontWeight: "600",
                letterSpacing: "0.1em",
                cursor: "pointer",
                border: "none",
                backgroundColor: lang === l ? "#8B0000" : "transparent",
                color: lang === l ? "#fff" : "#666",
                transition: "all 0.2s",
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Hero */}
      <section style={{
        padding: "80px 48px 60px",
        borderBottom: "1px solid #1a1a1a",
        maxWidth: "800px",
      }}>
        <div style={{
          fontSize: "11px",
          letterSpacing: "0.2em",
          color: "#8B0000",
          textTransform: "uppercase",
          marginBottom: "20px",
          fontFamily: "sans-serif",
        }}>{c.badge}</div>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: "400",
          lineHeight: "1.15",
          margin: "0 0 24px 0",
          color: "#fff",
        }}>
          {c.title.split("\n")[0]}<br />
          <em style={{ color: "#8B0000", fontStyle: "italic" }}>{c.title.split("\n")[1]}</em>
        </h1>
        <p style={{
          fontSize: "15px",
          lineHeight: "1.7",
          color: "#888",
          maxWidth: "520px",
          fontFamily: "sans-serif",
          margin: "0 0 16px 0",
        }}>{c.subtitle}</p>
        <span style={{
          fontSize: "12px",
          color: "#444",
          fontFamily: "sans-serif",
          letterSpacing: "0.05em",
        }}>{c.updated}</span>
      </section>

      {/* Sections */}
      <section style={{ maxWidth: "800px", padding: "0 48px" }}>
        {c.sections.map((section, i) => (
          <div key={i} style={{
            borderBottom: "1px solid #1a1a1a",
            padding: "40px 0",
          }}>
            <h2 style={{
              fontSize: "13px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#555",
              fontFamily: "sans-serif",
              fontWeight: "600",
              marginBottom: "16px",
            }}>{section.title}</h2>
            <p style={{
              fontSize: "15px",
              color: "#999",
              fontFamily: "sans-serif",
              lineHeight: "1.8",
              margin: 0,
            }}>{section.text}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{
        padding: "40px 48px",
        maxWidth: "800px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginTop: "20px",
      }}>
        <span style={{ color: "#444", fontSize: "13px", fontFamily: "sans-serif" }}>
          © 2026 BYBAEK. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: "24px" }}>
          {c.footerLinks.map((link, i) => (
            <Link key={i} href={link.href} style={{
              color: "#555",
              fontSize: "13px",
              fontFamily: "sans-serif",
              textDecoration: "none",
            }}>{link.label}</Link>
          ))}
        </div>
      </footer>
    </main>
  );
}
