export const jwtConstants = {
  secret:
    'GyNpgC2ErYMDAAAACgAAAEcAAAAOAAAALS7RQI-Xg0Gr4wBDJkS_QQMAAAAKAAAARwAAAA4AAAC0HQAAroeUAOJGPgDShpQAWkc-AAIAzwEAAAAA',
};

export const CONFIGURATION_PATTERNS = {
  CONFIGURATION_HELLO: 'configuration.hello',
} as const;

export const FINAL_PATTERNS = {
  ...CONFIGURATION_PATTERNS,
};
