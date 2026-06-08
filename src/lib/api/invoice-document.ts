/** Extract HTML from invoice document responses (raw HTML or JSON envelope). */
export function parseInvoiceDocumentHtml(
  raw: string,
  contentType: string | null,
): string {
  const trimmed = raw.trimStart();
  if (
    contentType?.includes('application/json') ||
    trimmed.startsWith('{') ||
    trimmed.startsWith('[')
  ) {
    try {
      const parsed = JSON.parse(raw) as {
        success?: boolean;
        data?: unknown;
      };
      if (typeof parsed.data === 'string') {
        return parsed.data;
      }
    } catch {
      // Use raw body when not JSON.
    }
  }
  return raw;
}

export function openInvoiceDocumentInNewTab(html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function invoiceDocumentFilename(invoiceNumber: string) {
  const safe = invoiceNumber.replace(/[^\w.-]+/g, '_').trim();
  return `${safe || 'invoice'}.html`;
}

/** Trigger a browser download of the invoice HTML file. */
export function downloadInvoiceDocumentHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function fetchAuthenticatedInvoiceDocument(
  url: string,
  accessToken: string,
): Promise<string> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error('Could not load invoice document');
  }
  const raw = await response.text();
  return parseInvoiceDocumentHtml(raw, response.headers.get('content-type'));
}
