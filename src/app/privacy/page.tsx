"use client";

import { useState } from "react";
import Link from "next/link";

const content = {
  ko: {
    label: "KO",
    title: "개인정보\n처리방침",
    subtitle: "BYBAEK는 바버샵 사장님의 인스타그램 마케팅을 AI로 자동화하는 B2B SaaS 서비스입니다. 아래에 수집하는 개인정보 항목과 이용 목적을 안내드립니다.",
    updated: "최종 업데이트: 2026년 5월",
    sections: [
      {
        title: "1. 수집하는 개인정보 항목",
        items: [
          "Microsoft OAuth: 이름, 이메일, 고유 식별자(UID)",
          "Instagram Graph API: 인스타그램 비즈니스 계정 ID, 액세스 토큰",
          "시술 사진: OneDrive에서 동기화된 이미지 파일",
        ],
      },
      {
        title: "2. 수집 목적",
        items: [
          "서비스 제공: 사용자 인증, 인스타그램 게시물 업로드",
          "AI 게시물 생성: 사용자 맞춤형 캡션 및 해시태그 생성",
        ],
      },
      {
        title: "3. 보유 및 이용 기간",
        text: "수집된 개인정보는 회원 탈퇴 시까지 보유하며, 탈퇴 즉시 지체 없이 파기합니다.",
      },
      {
        title: "4. 제3자 제공",
        items: [
          "Microsoft Azure: 인증 처리 및 데이터 저장",
          "Instagram (Meta): 게시물 업로드를 위한 API 연동",
        ],
      },
      {
        title: "5. 데이터 저장 위치",
        text: "모든 데이터는 Microsoft Azure Korea Central 리전에 저장됩니다.",
      },
      {
        title: "6. 개인정보 보호책임자",
        text: "성명: 이지현\n이메일: bybaek.ai@gmail.com",
      },
    ],
    footerLinks: [{ label: "이용약관", href: "/terms" }, { label: "고객지원", href: "/support" }],
  },
  en: {
    label: "EN",
    title: "Privacy\nPolicy",
    subtitle: "BYBAEK is a B2B SaaS service that automates Instagram marketing for barbershop owners using AI. Below we describe what personal data we collect and how we use it.",
    updated: "Last updated: May 2026",
    sections: [
      {
        title: "1. Data We Collect",
        items: [
          "Microsoft OAuth: name, email address, unique identifier (UID)",
          "Instagram Graph API: Instagram business account ID, access token",
          "Treatment photos: image files synced from OneDrive",
        ],
      },
      {
        title: "2. Purpose of Collection",
        items: [
          "Service delivery: user authentication, Instagram post uploading",
          "AI post generation: personalized captions and hashtag creation",
        ],
      },
      {
        title: "3. Retention Period",
        text: "Personal data is retained until account deletion. Upon deletion, all data is immediately and permanently destroyed.",
      },
      {
        title: "4. Third-Party Disclosure",
        items: [
          "Microsoft Azure: authentication processing and data storage",
          "Instagram (Meta): API integration for post uploading",
        ],
      },
      {
        title: "5. Data Storage Location",
        text: "All data is stored in the Microsoft Azure Korea Central region.",
      },
      {
        title: "6. Privacy Officer",
        text: "Name: Jihyun Lee\nEmail: bybaek.ai@gmail.com",
      },
    ],
    footerLinks: [{ label: "Terms of Service", href: "/terms" }, { label: "Support", href: "/support" }],
  },
};

export default function PrivacyPage() {
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

        {/* Lang toggle */}
        <div style={{
          display: "flex",
          border: "1px solid #333",
          borderRadius: "6px",
          overflow: "hidden",
        }}>
          {(["ko", "en"] as const).map((l) => (
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
        }}>Legal</div>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: "400",
          lineHeight: "1.15",
          margin: "0 0 24px 0",
          color: "#fff",
          whiteSpace: "pre-line",
        }}>
          {c.title.split("\n")[0]}<br />
          <em style={{ color: "#8B0000", fontStyle: "italic" }}>{c.title.split("\n")[1]}</em>
        </h1>
        <p style={{
          fontSize: "15px",
          lineHeight: "1.7",
          color: "#888",
          maxWidth: "560px",
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
              marginBottom: "20px",
            }}>{section.title}</h2>
            {"items" in section && section.items ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {section.items.map((item, j) => (
                  <li key={j} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <span style={{ color: "#8B0000", fontSize: "16px", lineHeight: "1.5", flexShrink: 0 }}>—</span>
                    <span style={{ fontSize: "15px", color: "#999", fontFamily: "sans-serif", lineHeight: "1.6" }}>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{
                fontSize: "15px",
                color: "#999",
                fontFamily: "sans-serif",
                lineHeight: "1.7",
                whiteSpace: "pre-line",
                margin: 0,
              }}>{(section as any).text}</p>
            )}
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
