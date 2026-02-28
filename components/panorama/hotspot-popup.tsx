"use client"

import { useRef, useEffect, useState } from 'react'
import { X, ArrowRight, Info, ImageIcon, FileText, Eye, Link as LinkIcon, Share2, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Hotspot } from '@/lib/tour-types'

interface HotspotPopupProps {
  hotspot: Hotspot
  onClose: () => void
  onNavigate?: (sceneId: string) => void
}

export default function HotspotPopup({ hotspot, onClose, onNavigate }: HotspotPopupProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  // Detect if content overflows so we can show a scroll indicator
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const check = () => setIsOverflowing(el.scrollHeight > el.clientHeight + 4)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [hotspot])

  const getTypeLabel = () => {
    switch (hotspot.type) {
      case 'scene-link': return 'Navigation'
      case 'image': return 'Image'
      case 'content': return 'Content'
      default: return 'Information'
    }
  }

  const getTypeIcon = () => {
    switch (hotspot.icon) {
      case 'eye': return <Eye className="h-3 w-3" />
      case 'link': return <LinkIcon className="h-3 w-3" />
      default:
        switch (hotspot.type) {
          case 'scene-link': return <ArrowRight className="h-3 w-3" />
          case 'image': return <ImageIcon className="h-3 w-3" />
          case 'content': return <FileText className="h-3 w-3" />
          default: return <Info className="h-3 w-3" />
        }
    }
  }

  const hasImage = hotspot.type === 'image' && hotspot.imageUrl
  const hasDescription = !!hotspot.description
  const hasContent = hotspot.type === 'content' && !!hotspot.content
  const hasNavigation = hotspot.type === 'scene-link' && !!hotspot.targetSceneId

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto animate-in fade-in-0 duration-300"
        onClick={onClose}
      />

      {/* Popup card */}
      <div className="pointer-events-auto relative z-10 flex flex-col bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)_inset] w-[92vw] sm:w-auto sm:min-w-[320px] sm:max-w-[min(85vw,540px)] max-h-[80vh] overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300">

        {/* Header bar */}
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex items-center justify-center h-7 w-7 rounded-lg flex-shrink-0"
              style={{ backgroundColor: hotspot.color || 'var(--color-primary)', color: 'white' }}
            >
              {getTypeIcon()}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground leading-none">
                {getTypeLabel()}
              </span>
              <h3 className="text-sm font-semibold text-card-foreground leading-snug truncate mt-0.5">
                {hotspot.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <button
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Expand"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/60 mx-5 flex-shrink-0" />

        {/* Scrollable content area */}
        <div
          ref={contentRef}
          className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 overscroll-contain"
        >
          {/* Image */}
          {hasImage && (
            <div className="w-full bg-black/20 flex-shrink-0">
              <img
                src={hotspot.imageUrl}
                alt={hotspot.title}
                className="w-full max-h-72 object-contain"
                crossOrigin="anonymous"
              />
            </div>
          )}

          {/* Text content */}
          <div className="px-5 py-4">
            {/* Description */}
            {hasDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                {hotspot.description}
              </p>
            )}

            {/* Rich content */}
            {hasContent && (
              <div
                className="text-sm text-muted-foreground leading-relaxed prose prose-sm prose-invert max-w-none break-words [&_*]:break-words [overflow-wrap:anywhere] [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                dangerouslySetInnerHTML={{ __html: hotspot.content! }}
              />
            )}

            {/* No content fallback */}
            {!hasDescription && !hasContent && !hasImage && !hasNavigation && (
              <p className="text-sm text-muted-foreground/60 italic">No additional information available.</p>
            )}
          </div>
        </div>

        {/* Scroll fade indicator */}
        {isOverflowing && (
          <div className="h-6 bg-gradient-to-t from-card/95 to-transparent pointer-events-none flex-shrink-0 -mt-6 relative z-10" />
        )}

        {/* Navigation button */}
        {hasNavigation && (
          <div className="px-5 pb-4 pt-1 flex-shrink-0">
            <div className="h-px bg-border/60 mb-3" />
            <Button
              onClick={() => onNavigate?.(hotspot.targetSceneId!)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium rounded-xl h-10"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Navigate to Scene
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
