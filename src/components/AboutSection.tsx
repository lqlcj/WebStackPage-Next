export default function AboutSection() {
  return (
    <div>
      <h4 className="text-gray">
        <i className="linecons-tag" style={{ marginRight: '7px' }} id="关于本站"></i>
        关于本站
      </h4>
      <div className="row">
        <div className="col-sm-12">
          <div className="panel panel-default" style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>关于本站</h3>
            <p>是一个基于开源项目：WebStack精心打造的网址导航站。</p>
            <p>致力于收集国内外优秀的网站、前端 UI资源网站、灵感创意网站、素材资源网站，定时更新分享优质产品设计书签。</p>

            <h4 style={{ marginTop: 20 }}>特色功能</h4>
            <ul>
              <li>精选设计资源导航</li>
              <li>分类清晰的菜单结构</li>
              <li>快速访问常用工具</li>
              <li>灵感采集和素材资源</li>
            </ul>

            <h4 style={{ marginTop: 20 }}>联系我们</h4>
            <p>
              GitHub: <a href="https://github.com/WebStackPage/WebStackPage.github.io" target="_blank" rel="noopener noreferrer">WebStackPage</a>
            </p>

            <div style={{ marginTop: 20, textAlign: 'center', color: '#999' }}>
              <p>Made with ♥ by WebStack Team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

