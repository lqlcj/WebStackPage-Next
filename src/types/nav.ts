/**
 * Navigation Data Type Definitions
 * 导航数据类型定义
 */

export interface Site {
  name: string;
  url: string;
  desc: string;
  logo: string; // 图片路径
}

// 类型1: 普通一级分类 (直接包含网址)
export interface CategoryLink {
  id: string;       // 锚点ID, 如 "recommend"
  type: "link";
  title: string;    // 如 "常用推荐"
  icon: string;     // FontAwesome/Linecons 类名, 如 "linecons-star"
  items: Site[];    // 该分类下的网址列表
}

// 类型2: 折叠目录 (包含子分类)
export interface SubMenuFolder {
  id: string;
  type: "folder";
  title: string;    // 如 "灵感采集"
  icon: string;
  children: CategoryLink[]; // 子分类列表 (注意: 子分类才是包含 items 的容器)
}

export type MenuItem = CategoryLink | SubMenuFolder;

export interface NavData {
  menus: MenuItem[]; // 侧边栏菜单
}

