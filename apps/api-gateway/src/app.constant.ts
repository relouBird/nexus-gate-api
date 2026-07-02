export const MICROSERVICES_CLIENTS = {
  AUTH_SERVICE: 'AUTH-SERVICE',
  USER_SERVICE: 'USER-SERVICE',
  CONFIGURATION_SERVICE: 'CONFIGURATION-SERVICE',
};

export const AUTH_PATTERNS = {
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',

  SEND_OTP: 'auth.send-otp',
  VERIFY_OTP: 'auth.verify-otp',

  RESET_PASSWORD: 'auth.reset-password',
  CHANGE_PASSWORD: 'auth.change-password',

  HELLO: 'hello.get',

  TEAM_REGISTER: 'team.register',
  TEAM_UPDATE: 'team.update',
  TEAM_DELETE: 'team.delete',
} as const;

export const USER_PATTERNS = {
  // Gérer les utilisateurs
  USERS_CREATE: 'users.create',
  USERS_DELETE: 'users.delete',
  USERS_FIND_ALL: 'users.findAll',
  USERS_FIND_ONE: 'users.findOne',
  USERS_UPDATE: 'users.update',

  // Pour l'utilisateur
  ME_GET: 'me.get',
  ME_CHANGE_PASSWORD: 'me.change.password',
  ME_CHANGE_USERNAME: 'me.change.username',
  ME_DELETE_ACCOUNT: 'me.delete.account',
  ME_HELLO: 'me.hello',
} as const;

export const CONFIGURATION_PATTERNS = {
  // Message d'entrée/ Test
  CONFIGURATION_HELLO: 'CONFIGURATION_HELLO',

  // Servers
  SERVER_CREATE: 'SERVER_CREATE',
  SERVER_FIND_ALL: 'SERVER_FIND_ALL',
  SERVER_FIND_ONE: 'SERVER_FIND_ONE',
  SERVER_UPDATE: 'SERVER_UPDATE',
  SERVER_REMOVE: 'SERVER_REMOVE',
  SERVER_TOKEN_AUTH: 'SERVER_TOKEN_AUTH',
  SERVER_SET_HEADER: 'SERVER_SET_HEADER',
  SERVER_REVOKE: 'SERVER_REVOKE',
  SERVER_GRANT: 'SERVER_GRANT',

  // Rules
  RULE_CREATE: 'RULE_CREATE',
  RULE_FIND_ALL: 'RULE_FIND_ALL',
  RULE_FIND_GLOBAL: 'RULE_FIND_GLOBAL',
  RULE_UPDATE: 'RULE_UPDATE',
  RULE_REMOVE: 'RULE_REMOVE',

  // Gateway Tokens
  GATEWAY_TOKEN_CREATE: 'GATEWAY_TOKEN_CREATE',
  GATEWAY_TOKEN_FIND_ALL: 'GATEWAY_TOKEN_FIND_ALL',
  GATEWAY_TOKEN_REMOVE: 'GATEWAY_TOKEN_REMOVE',

  // Logs
  LOGS_FIND_ALL: 'LOGS_FIND_ALL',
};
