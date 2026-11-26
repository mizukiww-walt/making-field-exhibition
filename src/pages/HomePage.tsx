import { Link } from 'react-router-dom';
import { useCases } from '../hooks/useCases';
import { getCaseFileMeta } from '../services/caseRepository';
import { getProfessionFacets } from '../services/caseFilters';
import { PROFESSIONS } from '../data/taxonomy';
import { SectionHeading } from '../components/SectionHeading';
import { SpotlightCase } from '../components/SpotlightCase';
import { CaseCard } from '../components/CaseCard';
import { ArrowRight, ArrowUpRight } from '../components/Icon';
import { useDocumentTitle } from '../hooks/usePageEffects';

export function HomePage() {
  useDocumentTitle('');
  const { cases, status } = useCases();
  const meta = getCaseFileMeta();
  const featured = cases.filter((item) => item.featured);
  const rest = cases.filter((item) => !item.featured);
  const professionFacets = getProfessionFacets(cases);
  const toolCount = new Set(cases.flatMap((item) => item.tools)).size;
  const mainFeature = featured[0] ?? cases[0];
  const sideFeature = featured[1];

  return (
    <main className="home">
      <section className="hero">
        <div className="hero__top mono">
          <span className="hero__top-label">
            <span className="status-dot" aria-hidden="true" />
            常设数字展览 / VOL. 01
          </span>
          <span>2026 — ONGOING</span>
          <span className="hero__top-right">INDEX 001—{String(cases.length || 4).padStart(3, '0')}</span>
        </div>

        <div className="hero__main">
          <div className="hero__copy">
            <p className="eyebrow">A LIVING ARCHIVE OF DIGITAL PRACTICE</p>
            <h1>
              让数字实践
              <br />
              留在<span>现场</span>
              <i>.</i>
            </h1>
            <div className="hero__intro">
              <p>
                造物现场是一个持续生长的学生数字实践档案。这里收录不同专业的学生如何用数字工具观察、
                推演与建造，并把作品背后的方法、误差和现场一起留下。
              </p>
              <div className="hero__actions">
                <Link className="button button--dark" to="/cases">
                  浏览案例索引 <ArrowRight size={17} />
                </Link>
                <a className="text-link" href="#about">
                  关于展览 <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </div>

          <aside className="hero__aside" aria-label="展览概况">
            <div className="hero__stamp" aria-hidden="true">
              <svg viewBox="0 0 160 160">
                <defs>
                  <path
                    id="stamp-path"
                    d="M80,80 m-59,0 a59,59 0 1,1 118,0 a59,59 0 1,1 -118,0"
                  />
                </defs>
                <text>
                  <textPath href="#stamp-path">
                    OPEN CALL · 持续征集中 · OPEN CALL · 持续征集中 ·
                  </textPath>
                </text>
              </svg>
              <span>MF</span>
            </div>

            <div className="hero__stats">
              <div>
                <strong>{status === 'ready' ? String(cases.length).padStart(2, '0') : '—'}</strong>
                <span>收录案例</span>
              </div>
              <div>
                <strong>{status === 'ready' ? '03' : '—'}</strong>
                <span>专业方向</span>
              </div>
              <div>
                <strong>{status === 'ready' ? String(toolCount).padStart(2, '0') : '—'}</strong>
                <span>工具 / 方法</span>
              </div>
            </div>

            <p className="hero__aside-note">
              数据更新于 {meta.updatedAt}
              <br />
              以本地 JSON 驱动，结构面向长期收录。
            </p>
          </aside>
        </div>

        <div className="hero__ticker" aria-hidden="true">
          <div className="hero__ticker-track">
            {Array.from({ length: 2 }).map((_, group) => (
              <span key={group}>
                ARCHITECTURE <i>×</i> COMPUTATION <i>×</i> FABRICATION <i>×</i> INTERACTION{' '}
                <i>×</i> DATA <i>×</i> MATERIAL <i>×</i> SPACE <i>×</i> ARCHIVE <i>×</i>
              </span>
            ))}
          </div>
        </div>
      </section>

      {mainFeature && (
        <section className="curated section-shell">
          <SectionHeading
            index="01"
            eyebrow="CURATOR'S PICK / 本期推荐"
            title={
              <>
                从材料出发，
                <br />
                把过程一起展出。
              </>
            }
            description="不只是最终成果，也保留模拟、样件、节点与现场校准的痕迹。"
            link={{ label: '全部案例', to: '/cases' }}
          />

          <SpotlightCase caseStudy={mainFeature} index={cases.indexOf(mainFeature)} />

          <div className="curated-secondary">
            {sideFeature && (
              <CaseCard
                caseStudy={sideFeature}
                index={cases.indexOf(sideFeature)}
                priority
              />
            )}
            <aside className="curated-note">
              <p className="eyebrow">EDITOR'S NOTE / 策展笔记</p>
              <p className="curated-note__lead">
                这一期，我们把目光放在
                <em>材料如何反过来改写设计。</em>
              </p>
              <p>
                竹子会回弹，黏土会塌陷，声音会消散。案例中的数字工具不是用来消除这些“不确定”，
                而是帮助设计者更准确地与它们合作。
              </p>
              <Link to="/cases?contentType=digital-fabrication" className="text-link text-link--light">
                浏览数字建造案例 <ArrowUpRight size={15} />
              </Link>
            </aside>
          </div>
        </section>
      )}

      <section className="fields section-shell">
        <SectionHeading
          index="02"
          eyebrow="FIELDS / 按专业进入"
          title="不同专业，同一种现场感。"
          description="从空间、媒介到信息，数字实践正在不同学科中生成新的工作方法。"
        />

        <div className="field-grid">
          {PROFESSIONS.map((profession, index) => {
            const count = professionFacets.find((item) => item.id === profession.id)?.count ?? 0;
            const content = (
              <>
                <div className="field-card__top mono">
                  <span>0{index + 1}</span>
                  <span>{count ? `${String(count).padStart(2, '0')} CASES` : 'COMING SOON'}</span>
                </div>
                <div className="field-card__body">
                  <h3>{profession.label}</h3>
                  <p>{profession.description}</p>
                </div>
                <div className="field-card__bottom">
                  <span>{count ? '进入方向索引' : '正在征集'}</span>
                  {count > 0 ? <ArrowUpRight size={18} /> : <span className="field-card__plus">+</span>}
                </div>
              </>
            );

            return count > 0 ? (
              <Link
                className="field-card"
                key={profession.id}
                to={`/cases?profession=${profession.id}`}
              >
                {content}
              </Link>
            ) : (
              <div className="field-card is-empty" key={profession.id}>
                {content}
              </div>
            );
          })}
        </div>
      </section>

      {rest.length > 0 && (
        <section className="latest section-shell">
          <SectionHeading
            index="03"
            eyebrow="MORE FROM THE ARCHIVE / 更多收录"
            title="继续翻阅。"
            link={{ label: '查看全部', to: '/cases' }}
          />
          <div className="case-grid">
            {rest.map((item) => (
              <CaseCard
                key={item.id}
                caseStudy={item}
                index={cases.indexOf(item)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="about section-shell" id="about">
        <div className="about__lead">
          <p className="eyebrow">ABOUT / 关于这个展览</p>
          <h2>
            一个不封口的
            <br />
            <span>数字实践档案</span>。
          </h2>
          <p>
            造物现场面向不同专业的学生开放。它不按学期结束而结束，而是以索引、标签和内容模型持续累积，
            让后来的读者可以回到方法本身，而不只是观看结果。
          </p>
        </div>

        <div className="about__method">
          <div className="method-step">
            <span className="mono">A / COLLECT</span>
            <h3>收录</h3>
            <p>保存作品、过程图、作者信息与工具链，让案例具备完整语境。</p>
          </div>
          <div className="method-step">
            <span className="mono">B / STRUCTURE</span>
            <h3>结构化</h3>
            <p>用专业、内容类型、工具、标签与正文区块组织内容，便于筛选和迁移。</p>
          </div>
          <div className="method-step">
            <span className="mono">C / RETRIEVE</span>
            <h3>再检索</h3>
            <p>检索层与数据层分离，未来可接入数据库、内容导入器和 AI 语义搜索。</p>
          </div>
        </div>

        <div className="about__quote">
          <p>
            “一个展览的价值，不只在于它展出了什么，
            也在于它允许后来者继续添加什么。”
          </p>
          <span className="mono">CURATORIAL NOTE / 2026</span>
        </div>
      </section>

      <section className="home-cta section-shell">
        <div>
          <p className="eyebrow">KEEP ADDING / 持续收录</p>
          <h2>
            下一件作品，
            <br />
            也许正在你的硬盘里。
          </h2>
        </div>
        <div className="home-cta__action">
          <p>
            当前版本使用本地 JSON 驱动，已为数据库、内容导入器与 AI 搜索预留接口。
            你可以直接替换数据、扩展字段，继续把这个展览做下去。
          </p>
          <Link className="button button--dark" to="/cases">
            进入案例索引 <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
