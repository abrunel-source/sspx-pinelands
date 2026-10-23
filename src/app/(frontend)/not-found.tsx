import Link from 'next/link'

import { Divider } from '@/components/site/Ornament'

export default function NotFound() {
  return (
    <div className="pat-cream">
      <div className="container section notice" style={{ margin: '0 auto' }}>
        <p className="eyebrow">Page not found</p>
        <h1 className="display">We could not find that page</h1>
        <Divider />
        <p className="lede">
          It may have moved when the website was renewed. The Mass times, directions and news are all on the home page.
        </p>
        <Link href="/" className="btn btn-wine">Go to the home page</Link>
      </div>
    </div>
  )
}
