// server/readBody.ts
import { UWSHttpResponse } from '../types/server.type';

export function readBody(res: UWSHttpResponse): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    res.onData((chunk, isLast) => {
      chunks.push(Buffer.from(chunk.slice(0)));
      if (isLast) resolve(Buffer.concat(chunks));
    });
  });
}
