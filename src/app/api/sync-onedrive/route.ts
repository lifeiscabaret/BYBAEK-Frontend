// 타겟 경로: src/app/api/sync-onedrive/route.ts
// 역할: 프론트엔드에서 백엔드 OneDrive sync를 프록시 호출
// 쿠키를 서버사이드에서 백엔드로 전달하여 토큰 문제 해결

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://bybaek-b-bzhhgzh8d2gthpb3.koreacentral-01.azurewebsites.net';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));

        // ✅ 프론트에서 넘긴 토큰 그대로 사용
        const accessToken = request.headers.get('x-access-token') || '';
        const principalId = request.headers.get('x-principal-id') || '';

        if (!accessToken) {
            return NextResponse.json({ success: false, message: 'MS 로그인 필요' }, { status: 401 });
        }

        const syncRes = await fetch(`${BACKEND_URL}/api/onedrive/sync-photos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-ms-token-aad-access-token': accessToken,
                'X-MS-CLIENT-PRINCIPAL-ID': principalId,
            },
            body: JSON.stringify(body),
        });

        const text = await syncRes.text();
        try {
            return NextResponse.json(JSON.parse(text), { status: syncRes.status });
        } catch {
            return NextResponse.json({ success: true, message: text }, { status: syncRes.status });
        }

    } catch (error) {
        console.error('[sync-onedrive] 오류:', error);
        return NextResponse.json({ success: false, message: '동기화 시작 실패' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const shopId = request.nextUrl.searchParams.get('shop_id');
        if (!shopId) {
            return NextResponse.json({ error: 'shop_id 필요' }, { status: 400 });
        }

        const authSession = request.cookies.get('AppServiceAuthSession')?.value;

        const statusRes = await fetch(
            `${BACKEND_URL}/api/photos/status/${shopId}`,  // ← 수정
            { headers: authSession ? { Cookie: `AppServiceAuthSession=${authSession}` } : {} }
        );

        const statusData = await statusRes.json();
        return NextResponse.json(statusData, { status: statusRes.status });

    } catch (error) {
        console.error('[sync-onedrive] 상태 조회 오류:', error);
        return NextResponse.json({ error: '상태 조회 실패' }, { status: 500 });
    }
}