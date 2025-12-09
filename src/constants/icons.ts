/**
 * 图标常量
 * 定义所有可用的图标类名
 */

export const LINECONS_ICONS = {
  STAR: 'linecons-star',           // 星星
  DOC: 'linecons-doc',             // 文档
  LIGHTBULB: 'linecons-lightbulb', // 灯泡
  THUMBS_UP: 'linecons-thumbs-up', // 赞
  DIAMOND: 'linecons-diamond',     // 钻石
  PENCIL: 'linecons-pencil',       // 铅笔
  USER: 'linecons-user',           // 用户
  HEART: 'linecons-heart',         // 心形
  COG: 'linecons-cog',             // 齿轮
  TAG: 'linecons-tag',             // 标签
} as const

export const FONTAWESOME_ICONS = {
  STAR: 'fa-star',                 // 星星
  BARS: 'fa-bars',                 // 菜单
  GITHUB: 'fa-github',             // GitHub
  SEARCH: 'fa-search',             // 搜索
  HEART: 'fa-heart',               // 心形
  LINK: 'fa-link',                 // 链接
  EXTERNAL_LINK: 'fa-external-link', // 外部链接
} as const

export const ICON_DESCRIPTIONS = {
  [LINECONS_ICONS.STAR]: '常用推荐',
  [LINECONS_ICONS.DOC]: '社区资讯',
  [LINECONS_ICONS.LIGHTBULB]: '灵感采集',
  [LINECONS_ICONS.THUMBS_UP]: '素材资源',
  [LINECONS_ICONS.DIAMOND]: '常用工具',
  [LINECONS_ICONS.PENCIL]: '学习教程',
  [LINECONS_ICONS.USER]: 'UED团队',
  [LINECONS_ICONS.HEART]: '关于本站',
} as const

