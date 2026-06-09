'use client'

import dynamic from 'next/dynamic'

const IntroOverlay = dynamic(() => import('./IntroOverlay'), { ssr: false })

export function IntroOverlayLoader() {
  return <IntroOverlay />
}
