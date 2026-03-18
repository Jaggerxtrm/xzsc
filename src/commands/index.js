'use strict';

// Export all command handlers
module.exports = {
  install: require('./install').install,
  update: require('./update').update,
  status: require('./status').status,
  theme: require('./theme').theme,
  config: require('./config').config,
  rollback: require('./rollback').rollback,
  backup: require('./backup').backup
};
