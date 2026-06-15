'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const DIAGRAM_SRC = "data:image/png;base64,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"

const UU_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIMAAAC1CAYAAAB8vkzWAAAFL0lEQVR4nO3c0XHaWBiG4c8Z3+WKLYGUQC5SALnMpbcEuwSnBLuE0IJLCCWEEpYSlhJ2Lw7ns0IAY+Dw/0LvM8NkJpkRing5RxKSbj5++6JGJpJGrRY+YCtJixYLvm2x0LUnSdOGyx+quaSvLRb8ocVC0U/EACMGGDHAiAFGDDBigBEDjBhgxAAjBhgxwIgBRgwwYoARA4wYYC2vdHpRo8uzBm7ZasEtY5g1XDYaYJqAEQOMGGDEACMGGDHAiAFGDDBigBEDjBhgxAAjBhgxwIgBRgwwYoARA4wYYMQAIwYYMcCIAUYMsFuV5ztHPeN5KW626Qr9LGoMj0ErMBcxdIV+FkwTMGKAEQOMGGDEACMGGDHAiAFGDDBigBEDjBhgxAAjBhgxwIgBRgwwYoARA4wYYMQAIwYYMcCIAUYMMGKAEQOMGGDEACMGGDHAiAFGDDBigBEDjBhgxAAjBhgxwIgBRgwwYoARA4wYYMQAIwYYMcCIAUYMMGKAEQOMGGDEACMGGDHAiAFGDDBigBEDjBhgxAAjBhgxwIgBRgwwYoARA4wYYMQAI4ZcRpFvTgy5jCPfnBhgxJALIwOMGCApOASJGDIZfAyT4PfPZBq9AtExhB5XJxO+LaJjwKvwUTJDDOHDYwIjJYlhHrwO4cNjAim+EBlGhvBvRALEsEYM0l30CkglhlXwOgw9homSTJUfJC2C1yHFzlOg++gVqDJME1KSOTNIiilCeo0henQY6shwryRThPQaQ/R+w50SbZQLSjNFSHlGBinZhrmAqZKNiFlGBml4MTxFr8CmTCPDWIl2php7VLJRQcoVgzSM0WGsEkM63WliGbkia1Nd/+jwpKQ7y93zDFlGh7Qb6wwelTj2jDGkHUZPNFHCncaubgzRP2V3pf4GHWEi6Wf0Srxlc2TIcIhZ/VDCPe4j1BDST32bv028hKzFdiOVINJvxD16E4L0ZwxZ9huqXm3MDb1b98wjQ9W7jaqyz/NL/VrnP2JYKW8Q/yj/PsRYJdzURw27bLueIWMMUvmW/VLeDf2ksn69vTZjVwwZzkbu8qgySmTZ6Pcq6/Oonk0Lm3Zd6ZR1dKjqcPxTMb9njFVGgn9VjnjC75M8h5uP375s+/uRSu19KX0laaZy4qzVybP6q+qd8u+7HGO+KwaplN/X08JzlcPkeiLtvYGM16/J+s+pruTbv8feGPo2Ohxiqf37QzWCIZrf7vnHOvT2dXTYZsgf9pveulT+WbmPLHBGb8WwkvT9EiuCeIfcRPOiXD9vo5FD76h6UK6ft9HAoTEsVfYfcMXec6/ls/KfmcQJ3nvj7YM4urha741hJelvsf/QUth0fMwt+QtxuNnKTIHb9tjnM4Su9JVaqEzDYU55WMezShQ43ULS1+iVOPXJLQ8iiFPNVUII3w87x2N8HsSUcayZkoQgne+ZTs8Knu96KN02O+cDvmaSPovzEG+ph+fpRtNzP+1toRIEZyq3myvx9mnx6L9aPienfvddZf8g7cjZ8jmQL5I+iR+45urJdmj9UNB6ccwnDe8QdKkyOqYeDbou9YTYpcqe8xCi6P5fU+4b7HLpxwV3N9SzrmufYq6eBx/17OilyvTxl8oG7NU3qKNeQf5ZZTroZQTVvkvlL2W2ftU7lqbKcx/lLi+d19XYdxNNpJFeb2PLcDfTUuWDX6hMB62nt/8aL3+bvTfRRKrDb1Vvfqlh1NveWr33YuN16aOBmwu/n6Qc08Qh6m1xm5fsjzde1SE3xnYfWTTf+HOQ/gf+EbAi/SqHowAAAABJRU5ErkJggg=="


