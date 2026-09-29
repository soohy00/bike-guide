import type { Actions } from '../App';
import type { AppState } from '../types';
import { findModel } from '../data/bikeModels';
import { PARTS, findPart } from '../data/parts';
import { popularFor } from '../data/popularParts';
import { TROUBLES } from '../data/troubles';
import { allPartHealth, byUrgency, partHealth, statusLabel, totalKm } from '../lib/maintenance';
import { go } from '../lib/router';
import { Card, DiyBadge, StatusPill, TopBar, WearBar, km } from '../components/ui';

export function PartList({ state }: { state: AppState }) {
  const list = byUrgency(allPartHealth(state, PARTS));
  return (
    <div className="stack">
      <TopBar title="부품" />
      <p className="muted">막대가 가득 차면 바꿀 때예요. 부품을 누르면 자세히 봐요.</p>
      {list.map((h) => (
        <Card key={h.part.id} onClick={() => go(`/parts/${h.part.id}`)}>
          <div className="part-row">
            <span className="part-emoji" aria-hidden>
              {h.part.emoji}
            </span>
            <div className="grow">
              <div className="part-title">
                <strong>{h.part.name}</strong>
                <StatusPill status={h.status}>{statusLabel(h)}</StatusPill>
              </div>
              <WearBar wear={h.wear} status={h.status} />
              <p className="muted small">
                {h.leftKm > 0 ? `약 ${km(h.leftKm)} 남았어요` : `${km(-h.leftKm)} 넘었어요`}
                {h.dueByTime && ' · 기간이 지났어요'}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function PartDetail({ id, state, actions }: { id: string; state: AppState; actions: Actions }) {
  const part = findPart(id);
  if (!part) {
    return (
      <div className="stack">
        <TopBar title="부품" backTo="/parts" />
        <p>이 부품을 찾을 수 없어요.</p>
      </div>
    );
  }
  const bike = state.bike!;
  const model = findModel(bike.modelId);
  const record = state.parts[part.id];
  const h = partHealth(part, record, totalKm(state), bike.createdAt);
  const picks = popularFor(model, part.id);
  const related = TROUBLES.filter((t) => t.partId === part.id);

  const onReplaced = () => {
    if (window.confirm(`${part.name}을(를) 오늘 ${part.actionWord === '교체' ? '교체했어요' : `${part.actionWord} 했어요`}? 막대가 다시 0부터 시작해요.`)) {
      actions.markReplaced(part.id);
    }
  };

  return (
    <div className="stack">
      <TopBar title={part.name} backTo="/parts" />

      <Card>
        <div className="part-title">
          <span className="part-emoji big" aria-hidden>
            {part.emoji}
          </span>
          <StatusPill status={h.status}>{statusLabel(h)}</StatusPill>
        </div>
        <WearBar wear={h.wear} status={h.status} />
        <dl className="facts">
          <div>
            <dt>{record ? `마지막 ${part.actionWord} 뒤` : '처음부터'}</dt>
            <dd>{km(h.usedKm)}</dd>
          </div>
          <div>
            <dt>{part.actionWord} 주기</dt>
            <dd>
              {km(part.intervalKm)}
              {part.intervalMonths ? ` 또는 ${part.intervalMonths}개월` : ''}
            </dd>
          </div>
          {record && (
            <div>
              <dt>마지막 {part.actionWord}</dt>
              <dd>{new Date(record.replacedAt).toLocaleDateString('ko-KR')}</dd>
            </div>
          )}
        </dl>
        <button className="btn primary big" onClick={onReplaced}>
          ✔ 오늘 {part.actionWord === '교체' ? '교체했어요' : `${part.actionWord} 했어요`}
        </button>
        {record && (
          <button className="btn link" onClick={() => actions.undoReplaced(part.id)}>
            기록 지우기
          </button>
        )}
      </Card>

      <h2>이게 뭐예요?</h2>
      <Card>
        <p>{part.what}</p>
        <div className="row wrap">
          <DiyBadge level={part.diy} />
          <span className="muted small">💰 {part.cost}</span>
        </div>
      </Card>

      <h2>이럴 때 바꿔요</h2>
      <Card>
        <ul className="bullets">
          {part.signs.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="muted small">주기는 평균이에요. 비 오는 날, 흙길을 많이 타면 더 빨리 닳아요.</p>
      </Card>

      {picks.length > 0 && (
        <>
          <h2>
            {model.brand} {model.name} 주인들이 많이 쓴 것 <span className="sample">예시</span>
          </h2>
          <Card>
            <ol className="picks">
              {picks.map(({ product, share }) => (
                <li key={product.id}>
                  <div className="pick-head">
                    <strong>{product.name}</strong>
                    <span className="pick-share">{share}%</span>
                  </div>
                  <div className="pick-bar">
                    <div style={{ width: `${share}%` }} />
                  </div>
                  <p className="muted small">
                    {product.price} · {product.tip}
                  </p>
                </li>
              ))}
            </ol>
            <p className="muted small">
              지금은 예시 데이터예요. 내 자전거({model.speeds}단, {model.brakeType === 'disc' ? '디스크' : '림'} 브레이크, {model.tireSize})에 맞는 것만 보여 줘요.
            </p>
          </Card>
        </>
      )}

      {related.length > 0 && (
        <>
          <h2>관련 고장</h2>
          {related.map((t) => (
            <Card key={t.id} onClick={() => go(`/help/${t.id}`)}>
              <div className="part-row">
                <span className="part-emoji" aria-hidden>
                  {t.emoji}
                </span>
                <strong className="grow">{t.symptom}</strong>
                <span className="chev" aria-hidden>
                  ›
                </span>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
