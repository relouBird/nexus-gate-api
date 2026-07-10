// rules/ipUtils.ts

function ipToInt(ip: string): number {
  const parts = ip.trim().split('.').map((n) => Number(n));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    throw new Error(`Invalid IPv4 address: ${ip}`);
  }

  return (
    ((parts[0] << 24) >>> 0) +
    ((parts[1] << 16) >>> 0) +
    ((parts[2] << 8) >>> 0) +
    (parts[3] >>> 0)
  ) >>> 0;
}

function parseCidr(cidr: string): { start: number; end: number } {
  const [base, bitsRaw] = cidr.split('/');
  const bits = bitsRaw === undefined ? 32 : Number(bitsRaw);

  if (!base || !Number.isInteger(bits) || bits < 0 || bits > 32) {
    throw new Error(`Invalid CIDR: ${cidr}`);
  }

  const baseInt = ipToInt(base);
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  const start = baseInt & mask;
  const end = (start | (~mask >>> 0)) >>> 0;

  return { start, end };
}

function parseIpRange(range: string): { start: number; end: number } {
  const value = range.trim();

  if (value.includes('/')) {
    return parseCidr(value);
  }

  if (value.includes('-')) {
    const [startRaw, endRaw] = value.split('-').map((s) => s.trim());
    if (!startRaw || !endRaw) {
      throw new Error(`Invalid IP range: ${range}`);
    }

    const start = ipToInt(startRaw);
    const end = ipToInt(endRaw);

    if (start > end) {
      throw new Error(`Invalid IP range order: ${range}`);
    }

    return { start, end };
  }

  const ip = ipToInt(value);
  return { start: ip, end: ip };
}

export function isIpInRange(ip: string, range: string): boolean {
  const target = ipToInt(ip);
  const { start, end } = parseIpRange(range);
  return target >= start && target <= end;
}