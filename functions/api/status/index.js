
// functions/api/status/index.js
// This file is specifically crafted to handle requests for the /api/status path using directory-based routing.

/**
 * Helper function to create a standard JSON response.
 * It enforces no-caching to ensure clients always get the latest status.
 */
const jsonResponse = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store', // Ensure no caching by clients or CDNs
        },
    });
};

/**
 * Handles GET requests.
 * Reads the current status from the KV store and returns it.
 */
export const onRequestGet = async ({ env }) => {
    try {
        // Access the KV namespace via the env binding.
        const status = await env.KSS1ST_STATUS.get('currentStatus');
        const validStatuses = ['영업중', '재료소진', '휴무'];

        // Validate the value read from KV.
        // If the value is missing or invalid, default to '휴무'.
        const result = validStatuses.includes(status) ? status : '휴무';
        
        return jsonResponse({ status: result });
    } catch (e) {
        // If any error occurs reading from KV, return a server error.
        console.error('KV Read Error in onRequestGet:', e);
        return jsonResponse({ error: 'Failed to read status from server.' }, 500);
    }
};

/**
 * Handles POST requests.
 * Writes the new status from the request body to the KV store.
 */
export const onRequestPost = async ({ request, env }) => {
    try {
        const content = await request.json();
        const newStatus = content?.status; // Optional chaining for safety
        const validStatuses = ['영업중', '재료소진', '휴무'];

        // Validate the new status value from the request.
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return jsonResponse({ error: 'Invalid status value provided.' }, 400);
        }

        // Save the new status to KV.
        await env.KSS1ST_STATUS.put('currentStatus', newStatus);
        
        return jsonResponse({ success: true, status: newStatus });
    } catch (e) {
        // If any error occurs during request processing or KV write, return a server error.
        console.error('KV Write Error in onRequestPost:', e);
        return jsonResponse({ error: 'Failed to save status to server.' }, 500);
    }
};

