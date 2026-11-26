import { Link } from 'react-router-dom';
import { ArrowRight } from '../components/Icon';
import { useDocumentTitle } from '../hooks/usePageEffects';

export function NotFoundPage() {
  useDocumentTitle('未找到页面');

  return (
    <main className="not-found section-shell">
      <div className="not-found__code mono">404 / LOST IN THE ARCHIVE</div>
      <h1>
        这一页
        <br />
        还没有被收录。
      </h1>
      <p>
        链接可能已经移动，或者这个案例还在整理中。
        <br />
        你可以回到索引，继续浏览已经展出的内容。
      </p>
      <div className="not-found__actions">
        <Link className="button button--dark" to="/cases">
          返回案例索引 <ArrowRight size={17} />
        </Link>
        <Link className="text-link" to="/">
          回到首页
        </Link>
      </div>
      <div className="not-found__mark" aria-hidden="true">
        404
      </div>
    </main>
  );
}
