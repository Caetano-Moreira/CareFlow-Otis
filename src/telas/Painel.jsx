import React from 'react';
import { equipamento, ordenar, tipos } from '../dados.js';
import { Lista } from './Atendimento.jsx';

function Ranking({
  titulo,
  nomes
}) {
  const totais = new Map();
  nomes.forEach(n => totais.set(n, (totais.get(n) || 0) + 1));
  const linhas = [...totais].sort((a, b) => b[1] - a[1]);
  return <section className="card">
      <h2>{titulo}</h2>
      {linhas.map(([nome, total]) => <div className="rank" key={nome}>
        <div>
          {nome}
          <b>{total}</b>
        </div>
        <progress value={total} max={linhas[0][1]} aria-label={nome} />
      </div>)}
      {!linhas.length && <p>Sem dados registrados.</p>}
    </section>;
}

export default function Painel({
  lista,
  abrir
}) {
  const ativos = ordenar(lista.filter(o => o.etapa < 2));
  const cards = [['Em aberto', lista.filter(o => o.etapa === 0).length], ['Em atendimento', lista.filter(o => o.etapa === 1).length], ['Críticos ativos', ativos.filter(o => o.prioridade === 3).length], ['Resolvidos', lista.filter(o => o.etapa === 2).length]];
  const proximo = ativos[0];
  return <>
      <section className="dispatch">
        <div className="dispatchContent">
          <span className="signal">Próximo na fila</span>
          <h2>{proximo?.tipo || 'Fila em dia'}</h2>
          {proximo && <>
            <p>{equipamento(proximo)}</p>
            <button onClick={() => abrir(proximo.id)}>Abrir chamado {proximo.id}</button>
          </>}
        </div>
        <div aria-hidden="true" className="shaft">
          <div className="display">▲ ▾</div>
          <div className="door">
            <i />
            <i />
          </div>
        </div>
      </section>
      <div className="stats">{cards.map(([nome, n], i) => <section key={nome} className={'stat stat' + i}>
          <span>{nome}</span>
          <strong>{String(n).padStart(2, '0')}</strong>
        </section>)}</div>
      <section className="card">
        <div className="sectionhead">
          <h2>Prioridades de atendimento</h2>
          <a href="#fila">Ver fila completa</a>
        </div>
        <Lista lista={ativos.slice(0, 4)} abrir={abrir} />
      </section>
      <div className="dupla">
        <Ranking titulo="Falhas mais frequentes" nomes={lista.filter(o => o.tipo !== tipos[0]).map(o => o.tipo)} />
        <Ranking titulo="Ocorrências por elevador" nomes={lista.map(equipamento)} />
      </div>
    </>;
}
