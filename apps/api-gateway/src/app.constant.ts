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
