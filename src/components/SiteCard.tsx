'use client'

import { Site } from '@/types/nav'

interface SiteCardProps {
  site: Site
}

export default function SiteCard({ site }: SiteCardProps) {
  return (
    <div
      className="xe-widget xe-conversations box2 label-info"
      onClick={() => window.open(site.url, '_blank')}
      style={{ cursor: 'pointer' }}
      data-toggle="tooltip"
      data-placement="bottom"
      title={site.url}
    >
      <div className="xe-comment-entry">
        <a className="xe-user-img">
          <img
            src={site.logo}
            className="lozad img-circle"
            width="40"
            alt={site.name}
            onError={(e) => {
              const img = e.target as HTMLImageElement
              img.src = '/assets/images/favicon.png'
            }}
          />
        </a>
        <div className="xe-comment">
          <a href={site.url} target="_blank" rel="noopener noreferrer" className="xe-user-name overflowClip_1">
            <strong>{site.name}</strong>
          </a>
          <p className="overflowClip_2">{site.desc}</p>
        </div>
      </div>
    </div>
  )
}

