
// Helper function to create a JSON response
const jsonResponse = (data, status = 200) => {
    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store', // Always fetch the latest status
    };
    return new Response(JSON.stringify(data), { status, headers });
};

// Main function to handle all requests
export const onRequest = async ({ request, env }) => {
    const url = new URL(request.url);

    // We only care about the /api/status endpoint
    if (url.pathname !== '/api/status') {
        // For any other path, let Cloudflare Pages handle it (e.g., serve static files or return 404)
        // We shouldn't return an error here, so we return an empty response that Pages will ignore.
        return new Response(null, { status: 404 });
    }

    // Handle GET requests to /api/status
    if (request.method === 'GET') {
        try {
            const status = await env.KSS1ST_STATUS.get('currentStatus');
            const validStatuses = ['영업중', '재료소진', '휴무'];
            const result = validStatuses.includes(status) ? status : '휴무';
            return jsonResponse({ status: result });
        } catch (e) {
            console.error('KV Read Error:', e);
            return jsonResponse({ error: 'Failed to read status from server.' }, 500);
        }
    }

    // Handle POST requests to /api/status
    if (request.method === 'POST') {
        try {
            const content = await request.json();
            const newStatus = content.status;
            const validStatuses = ['영업중', '재료소진', '휴무'];

            if (!newStatus || !validStatuses.includes(newStatus)) {
                return jsonResponse({ error: 'Invalid status value provided.' }, 400);
            }

            await env.KSS1ST_STATUS.put('currentStatus', newStatus);
            return jsonResponse({ success: true, status: newStatus });
        } catch (e) {
            console.error('KV Write Error:', e);
            return jsonResponse({ error: 'Failed to save status to server.' }, 500);
        }
    }

    // If any other method is used, return 405 Method Not Allowed
    return jsonResponse({ error: 'Method Not Allowed' }, 405);
};
