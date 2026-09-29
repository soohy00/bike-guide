import { GUIDES, findGuide } from '../data/guides';
import { go } from '../lib/router';
import { ChevronRight } from 'lucide-react';
import { Card, Chevron, IconTile, TopBar, Tip } from '../components/ui';

export function GuideList() {
  return (
    <div className="stack stagger">
      <TopBar title="배우기" />
      <p className="muted">처음 타는 사람을 위한 짧은 수업이에요. 위에서부터 읽어요.</p>
      {GUIDES.map((g, i) => (
        <Card key={g.id} onClick={() => go(`/learn/${g.id}`)}>
          <div className="part-row">
            <IconTile icon={g.icon} />
            <div className="grow">
              <strong>
                {i + 1}. {g.title}
              </strong>
              <p className="muted small">
                {g.summary} · {g.minutes}분
              </p>
            </div>
            <Chevron />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function GuideDetail({ id }: { id: string }) {
  const g = findGuide(id);
  if (!g) {
    return (
      <div className="stack">
        <TopBar title="배우기" backTo="/learn" />
        <p>이 수업을 찾을 수 없어요.</p>
      </div>
    );
  }
  const index = GUIDES.indexOf(g);
  const next = GUIDES[index + 1];

  return (
    <div className="stack">
      <TopBar title={g.title} backTo="/learn" />
      <p className="muted">{g.summary}</p>
      {g.sections.map((s, i) => (
        <Card key={i}>
          {s.title && <h2 className="card-title">{s.title}</h2>}
          {s.text && <p>{s.text}</p>}
          {s.steps && (
            <ol className="steps">
              {s.steps.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          )}
          {s.checklist && (
            <ul className="checklist">
              {s.checklist.map((x) => (
                <li key={x}>
                  <label>
                    <input type="checkbox" /> {x}
                  </label>
                </li>
              ))}
            </ul>
          )}
          {s.tip && <Tip>{s.tip}</Tip>}
        </Card>
      ))}
      {next && (
        <button className="btn big" onClick={() => go(`/learn/${next.id}`)}>
          다음 수업: {next.title}
          <ChevronRight size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}
