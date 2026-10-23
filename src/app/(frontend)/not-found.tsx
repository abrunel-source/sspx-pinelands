import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container section notice">
      <p className="eyebrow">Page not found</p>
      <h1 className="display">We could not find that page</h1>
      <p className="lede" style={{ marginTop: 16 }}>
        It may have moved when the website was renewed. The Mass times, directions and news are all on the home page.
      </p>
      <Link href="/" className="btn btn-wine">Go to the home page</Link>
    </div>
  )
}
