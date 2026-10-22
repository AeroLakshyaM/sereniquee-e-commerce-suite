export const escapeEmailHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character] || character));

export interface EmailCta { label: string; url: string }
export interface BrandedEmailOptions {
  title: string;
  greeting?: string;
  content: string;
  cta?: EmailCta;
  preheader?: string;
}

export function brandedEmail({ title, greeting, content, cta, preheader }: BrandedEmailOptions): string {
  const safeTitle = escapeEmailHtml(title);
  const safePreheader = escapeEmailHtml(preheader || title);
  const button = cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto"><tr><td style="border-radius:6px;background:#806346"><a href="${escapeEmailHtml(cta.url)}" style="display:inline-block;padding:14px 24px;border-radius:6px;color:#fff;text-decoration:none;font-weight:bold;font-size:14px">${escapeEmailHtml(cta.label)}</a></td></tr></table>`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${safeTitle}</title></head><body style="margin:0;background:#f5f2ed;padding:24px 10px;font-family:Arial,Helvetica,sans-serif;color:#372f28"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${safePreheader}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;border:1px solid #e8dfd4;border-radius:12px;overflow:hidden"><tr><td align="center" style="padding:28px 24px 22px;background:#fbf8f3;border-bottom:1px solid #eee7de"><a href="https://www.sereniqueecandles.com" style="text-decoration:none"><img src="https://www.sereniqueecandles.com/footer-logo.png" alt="Sereniquee Candles" width="150" style="display:block;width:150px;max-width:100%;height:auto;margin:0 auto 12px"></a><div style="font:12px Georgia,serif;letter-spacing:2px;color:#806346">KINDNESS CRAFTED, LIGHT SHARED</div></td></tr><tr><td style="padding:32px 30px"><h1 style="margin:0 0 20px;font:normal 28px Georgia,'Times New Roman',serif;color:#49392c">${safeTitle}</h1>${greeting ? `<p style="margin:0 0 18px;font-size:15px;line-height:1.7">${greeting}</p>` : ''}<div style="font-size:15px;line-height:1.75;color:#51483f">${content}</div>${button}<p style="margin:26px 0 0;font-size:14px;line-height:1.7">Warm regards,<br><strong>Sereniquee Candles</strong></p></td></tr><tr><td style="padding:24px 28px;background:#fbf8f3;border-top:1px solid #eee7de"><p style="margin:0 0 10px;text-align:center;font:16px Georgia,serif;color:#49392c">Here to help</p><p style="margin:0;text-align:center;font-size:12px;line-height:1.9;color:#6e6258"><a href="mailto:sereniqueecandles@gmail.com" style="color:#70563e">sereniqueecandles@gmail.com</a><br><a href="tel:+919827310636" style="color:#70563e">+91 98273 10636</a> &nbsp;·&nbsp; <a href="tel:+918770222006" style="color:#70563e">+91 87702 22006</a><br>131, Telephone Nagar, Indore, Madhya Pradesh 452018, India<br><a href="https://www.sereniqueecandles.com" style="color:#70563e">www.sereniqueecandles.com</a><br><a href="https://www.instagram.com/sereniquee.candles.co" style="color:#70563e">Instagram</a> &nbsp;·&nbsp; <a href="https://facebook.com/sereniquee" style="color:#70563e">Facebook</a></p><p style="margin:18px 0 0;text-align:center;font-size:11px;color:#9a8e83">© ${new Date().getFullYear()} Sereniquee Candles. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`;
}

export const emailParagraph = (text: string) => `<p style="margin:0 0 16px">${text}</p>`;
