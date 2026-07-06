// infrastructure/HttpClient.ts
import { request } from 'undici';

export interface ProxyResponse {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: Buffer;
}

export async function forwardHttp(
  targetUrl: string,
  method: string,
  headers: Record<string, string>,
  body: Buffer | null,
): Promise<ProxyResponse> {
  const { statusCode, headers: resHeaders, body: resBody } = await request(targetUrl, {
    method: method as any,
    headers,
    body: body && body.length > 0 ? body : undefined,
  });

  const chunks: Buffer[] = [];
  for await (const chunk of resBody) chunks.push(chunk as Buffer);

  return { statusCode, headers: resHeaders, body: Buffer.concat(chunks) };
}