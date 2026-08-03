import { NextRequest, NextResponse } from 'next/server';

// NEXT_PUBLIC_API_BASE_URL은 `/api`까지 포함한 값이다 (api/index.ts·README와 동일 규칙).
// 이전엔 fallback에만 `/api`가 빠져 있고 호출부에서 `/api/`를 다시 붙여서,
// 환경변수가 설정된 배포 환경에서만 `/api/api/...`가 되어 항상 404였다.
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://api2.bybaekofficial.com/api';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));

        // 클라이언트가 넘긴 Bearer 토큰을 그대로 백엔드 호출에 재첨부 (Bearer 인증 방식).
        const authHeader = request.headers.get('authorization') || '';
        if (!authHeader) {
            return NextResponse.json({ success: false, message: '인증 토큰 필요' }, { status: 401 });
        }

        const syncRes = await fetch(`${BACKEND_URL}/onedrive/sync-photos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
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

        // 폐기된 AppServiceAuthSession 쿠키 대신, 클라이언트 Bearer 토큰을 백엔드로 재첨부.
        const authHeader = request.headers.get('authorization') || '';

        const statusRes = await fetch(
            `${BACKEND_URL}/photos/status/${shopId}`,
            { headers: authHeader ? { Authorization: authHeader } : {} }
        );

        const statusData = await statusRes.json();
        return NextResponse.json(statusData, { status: statusRes.status });

    } catch (error) {
        console.error('[sync-onedrive] 상태 조회 오류:', error);
        return NextResponse.json({ error: '상태 조회 실패' }, { status: 500 });
    }
}