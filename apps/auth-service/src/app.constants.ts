import { GATEWAY_TOKEN_PATTERNS } from './gateway-token/gateway-token.constants';
import { TEAM_PATTERNS } from './team/team.constants';

export const jwtConstants = {
  secret:
    'GyNpgC2ErYMDAAAACgAAAEcAAAAOAAAALS7RQI-Xg0Gr4wBDJkS_QQMAAAAKAAAARwAAAA4AAAC0HQAAroeUAOJGPgDShpQAWkc-AAIAzwEAAAAA',
};

export const AUTH_PATTERNS = {
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  SEND: 'auth.send-otp',
  VERIFY: 'auth.verify-otp',
  SEND_PASSWORD_RESET: 'auth.reset-password',
  CHANGE_PASSWORD: 'auth.change-password',
  HELLO: 'hello.get',
} as const;

export const FINAL_PATTERNS = {
  ...AUTH_PATTERNS,
  ...GATEWAY_TOKEN_PATTERNS,
  ...TEAM_PATTERNS,
};
