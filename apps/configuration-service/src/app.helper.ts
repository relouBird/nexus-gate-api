import { FINAL_PATTERNS } from './app.constants';

const colors = {
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

export function printRpcPatterns() {
  const pid = process.pid;
  const date = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const label = 'AuthService';

  console.log('');

  console.log(
    `\x1b[32m[Nest]\x1b[0m \x1b[32m${pid}\x1b[0m  - ${date}     \x1b[32mLOG   \x1b[0m ${colors.yellow}[${label}]${colors.reset} RPC Patterns initialized`,
  );

  Object.entries(FINAL_PATTERNS).forEach(([key, value]) => {
    console.log(
      `\x1b[32m[Nest]\x1b[0m \x1b[32m${pid}\x1b[0m  - ${date}     \x1b[36mMAPPED\x1b[0m ${colors.yellow}[${label}]${colors.reset} ${colors.cyan}${key.padEnd(
        24,
      )}${colors.reset} - ${value}`,
    );
  });

  console.log(
    `\x1b[32m[Nest]\x1b[0m \x1b[32m${pid}\x1b[0m  - ${date}     \x1b[32mLOG   \x1b[0m ${colors.yellow}[${label}]${colors.reset} RPC patterns loaded successfuly`,
  );

  console.log('');
}
