import { USER_PATTERNS } from './user/user.constants';

export const jwtConstants = {
  secret:
    'GyNpgC2ErYMDAAAACgAAAEcAAAAOAAAALS7RQI-Xg0Gr4wBDJkS_QQMAAAAKAAAARwAAAA4AAAC0HQAAroeUAOJGPgDShpQAWkc-AAIAzwEAAAAA',
};

export const ME_PATTERNS = {
  ME_GET: 'me.get',
  ME_CHANGE_PASSWORD: 'me.change.password',
  ME_CHANGE_USERNAME: 'me.change.username',
  ME_HELLO: 'me.hello',
} as const;

export const FINAL_PATTERNS = {
  ...USER_PATTERNS,
  ...ME_PATTERNS,
};
