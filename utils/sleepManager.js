// Sleep/Wake configuration for cost optimization
const SLEEP_AFTER_INACTIVE = 30 * 60 * 1000; // 30 minutes
const MAX_DAILY_UPTIME = 8 * 60 * 60 * 1000; // 8 hours per day

let lastActivity = Date.now();
let dailyUptime = 0;
let lastReset = new Date().getDate();

// Activity tracker middleware
const trackActivity = (req, res, next) => {
    const currentDate = new Date().getDate();
    
    // Reset daily counter
    if (currentDate !== lastReset) {
        dailyUptime = 0;
        lastReset = currentDate;
    }
    
    lastActivity = Date.now();
    next();
};

// Sleep checker
const checkSleepCondition = () => {
    const now = Date.now();
    const inactiveTime = now - lastActivity;
    
    // If inactive for 30 minutes OR daily limit reached
    if (inactiveTime > SLEEP_AFTER_INACTIVE || dailyUptime > MAX_DAILY_UPTIME) {
        console.log('🛌 Initiating sleep mode to save costs...');
        // Graceful shutdown
        process.exit(0);
    }
};

// Check every 5 minutes
setInterval(checkSleepCondition, 5 * 60 * 1000);

module.exports = { trackActivity };
