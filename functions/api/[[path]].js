
import { Router } from 'itty-router';

// Helper function to create a response
const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
};

const router = Router();

router.get('/api/status', async ({ env }) => {
    try {
        const status = await env.KSS1ST_STATUS.get('currentStatus');
        return jsonResponse({ status: status || '營業中' });
    } catch (error) {
        console.error('Error reading status from KV:', error);
        return jsonResponse({ error: 'Failed to read status' }, 500);
    }
});

router.post('/api/status', async (request, { env }) => {
    try {
        const { status } = await request.json();
        if (status) {
            await env.KSS1ST_STATUS.put('currentStatus', status);
            return jsonResponse({ success: true, status });
        } else {
            return jsonResponse({ success: false, message: 'Status is required' }, 400);
        }
    } catch (error) {
        console.error('Error writing status to KV:', error);
        return jsonResponse({ error: 'Failed to write status' }, 500);
    }
});

// Catch-all for static assets
router.all('*', ({ url }) => {
    // This is a simplified static asset handler.
    // Cloudflare Pages will serve static assets automatically from the root.
    // This catch-all is mainly to prevent errors for paths not handled above.
    return new Response('Not Found', { status: 404 });
});


export const onRequest = (context) => {
    return router.handle(context.request, context);
};
