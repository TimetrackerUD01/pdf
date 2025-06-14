module.exports = function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    res.json({ 
        status: 'OK', 
        message: 'เซิร์ฟเวอร์ทำงานปกติ',
        timestamp: new Date().toISOString(),
        features: [
            'รูปภาพเป็น PDF',
            'Text เป็น PDF', 
            'ลดขนาด PDF',
            'รวม PDF'        ]
    });
};
