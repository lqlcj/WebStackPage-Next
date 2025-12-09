/**
 * 网站配置
 */

export const siteConfig = {
  // 基本信息
  name: 'Leyili',
  title: 'Leyili - 泰迪熊网址导航',
  description:
    'Leyili - 收集国内外优秀网站、前端UI设计资源网站、灵感创意网站、素材资源网站，定时更新分享优质产品设计书签。',
  url: 'https://www.webstack.cc',
  ogImage: '/assets/images/webstack_banner_cn.png',

  // 作者信息
  author: {
    name: 'Leyili',
    url: 'https://github.com/lqlcj/WebStackPage-Next',
  },

  // 社交链接
  social: {
    github: 'https://github.com/lqlcj/WebStackPage-Next',
  },

  // SEO 关键词
  keywords: [
    'UI设计',
    'UI设计素材',
    '设计导航',
    '网址导航',
    '设计资源',
    '创意导航',
    '设计师网址大全',
    '设计素材大全',
    '设计师导航',
    '前端资源',
  ],

  // 功能开关
  features: {
    search: false,           // 搜索功能
    favorites: false,       // 收藏功能（需要实现）
    darkMode: false,        // 深色模式（需要实现）
    analytics: false,       // 分析功能（需要配置）
  },

  // 缓存配置
  cache: {
    navData: 3600,          // 导航数据缓存时间（秒）
    images: 86400,          // 图片缓存时间（秒）
  },

  // API 配置
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 5000,          // 请求超时（毫秒）
  },
} as const

export type SiteConfig = typeof siteConfig

