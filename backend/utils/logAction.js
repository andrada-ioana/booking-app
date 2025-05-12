const { UserLog } = require('../models');

async function logAction(userId, action, entity, entityId = null) {
  try {
    await UserLog.create({ userId, action, entity, entityId });
  } catch (err) {
    console.error("Logging error:", err);
  }
}

module.exports = { logAction };
