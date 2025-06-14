// Keep-alive service for Render free tier
// Pings the service every 14 minutes to prevent sleep

const RENDER_URL = process.env.RENDER_URL || 'https://pdf-converter-thailand.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

const keepAlive = () => {
    if (process.env.NODE_ENV === 'production' && RENDER_URL.includes('onrender.com')) {
        setInterval(async () => {
            try {
                const fetch = (await import('node-fetch')).default;
                const response = await fetch(`${RENDER_URL}/api/health`);
                console.log(`🏓 Keep-alive ping: ${response.status} at ${new Date().toISOString()}`);
            } catch (error) {
                console.log('⚠️ Keep-alive ping failed:', error.message);
            }
        }, PING_INTERVAL);
        
        console.log('🚀 Keep-alive service started for Render deployment');
    }
};

module.exports = { keepAlive };
