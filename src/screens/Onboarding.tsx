import { useState } from 'react';
import type { Bike } from '../types';
import { BIKE_MODELS, findModel } from '../data/bikeModels';
import { Tip } from '../components/ui';

export default function Onboarding({ onDone, initial }: { onDone(bike: Bike): void; initial?: Bike }) {
  const [step, setStep] = useState(initial ? 1 : 0);
  const [modelId, setModelId] = useState(initial?.modelId ?? '');
  const [nickname, setNickname] = useState(initial?.nickname ?? '');
  const [startKm, setStartKm] = useState(initial ? String(initial.startKm) : '');

  if (step === 0) {
    return (
      <div className="onboarding" key="step-0">
        <img className="hero-logo" src={`${import.meta.env.BASE_URL}logo.webp`} alt="" width={96} height={96} />
        <h1 className="hero">자전거 첫걸음</h1>
        <p className="lead">
          자전거를 처음 타는 사람을 위한 앱이에요.
          <br />
          언제 무엇을 바꿔야 하는지 알려 줘요.
          <br />
          고장 나면 무엇이 필요한지 알려 줘요.
        </p>
        <button className="btn primary big" onClick={() => setStep(1)}>
          내 자전거 등록하기
        </button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="onboarding" key="step-1">
        <h1>내 자전거는 무엇이에요?</h1>
        <p className="muted">자전거 몸통(프레임)에 글자가 써 있어요. 몰라도 괜찮아요.</p>
        <div className="model-list">
          {BIKE_MODELS.map((m) => (
            <button
              key={m.id}
              className={`model-item ${modelId === m.id ? 'selected' : ''}`}
              onClick={() => setModelId(m.id)}
              aria-pressed={modelId === m.id}
            >
              <strong>{m.brand}</strong>
              <span>{m.name}</span>
            </button>
          ))}
        </div>
        <button className="btn primary big" disabled={!modelId} onClick={() => setStep(2)}>
          다음
        </button>
      </div>
    );
  }

  const model = findModel(modelId);
  const kmNumber = Math.max(0, Number(startKm) || 0);

  return (
    <div className="onboarding" key="step-2">
      <h1>조금만 더 알려 주세요</h1>
      <label className="field">
        <span>자전거 이름 (선택)</span>
        <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={`예: 나의 ${model.name}`} maxLength={30} />
      </label>
      <label className="field">
        <span>지금까지 탄 거리 (km)</span>
        <input inputMode="decimal" value={startKm} onChange={(e) => setStartKm(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" />
      </label>
      <Tip>새 자전거면 0이에요. 모르면 대충 써요. 1주일에 2번, 20km씩 탔으면 한 달에 약 160km예요.</Tip>
      <div className="spec">
        <div>
          <span>변속</span>
          <strong>
            {model.groupset} · {model.speeds}단
          </strong>
        </div>
        <div>
          <span>브레이크</span>
          <strong>{model.brakeType === 'disc' ? '디스크' : '림 (캘리퍼)'}</strong>
        </div>
        <div>
          <span>타이어</span>
          <strong>{model.tireSize}</strong>
        </div>
      </div>
      <p className="muted small">이 정보로 맞는 부품을 알려 줘요. 연식에 따라 다를 수 있어요.</p>
      <div className="row">
        <button className="btn" onClick={() => setStep(1)}>
          이전
        </button>
        <button
          className="btn primary grow"
          onClick={() =>
            onDone({
              modelId,
              nickname: nickname.trim(),
              startKm: kmNumber,
              createdAt: initial?.createdAt ?? new Date().toISOString(),
            })
          }
        >
          {initial ? '저장하기' : '시작하기'}
        </button>
      </div>
    </div>
  );
}