const TEXT = 'Construye desde el centro.'

const css = `
.intro-stage{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5.5vh;padding:30px 16px;background:#000;z-index:9999;cursor:pointer}
.intro-markwrap{position:relative;display:inline-block;width:clamp(82px,22.4vw,136px);line-height:0}
.intro-diagram{width:100%;display:block;opacity:0;transform:scale(.94);transform-origin:center}
.intro-diagram.in{opacity:.45;transform:scale(1);transition:opacity 1.6s ease,transform 1.8s cubic-bezier(.16,1,.3,1)}
.intro-uu{position:absolute;left:50%;top:56%;width:14.8%;opacity:1;visibility:hidden;transform:translate(-50%,-50%) scale(.88)}
.intro-uu.in{visibility:visible;transform:translate(-50%,-50%) scale(1);transition:transform .9s cubic-bezier(.16,1,.3,1)}
.intro-line{font-family:var(--font-special-elite),'Courier New',monospace;font-size:34px;line-height:1.1;white-space:nowrap;color:#EDEBE3;opacity:0;filter:blur(7px);transform:scale(1.05)}
.intro-line.in{opacity:1;filter:blur(0);transform:scale(1);transition:opacity 2.2s ease,filter 2.2s ease,transform 2.4s cubic-bezier(.16,1,.3,1)}
.intro-cur{display:inline-block;width:.6em;height:1em;border-bottom:.085em solid #7FA277;vertical-align:baseline;transform:translateY(.02em);animation:intro-blink 1.02s steps(1) infinite}
@keyframes intro-blink{50%{opacity:0}}
.intro-hint{position:fixed;left:0;right:0;bottom:26px;text-align:center;font-family:var(--font-special-elite),monospace;font-size:11px;letter-spacing:.22em;color:#3A3A36;text-transform:uppercase;pointer-events:none;opacity:0;transition:opacity .8s ease}
.intro-hint.show{opacity:1}
.intro-stage.out{opacity:0;transition:opacity .6s ease}
@media (prefers-reduced-motion:reduce){.intro-diagram,.intro-uu,.intro-line,.intro-stage{transition:none!important;animation:none!important}}
`

