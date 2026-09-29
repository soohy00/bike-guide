import type { Bike } from '../types';
import { findModel } from '../data/bikeModels';
import { findPart } from '../data/parts';
import { TROUBLES, fillNeeds, findTrouble } from '../data/troubles';
import { go } from '../lib/router';
import { Store, Toolbox } from 'lucide-react';
import { Card, Chevron, DiyBadge, IconTile, TopBar, Warning } from '../components/ui';

export function TroubleList() {
  return (
    <div className="stack stagger">
      <TopBar title="무엇이 문제예요?" />
      <p className="muted">보이는 문제를 골라요. 무엇이 필요한지 알려 줘요.</p>
      {TROUBLES.map((t) => (
        <Card key={t.id} onClick={() => go(`/help/${t.id}`)}>
          <div className="part-row">
            <IconTile icon={t.icon} />
            <div className="grow">
              <strong>{t.symptom}</strong>
              <div>
                <DiyBadge level={t.diy} />
              </div>
            </div>
            <Chevron />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function TroubleDetail({ id, bike }: { id: string; bike: Bike }) {
  const t = findTrouble(id);
  if (!t) {
    return (
      <div className="stack">
        <TopBar title="고장" backTo="/help" />
        <p>이 고장을 찾을 수 없어요.</p>
      </div>
    );
  }
  const model = findModel(bike.modelId);
  const part = t.partId ? findPart(t.partId) : undefined;

  return (
    <div className="stack">
      <TopBar title={t.symptom} backTo="/help" />

      {t.warning && <Warning>{t.warning}</Warning>}

      <Card>
        <h2 className="card-title">왜 그래요?</h2>
        <p>{t.why}</p>
        <DiyBadge level={t.diy} />
      </Card>

      <Card className="needs">
        <h2 className="card-title with-icon">
          <Toolbox size={18} aria-hidden />
          필요한 것
        </h2>
        <ul className="checklist">
          {t.needs.map((n) => (
            <li key={n}>
              <label>
                <input type="checkbox" /> {fillNeeds(n, model.tireSize, model.speeds)}
              </label>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="card-title">순서</h2>
        <ol className="steps">
          {t.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </Card>

      <Card className="shop">
        <h2 className="card-title with-icon">
          <Store size={18} aria-hidden />
          이럴 때는 샵으로
        </h2>
        <p>{t.goToShop}</p>
      </Card>

      {part && (
        <button className="btn big" onClick={() => go(`/parts/${part.id}`)}>
          <part.icon size={18} aria-hidden />
          {part.name} 정보와 추천 부품 보기
        </button>
      )}
    </div>
  );
}
