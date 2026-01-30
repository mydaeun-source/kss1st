
import { Router, error, json } from 'itty-router';

// /api 경로를 기본으로 사용하는 새 라우터를 생성합니다.
const router = Router({ base: '/api' });

router.get('/status', async (req, env) => {
    try {
        const status = await env.KSS1ST_STATUS.get('currentStatus');
        
        // KV에 혹시 잘못된 값이 있더라도, 항상 유효한 값 중 하나를 반환하도록 보장합니다.
        const validStatuses = ['영업중', '재료소진', '휴무'];
        const result = validStatuses.includes(status) ? status : '휴무';
        
        // Cache-Control 헤더를 포함하여 항상 최신 정보를 가져오도록 합니다.
        return json({ status: result }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (e) {
        console.error('KV에서 상태 읽기 실패:', e);
        return error(500, '서버에서 상태를 가져오는 데 실패했습니다.');
    }
});

router.post('/status', async (req, env) => {
    try {
        const content = await req.json();
        const newStatus = content.status;
        const validStatuses = ['영업중', '재료소진', '휴무'];

        // 요청에 포함된 상태 값이 유효한지 확인합니다.
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return error(400, '잘못된 상태 값입니다.');
        }

        await env.KSS1ST_STATUS.put('currentStatus', newStatus);
        return json({ success: true, status: newStatus });

    } catch (e) {
        console.error('KV에 상태 쓰기 실패:', e);
        return error(500, '서버에 상태를 저장하는 데 실패했습니다.');
    }
});

// 정의되지 않은 모든 /api 경로 요청은 자동으로 404 에러를 반환합니다.

// 모든 요청을 라우터가 처리하도록 내보냅니다.
export const onRequest = ({ request, env }) => {
    return router.handle(request, env)
        .catch(err => {
            console.error("라우터에서 예상치 못한 에러 발생:", err);
            return error(500, '서버에서 예상치 못한 오류가 발생했습니다.');
        });
};
