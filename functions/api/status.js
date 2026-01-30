
// functions/api/status.js
// 이 파일은 오직 /api/status 경로의 요청만을 처리하기 위해 특별히 제작되었습니다.

/**
 * Helper function to create a standard JSON response.
 * It enforces no-caching to ensure clients always get the latest status.
 */
const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store', // 클라이언트나 CDN에 캐시되지 않도록 보장
        },
    });
};

/**
 * GET 요청을 처리하는 함수
 * KV 저장소에서 현재 상태를 읽어와 반환합니다.
 */
export const onRequestGet = async ({ env }) => {
    try {
        // env.KSS1ST_STATUS 바인딩을 통해 KV 네임스페이스에 접근합니다.
        const status = await env.KSS1ST_STATUS.get('currentStatus');
        const validStatuses = ['영업중', '재료소진', '휴무'];

        // KV에서 읽은 값이 유효한 상태 값 중 하나인지 확인합니다.
        // 만약 값이 없거나 유효하지 않은 경우, 기본값으로 '휴무'를 사용합니다.
        const result = validStatuses.includes(status) ? status : '휴무';
        
        return jsonResponse({ status: result });
    } catch (e) {
        // KV에서 값을 읽어오는 중 에러가 발생하면, 서버 에러를 반환합니다.
        console.error('KV Read Error in onRequestGet:', e);
        return jsonResponse({ error: '서버에서 상태를 읽어오는 데 실패했습니다.' }, 500);
    }
};

/**
 * POST 요청을 처리하는 함수
 * 요청 본문에 포함된 새 상태 값을 KV 저장소에 기록합니다.
 */
export const onRequestPost = async ({ request, env }) => {
    try {
        const content = await request.json();
        const newStatus = content?.status; // Optional chaining for safety
        const validStatuses = ['영업중', '재료소진', '휴무'];

        // 요청받은 상태 값이 유효한지 확인합니다.
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return jsonResponse({ error: '제공된 상태 값이 유효하지 않습니다.' }, 400);
        }

        // 새 상태를 KV에 저장합니다.
        await env.KSS1ST_STATUS.put('currentStatus', newStatus);
        
        return jsonResponse({ success: true, status: newStatus });
    } catch (e) {
        // 요청 처리 또는 KV 쓰기 중 에러가 발생하면, 서버 에러를 반환합니다.
        console.error('KV Write Error in onRequestPost:', e);
        return jsonResponse({ error: '서버에 상태를 저장하는 데 실패했습니다.' }, 500);
    }
};

