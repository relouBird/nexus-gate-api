export const MICROSERVICES_CLIENTS = {
  AUTH_SERVICE: 'AUTH-SERVICE',
  USER_SERVICE: 'USER-SERVICE',
  NETWORK_SERVICE: 'NETWORK-SERVICE',
};

export const AUTH_PATTERNS = {
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',

  SEND_OTP: 'auth.send-otp',
  VERIFY_OTP: 'auth.verify-otp',

  RESET_PASSWORD: 'auth.reset-password',
  CHANGE_PASSWORD: 'auth.change-password',

  HELLO: 'hello.get',

  GATEWAY_TOKEN_CREATE: 'gateway-token.create',
  GATEWAY_TOKEN_FIND_ALL: 'gateway-token.findAll',
  GATEWAY_TOKEN_REVOKE: 'gateway-token.revoke',

  TEAM_REGISTER: 'team.register',
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
