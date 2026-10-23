// Plain, table-free HTML that renders the same in every mail client.

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export const escapeHTML = escape

export const brandedEmail = ({
  heading,
  body,
  button,
}: {
  heading: string
  /** Trusted HTML. Escape any user-supplied text with escapeHTML first. */
  body: string
  button?: { label: string; url: string }
}) => `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#F5F4F1;font-family:Helvetica,Arial,sans-serif;color:#17181C;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="margin:0 0 24px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7A1F2B;font-weight:bold;">
      SSPX Cape Town · Our Lady of the Blessed Sacrament
    </p>
    <div style="background:#FFFFFF;border:1px solid #E3E0D9;padding:32px;">
      <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:normal;font-size:28px;line-height:1.2;">${escape(heading)}</h1>
      <div style="font-size:15px;line-height:1.6;">${body}</div>
      ${
        button
          ? `<p style="margin:28px 0 0;"><a href="${escape(button.url)}" style="display:inline-block;background:#7A1F2B;color:#FFFFFF;text-decoration:none;font-weight:bold;padding:14px 24px;">${escape(button.label)}</a></p>
      <p style="margin:16px 0 0;font-size:12px;color:#5B5E66;word-break:break-all;">Or paste this link into your browser: ${escape(button.url)}</p>`
          : ''
      }
    </div>
    <p style="margin:24px 0 0;font-size:12px;color:#5B5E66;">Chapel of Our Lady of the Blessed Sacrament · 2a St Stephens Road, Pinelands, Cape Town</p>
  </div>
</body>
</html>`