export default function IntroOverlay() {
  const pathname = usePathname()
  const skipForRoute = pathname?.includes('/simulab') ?? false

  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    if (skipForRoute) return false
    return !sessionStorage.getItem('intro-seen')
  })

  // Remove the shield immediately when intro is skipped (route-based or returning visitor)
  useEffect(() => {
    if (!visible) {
      const shield = document.getElementById('intro-shield')
      if (shield) shield.style.display = 'none'
      document.body.style.background = ''
    }
  }, [visible])
  const [playing, setPlaying] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<HTMLImageElement>(null)
  const uuRef = useRef<HTMLImageElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const typedRef = useRef<HTMLSpanElement>(null)
  const curRef = useRef<HTMLSpanElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const playingRef = useRef(false)
  const dismissRef = useRef<() => void>(() => {})
  const runRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!visible) return

    // Remove the server-rendered shield — this overlay (z-index 9999) now covers everything.
    const shield = document.getElementById('intro-shield')
    if (shield) shield.style.display = 'none'

    const styleEl = document.createElement('style')
    styleEl.textContent = css
    document.head.appendChild(styleEl)

    const after = (ms: number, fn: () => void) => {
      const id = setTimeout(fn, ms)
      timersRef.current.push(id)
      return id
    }

    const clearAll = () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }

    const fitText = () => {
      if (!lineRef.current) return
      const target = Math.min(window.innerWidth * 0.92, 940)
      const probe = document.createElement('span')
      probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font-family:var(--font-special-elite),monospace;font-size:100px;letter-spacing:.01em"
      probe.textContent = TEXT + '  '
      document.body.appendChild(probe)
      const w = probe.getBoundingClientRect().width
      document.body.removeChild(probe)
      lineRef.current.style.fontSize = Math.max(16, Math.min(100 * target / w, 96)) + 'px'
    }

    const dismiss = () => {
      sessionStorage.setItem('intro-seen', '1')
      document.body.style.background = ''
      setVisible(false)
    }
    dismissRef.current = dismiss

    const finish = () => {
      if (curRef.current) curRef.current.style.display = 'none'
      if (hintRef.current) {
        hintRef.current.textContent = 'toca para saltar'
        hintRef.current.classList.add('show')
      }
      playingRef.current = false
      setPlaying(false)
      after(0, () => {
        if (stageRef.current) stageRef.current.classList.add('out')
        after(600, dismiss)
      })
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const run = () => {
      clearAll()
      fitText()
      playingRef.current = true
      setPlaying(true)

      const stage = stageRef.current
      const diagram = diagramRef.current
      const uu = uuRef.current
      const line = lineRef.current
      const typed = typedRef.current
      const cur = curRef.current
      const hint = hintRef.current

      if (!stage || !diagram || !uu || !line || !typed || !cur || !hint) return

      stage.classList.remove('out')
      diagram.classList.remove('in')
      uu.classList.remove('in')
      line.classList.remove('in')
      typed.textContent = TEXT
      cur.style.display = 'none'
      hint.classList.remove('show')
      hint.textContent = 'toca para saltar'
      void stage.offsetWidth

      if (reduce) {
        diagram.classList.add('in')
        uu.classList.add('in')
        line.classList.add('in')
        typed.textContent = TEXT
        finish()
        return
      }

      after(500,  () => diagram.classList.add('in'))
      after(1300, () => uu.classList.add('in'))
      after(1600, () => { if (playingRef.current) hint.classList.add('show') })
      after(1400, () => { line.classList.add('in'); hint.classList.remove('show') })
      after(4100, finish)
    }
    runRef.current = run

    // Defer run() by one rAF so React has flushed the JSX refs.
    // fitText also re-runs once fonts settle (text is still invisible at that point).
    requestAnimationFrame(() => {
      fitText()
      run()
      if (document.fonts?.ready) {
        document.fonts.ready.then(fitText)
      }
    })

    window.addEventListener('resize', fitText)

    return () => {
      clearAll()
      window.removeEventListener('resize', fitText)
      styleEl.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClick = () => {
    if (playingRef.current) {
      // Skip: show everything instantly, hide cursor, show "toca para repetir"
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      const diagram = diagramRef.current
      const uu = uuRef.current
      const line = lineRef.current
      const typed = typedRef.current
      const cur = curRef.current
      const hint = hintRef.current
      if (diagram) diagram.classList.add('in')
      if (uu) uu.classList.add('in')
      if (line) line.classList.add('in')
      if (typed) typed.textContent = TEXT
      if (cur) cur.style.display = 'none'
      if (hint) { hint.classList.remove('show'); hint.textContent = 'toca para continuar'; hint.classList.add('show') }
      playingRef.current = false
      setPlaying(false)
    } else {
      // Animation finished — dismiss on click
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      if (stageRef.current) stageRef.current.classList.add('out')
      setTimeout(dismissRef.current, 600)
    }
  }

  if (!visible) return null

  return (
    <>
      <div
        ref={stageRef}
        className="intro-stage"
        onClick={handleClick}
      >
        <div className="intro-markwrap">
          <img
            ref={diagramRef}
            className="intro-diagram"
            alt=""
            src={DIAGRAM_SRC}
          />
          <img
            ref={uuRef}
            className="intro-uu"
            alt=""
            src={UU_SRC}
          />
        </div>
        <div ref={lineRef} className="intro-line">
          <span ref={typedRef} />
          <span ref={curRef} className="intro-cur" />
        </div>
        <div ref={hintRef} className="intro-hint" />
      </div>
    </>
  )
}