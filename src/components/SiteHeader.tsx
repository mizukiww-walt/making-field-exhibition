import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CloseIcon, MenuIcon } from './Icon';

const NAV_ITEMS = [
  { label: '首页', to: '/' },
  { label: '案例索引', to: '/cases' },
  { label: '关于展览', to: '/#about' },
];

export function SiteHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" to="/" aria-label="造物现场首页">
          <span className="brand__mark" aria-hidden="true">
            M
          </span>
          <span className="brand__text">
            <strong>造物现场</strong>
            <small>MAKING FIELD</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : item.to === '/cases'
                  ? location.pathname.startsWith('/cases')
                  : false;
            return (
              <Link
                className={`nav-link${isActive ? ' is-active' : ''}`}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-status" aria-label="展览状态">
          <span className="status-dot" aria-hidden="true" />
          <span>常设展 · 持续收录</span>
        </div>

        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          <span className="sr-only">{menuOpen ? '关闭菜单' : '打开菜单'}</span>
        </button>
      </div>

      <div id="mobile-menu" className={`mobile-menu${menuOpen ? ' is-open' : ''}`}>
        <nav aria-label="移动端主导航">
          {NAV_ITEMS.map((item, index) => (
            <Link key={item.to} to={item.to} className="mobile-menu__link">
              <span className="mono">0{index + 1}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mobile-menu__meta">
          <p>数字实践档案 / 2026</p>
          <p>持续收录建筑、数字媒体、视觉传达等方向的学生作品。</p>
        </div>
      </div>
    </header>
  );
}
