// 타겟 경로: src/app/api/sync-onedrive/route.ts
// 역할: 프론트엔드에서 백엔드 OneDrive sync를 프록시 호출
// 쿠키를 서버사이드에서 백엔드로 전달하여 토큰 문제 해결

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net';

export async function POST(request: NextRequest) {
    try {
        // 1. 전체 쿠키를 그대로 전달
        const allCookies = request.headers.get('cookie') || '';

        if (!allCookies) {
            return NextResponse.json(
                { success: false, message: 'MS 로그인이 필요해요.' },
                { status: 401 }
            );
        }

        // 2. 프론트엔드 자신의 /.auth/me로 토큰 조회
        const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ||
            'https://bybaek-frontend-dcctbxfhdnhge4ap.koreacentral-01.azurewebsites.net';

        const authMeRes = await fetch(`${FRONTEND_URL}/.auth/me`, {
            headers: { Cookie: allCookies },
        });

        let token: string | null = null;
        let principalId: string | null = null;

        if (authMeRes.ok) {
            const authData = await authMeRes.json();
            token = authData[0]?.access_token || null;
            principalId = authData[0]?.user_id || null;

            // user_claims에서 access_token 찾기
            if (!token) {
                const claims = authData[0]?.user_claims || [];
                for (const claim of claims) {
                    if (claim.typ === 'access_token') {
                        token = claim.val;
                        break;
                    }
                }
            }
        }

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'MS 토큰을 가져올 수 없어요. 다시 로그인해주세요.' },
                { status: 401 }
            );
        }

        // 3. shop_id 가져오기
        const body = await request.json().catch(() => ({}));
        const shopId = body.shop_id || request.cookies.get('shop_id')?.value;
        if (!principalId) principalId = request.cookies.get('user_id')?.value || shopId || null;

        // 4. 백엔드 sync-photos 호출
        const syncRes = await fetch(`${BACKEND_URL}/api/onedrive/sync-photos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-ms-token-aad-access-token': token,
                ...(principalId ? { 'X-MS-CLIENT-PRINCIPAL-ID': principalId } : {}),
            },
            body: JSON.stringify(body),
        });

        const syncData = await syncRes.json().catch(() => ({
            success: false,
            message: '서버 오류'
        }));

        return NextResponse.json(syncData, { status: syncRes.status });

    } catch (error) {
        console.error('[sync-onedrive] 오류:', error);
        return NextResponse.json(
            { success: false, message: '동기화 시작 실패' },
            { status: 500 }
        );
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
            `${BACKEND_URL}/api/onedrive/sync-status/${shopId}`,
            {
                headers: authSession
                    ? { Cookie: `AppServiceAuthSession=${authSession}` }
                    : {},
            }
        );

        const statusData = await statusRes.json();
        return NextResponse.json(statusData, { status: statusRes.status });

    } catch (error) {
        console.error('[sync-onedrive] 상태 조회 오류:', error);
        return NextResponse.json({ error: '상태 조회 실패' }, { status: 500 });
    }
}