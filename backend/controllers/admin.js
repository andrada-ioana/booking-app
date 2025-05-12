const { MonitoredUser, User } = require('../models');

exports.getMonitoredUsers = async (req, res) => {
  try {
    const users = await MonitoredUser.findAll({
      include: [{ model: User, attributes: ['username', 'role'] }]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch monitored users' });
  }
};
