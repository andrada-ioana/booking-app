const { UserLog, MonitoredUser, User } = require('../models');
const { Op } = require('sequelize');

const ACTION_THRESHOLD = 50; // suspicious if >50 actions/day

async function monitorSuspiciousUsers() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const logs = await UserLog.findAll({
    where: { timestamp: { [Op.gt]: yesterday } },
    attributes: ['userId'],
  });

  const counts = {};

  logs.forEach(log => {
    counts[log.userId] = (counts[log.userId] || 0) + 1;
  });

  for (const userId in counts) {
    if (counts[userId] > ACTION_THRESHOLD) {
      const alreadyMonitored = await MonitoredUser.findOne({ where: { userId } });
      if (!alreadyMonitored) {
        await MonitoredUser.create({
          userId,
          reason: `More than ${ACTION_THRESHOLD} actions in the past day`,
        });
        console.log(`User ${userId} flagged for excessive activity`);
      }
    }
  }
}

function startMonitorThread() {
  setInterval(monitorSuspiciousUsers, 60 * 60 * 1000); // every hour
}

module.exports = { startMonitorThread, monitorSuspiciousUsers };
