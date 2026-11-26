import { Link } from 'react-router-dom';
import { ArrowUpRight } from './Icon';
import { getCaseFileMeta } from '../services/caseRepository';

export function SiteFooter() {
  const meta = getCaseFileMeta();

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="footer-lead">
          <p className="eyebrow">OPEN ARCHIVE / 开放档案</p>
          <h2>
            这个展览
            <br />
            还在继续生长。
          </h2>
          <p className="footer-lead__note">
            欢迎提交课程作业、毕业设计、个人实验或跨专业合作项目。
            <br />
            每一份被整理的数字实践，都会成为下一次讨论的起点。
          </p>
        </div>

        <div className="footer-links">
          <div>
            <p className="footer-label">浏览</p>
            <Link to="/">首页</Link>
            <Link to="/cases">案例索引</Link>
            <Link to="/#about">关于展览</Link>
          </div>
          <div>
            <p className="footer-label">数据</p>
            <span>本地 JSON</span>
            <span>Schema v{meta.schemaVersion}</span>
            <span>更新 {meta.updatedAt}</span>
          </div>
          <div>
            <p className="footer-label">后续</p>
            <span>内容导入器</span>
            <span>数据库 / CMS</span>
            <span>AI 语义检索</span>
          </div>
        </div>
      </div>

      <div className="site-footer__wordmark" aria-hidden="true">
        MAKING
        <span>FIELD</span>
      </div>

      <div className="site-footer__bottom">
        <p>© 2026 造物现场 · 学生数字实践常设展</p>
        <p>原型版本 v0.1 / 为持续收录而设计</p>
        <Link to="/cases" className="footer-index-link">
          进入案例索引 <ArrowUpRight size={14} />
        </Link>
      </div>
    </footer>
  );
}
