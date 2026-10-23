// Shown on the admin login, forgot-password and create-first-user screens.
export const Logo = () => (
  <div className="sspx-admin-logo">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/brand/fsspx-wordmark.svg"
      alt="FSSPX, Society of Saint Pius X"
      width={300}
      height={26}
      className="sspx-admin-logo__wordmark"
    />
    <span className="sspx-admin-logo__sub">Our Lady of the Blessed Sacrament · Cape Town</span>
  </div>
)
