"use client";

import { useState } from "react";
import Link from "next/link";

const content = {
    ko: {
        label: "KO",
        title: "고객\n지원",
        subtitle: "BYBAEK 서비스 이용 중 불편한 점이 있으시면 아래로 문의해 주세요. 최대한 빠르게 도움을 드리겠습니다.",
        updated: "운영시간: 평일 10:00 – 18:00 (KST)",
        contactLabel: "이메일 문의",
        contactDesc: "문의 시 계정 이메일 주소와 문제 상황을 함께 적어주시면 더 빠르게 도움드릴 수 있습니다. 영업일 기준 1–2일 내 답변드립니다.",
        faqTitle: "자주 묻는 질문",
        faqs: [
            {
                q: "OneDrive를 연동하려면 어떻게 하나요?",
                a: "Microsoft 계정으로 로그인 후, 사진 메뉴에서 'OneDrive 연동' 버튼을 클릭하세요. BYBAEK의 파일 접근 권한을 승인하면 자동으로 사진이 동기화됩니다.",
            },
            {
                q: "인스타그램 계정은 어떻게 연결하나요?",
                a: "설정 메뉴에서 '인스타그램 연결'을 클릭하세요. 비즈니스 또는 크리에이터 계정이 필요합니다. 화면 안내에 따라 BYBAEK의 게시물 업로드 권한을 승인해 주세요.",
            },
            {
                q: "AI가 게시물을 생성하지 않아요.",
                a: "① OneDrive 연동 및 사진 동기화 완료 여부, ② 인스타그램 계정 연결 여부, ③ 온보딩 설정 완료 여부를 확인해 주세요. 문제가 지속되면 이메일로 문의해 주세요.",
            },
            {
                q: "자동 업로드를 멈추고 싶어요.",
                a: "설정 → 자동 업로드에서 토글을 OFF로 변경하세요. 또는 '업로드 전 검토' 옵션을 ON으로 설정하면 매 게시물마다 사장님이 직접 승인 후 업로드됩니다.",
            },
            {
                q: "내 데이터는 안전한가요?",
                a: "네. BYBAEK는 Microsoft Azure 인프라를 사용하며, 서비스 제공에 필요한 최소한의 데이터만 수집합니다. 개인정보는 제3자에게 판매되지 않습니다. 자세한 내용은 개인정보처리방침을 확인해 주세요.",
            },
        ],
        footerLinks: [{ label: "이용약관", href: "/terms" }, { label: "개인정보처리방침", href: "/privacy" }],
    },
    en: {
        label: "EN",
        title: "Support\nCenter",
        subtitle: "Our team is here to help with any questions or issues you encounter while using BYBAEK.",
        updated: "Hours: Mon–Fri 10:00 – 18:00 KST",
        contactLabel: "Email Support",
        contactDesc: "Please include your account email and a description of the issue. We aim to respond within 1–2 business days.",
        faqTitle: "Frequently Asked Questions",
        faqs: [
            {
                q: "How do I connect my OneDrive?",
                a: "After logging in with your Microsoft account, go to the Photos section and click 'Connect OneDrive'. Authorize BYBAEK to access your files and your photos will sync automatically.",
            },
            {
                q: "How do I link my Instagram account?",
                a: "Go to Settings and click 'Connect Instagram'. You'll need a Business or Creator account. Follow the on-screen instructions to grant BYBAEK posting permissions.",
            },
            {
                q: "Why isn't the AI generating posts?",
                a: "Please check: ① OneDrive is connected and photos are synced, ② Instagram account is connected, ③ Onboarding setup is complete. If the issue persists, contact us by email.",
            },
            {
                q: "How do I stop auto-posting?",
                a: "Go to Settings → Auto Upload and toggle it OFF. Or enable 'Review before upload' so every post requires your manual approval before publishing.",
            },
            {
                q: "Is my data secure?",
                a: "Yes. BYBAEK uses Microsoft Azure infrastructure and collects only the minimum data needed to provide the service. We never sell your data to third parties. See our Privacy Policy for details.",
            },
        ],
        footerLinks: [{ label: "Terms of Service", href: "/terms" }, { label: "Privacy Policy", href: "/privacy" }],
    },
};

export default function SupportPage() {
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
                }}>Support</div>
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

            {/* Contact */}
            <section style={{
                padding: "60px 48px",
                borderBottom: "1px solid #1a1a1a",
                maxWidth: "800px",
            }}>
                <h2 style={{
                    fontSize: "13px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#555",
                    fontFamily: "sans-serif",
                    fontWeight: "600",
                    marginBottom: "28px",
                }}>{c.contactLabel}</h2>

                <div style={{
                    border: "1px solid #222",
                    borderRadius: "8px",
                    padding: "28px 32px",
                    backgroundColor: "#111",
                }}>
                    <div style={{
                        fontSize: "11px",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#8B0000",
                        fontFamily: "sans-serif",
                        marginBottom: "10px",
                    }}>Email</div>
                    <a
                        href="mailto: bybaek.ai@gmail.com"
                        style={{
                            fontSize: "20px",
                            color: "#fff",
                            textDecoration: "none",
                            fontFamily: "sans-serif",
                            fontWeight: "500",
                        }}
                    >
                         bybaek.ai@gmail.com
                    </a>
                    <p style={{
                        color: "#666",
                        fontSize: "14px",
                        marginTop: "12px",
                        fontFamily: "sans-serif",
                        lineHeight: "1.6",
                        margin: "12px 0 0 0",
                    }}>{c.contactDesc}</p>
                </div>
            </section>

            {/* FAQ */}
            <section style={{
                padding: "60px 48px",
                borderBottom: "1px solid #1a1a1a",
                maxWidth: "800px",
            }}>
                <h2 style={{
                    fontSize: "13px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#555",
                    fontFamily: "sans-serif",
                    fontWeight: "600",
                    marginBottom: "8px",
                }}>{c.faqTitle}</h2>

                {c.faqs.map((item, i) => (
                    <div key={i} style={{
                        borderTop: i === 0 ? "1px solid #222" : "none",
                        borderBottom: "1px solid #222",
                        padding: "28px 0",
                        marginTop: i === 0 ? "24px" : "0",
                    }}>
                        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                            <span style={{
                                color: "#8B0000",
                                fontSize: "13px",
                                fontFamily: "sans-serif",
                                fontWeight: "700",
                                minWidth: "24px",
                                paddingTop: "2px",
                            }}>Q.</span>
                            <div>
                                <p style={{
                                    fontSize: "16px",
                                    color: "#fff",
                                    fontFamily: "sans-serif",
                                    fontWeight: "500",
                                    margin: "0 0 12px 0",
                                    lineHeight: "1.5",
                                }}>{item.q}</p>
                                <p style={{
                                    fontSize: "14px",
                                    color: "#777",
                                    fontFamily: "sans-serif",
                                    lineHeight: "1.7",
                                    margin: 0,
                                }}>{item.a}</p>
                            </div>
                        </div>
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
