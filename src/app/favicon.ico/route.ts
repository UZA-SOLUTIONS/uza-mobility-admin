import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-static';

/**
 * Serve brand logo for `/favicon.ico` fallback requests.
 */
export async function GET() {
  const filePath = join(process.cwd(), 'public', 'images', 'FInal-logo.png');
  const buffer = await readFile(filePath);
  return new Response(buffer, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  });
}
