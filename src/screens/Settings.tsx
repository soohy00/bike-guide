import { useState } from 'react';
import type { Actions } from '../App';
import type { AppState } from '../types';
import { findModel } from '../data/bikeModels';
import { Card, TopBar, km } from '../components/ui';
import Onboarding from './Onboarding';

export default function Settings({ state, actions, currentKm }: { state: AppState; actions: Actions; currentKm: number }) {
  const [editing, setEditing] = useState(false);
  const bike = state.bike!;
  const model = findModel(bike.modelId);

  if (editing) {
    return (
      <Onboarding
        initial={bike}
        onDone={(b) => {
          actions.setBike(b);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="stack">
      <TopBar title="설정" backTo="/" />
      <Card>
        <h2 className="card-title">{bike.nickname || '내 자전거'}</h2>
        <dl className="facts">
          <div>
            <dt>모델</dt>
            <dd>
              {model.brand} {model.name}
            </dd>
          </div>
          <div>
            <dt>변속</dt>
            <dd>
              {model.groupset} · {model.speeds}단
            </dd>
          </div>
          <div>
            <dt>브레이크</dt>
            <dd>{model.brakeType === 'disc' ? '디스크' : '림 (캘리퍼)'}</dd>
          </div>
          <div>
            <dt>타이어</dt>
            <dd>{model.tireSize}</dd>
          </div>
          <div>
            <dt>등록할 때 거리</dt>
            <dd>{km(bike.startKm)}</dd>
          </div>
          <div>
            <dt>지금 총 거리</dt>
            <dd>{km(currentKm)}</dd>
          </div>
        </dl>
        <button className="btn big" onClick={() => setEditing(true)}>
          자전거 정보 바꾸기
        </button>
      </Card>

      <Card>
        <h2 className="card-title">데이터</h2>
        <p className="muted small">모든 기록은 이 휴대폰(브라우저)에만 저장돼요. 브라우저 데이터를 지우면 기록도 지워져요.</p>
        <button
          className="btn danger"
          onClick={() => {
            if (window.confirm('모든 기록을 지울까요? 되돌릴 수 없어요.')) actions.resetAll();
          }}
        >
          모든 기록 지우기
        </button>
      </Card>
    </div>
  );
}
