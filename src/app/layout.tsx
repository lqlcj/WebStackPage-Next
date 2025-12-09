import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'WebStack.cc - 设计师网址导航',
  description: 'WebStack - 收集国内外优秀设计网站、UI设计资源网站、灵感创意网站、素材资源网站，定时更新分享优质产品设计书签。',
  keywords: 'UI设计,UI设计素材,设计导航,网址导航,设计资源,创意导航,创意网站导航,设计师网址大全,设计素材大全,设计师导航,UI设计资源',
  authors: [{ name: 'viggo' }],
  openGraph: {
    type: 'article',
    url: 'http://www.webstack.cc/',
    title: 'WebStack.cc - 设计师网址导航',
    description: 'WebStack - 收集国内外优秀设计网站、UI设计资源网站、灵感创意网站、素材资源网站',
    images: [
      {
        url: '/assets/images/webstack_banner_cn.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebStack.cc - 设计师网址导航',
    description: 'WebStack - 收集国内外优秀设计网站、UI设计资源网站、灵感创意网站、素材资源网站',
    images: ['/assets/images/webstack_banner_cn.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <link rel="shortcut icon" href="/assets/images/favicon.png" />
        <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Arimo:400,700,400italic" />
        <link rel="stylesheet" href="/assets/css/fonts/linecons/css/linecons.css" />
        <link rel="stylesheet" href="/assets/css/fonts/fontawesome/css/font-awesome.min.css" />
        <link rel="stylesheet" href="/assets/css/bootstrap.css" />
        <link rel="stylesheet" href="/assets/css/xenon-core.css" />
        <link rel="stylesheet" href="/assets/css/xenon-components.css" />
        <link rel="stylesheet" href="/assets/css/xenon-skins.css" />
        <link rel="stylesheet" href="/assets/css/nav.css" />
      </head>
      <body className="page-body">
        {children}
      </body>
    </html>
  )
}

