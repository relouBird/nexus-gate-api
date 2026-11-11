import { TEAM_PATTERNS } from './team/team.constants';

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
  ...TEAM_PATTERNS,
};
