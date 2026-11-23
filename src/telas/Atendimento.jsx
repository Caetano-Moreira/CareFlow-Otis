import React, { useState } from 'react';
import { predios, tipos, impactos, niveis, status, equipamento, dataHora, ordenar, normal, alertas } from '../dados.js';

export function Prioridade({
  valor
}) {
  return <span className={'badge n' + valor}>{niveis[valor]}</span>;
}

export function Local({
  predio,
  elevador,
  mudar
}) {
  return <div className="dupla">
      <label>Prédio<select value={predio} onChange={e => mudar(e.target.value, predios[e.target.value][0])}>{Object.keys(predios).map(p => <option key={p}>{p}</option>)}</select></label>
      <label>Elevador<select value={elevador} onChange={e => mudar(predio, e.target.value)}>{predios[predio].map(e => <option key={e}>{e}</option>)}</select></label>
    </div>;
}

export function Registro({
  salvar,
  abrir
}) {
  const [predio, setPredio] = useState(Object.keys(predios)[0]),
    [elevador, setElevador] = useState(predios[predio][0]);
  const [criado, setChamadoCriado] = useState(null);
  function enviar(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const campos = Object.fromEntries(new FormData(form));
    if (!campos.descricao.trim()) {
      form.elements.descricao.setCustomValidity('Descreva o ocorrido.');
      form.reportValidity();
      return;
    }
    const item = salvar({
      ...campos,
      descricao: campos.descricao.trim(),
      predio,
      elevador
    });
    if (item) setChamadoCriado(item);
  }
  if (criado) return <section className="card" role="status">
      <span className="kicker">Registro confirmado</span>
      <h2>Chamado {criado.id} aberto</h2>
      <p>{equipamento(criado)} · {criado.tipo}</p>
      <Prioridade valor={criado.prioridade} />
      <p>{criado.motivo}</p>
      <button onClick={() => abrir(criado.id)}>Acompanhar chamado</button>
      <button className="light" onClick={() => setChamadoCriado(null)}>Registrar outro</button>
    </section>;
  return <form className="card form" onSubmit={enviar}>
      <h2>Dados da ocorrência</h2>
      <Local {...{
      predio,
      elevador
    }} mudar={(p, e) => {
      setPredio(p);
      setElevador(e);
    }} />
      <div className="dupla">
        <label>Tipo de ocorrência<select name="tipo" required defaultValue="">
            <option value="" disabled>Selecione o tipo</option>
            {tipos.map(t => <option key={t}>{t}</option>)}
          </select></label>
        <label>Impacto observado<select name="impacto" required defaultValue="">
            <option value="" disabled>Selecione o impacto</option>
            {impactos.map(t => <option key={t}>{t}</option>)}
          </select></label>
      </div>
      <label>Descrição<textarea name="descricao" required maxLength={1200} rows={4} onInput={e => e.target.setCustomValidity('')} placeholder="Descreva o que a portaria ou o passageiro observou." /></label>
      <button>Registrar ocorrência</button>
    </form>;
}

export function Lista({
  lista,
  abrir
}) {
  return lista.length ? <div className="rows">{lista.map(o => <button key={o.id} className="row" onClick={() => abrir(o.id)}>
        <span>
          <small>{o.id} · {status[o.etapa]}</small>
          <strong>{o.tipo}</strong>
          <span>{equipamento(o)}</span>
        </span>
        <Prioridade valor={o.prioridade} />
      </button>)}</div> : <p>Nenhuma ocorrência encontrada.</p>;
}

export function Fila({
  lista,
  abrir
}) {
  const [busca, setBusca] = useState(''),
    [filtro, setFiltro] = useState('Ativos');
  const filtrados = ordenar(lista).filter(o => (filtro === 'Todos' || (filtro === 'Ativos' ? o.etapa < 2 : status[o.etapa] === filtro)) && [o.id, equipamento(o), o.tipo].join(' ').toLocaleLowerCase().includes(busca.trim().toLocaleLowerCase()));
  return <section className="card">
      <div className="dupla">
        <label>Buscar chamado<input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Protocolo, prédio ou falha" /></label>
        <label>Situação<select value={filtro} onChange={e => setFiltro(e.target.value)}>{['Ativos', 'Todos', ...status].map(t => <option key={t}>{t}</option>)}</select></label>
      </div>
      <Lista lista={filtrados} abrir={abrir} />
    </section>;
}

export function Detalhe({
  o,
  lista,
  sensor = normal,
  avancar,
  abrir
}) {
  const anteriores = lista.filter(item => item.id !== o.id && equipamento(item) === equipamento(o));
  return <>
      <a href="#fila">Voltar à fila</a>
      <section className="card">
        <small>{o.id} · {dataHora(o.hora)}</small>
        <h2>{o.tipo}</h2>
        <p>{equipamento(o)} · {o.impacto}</p>
        <Prioridade valor={o.prioridade} />
        <b>{status[o.etapa]}</b>
        <p>{o.motivo}</p>
        <p className="nota">{o.descricao}</p>
        <h3>Histórico do atendimento</h3>
        <ol>{o.historico.map(h => <li key={h.etapa}>{status[h.etapa]} · {dataHora(h.hora)}</li>)}</ol>
        {o.etapa < 2 && <button onClick={() => avancar(o.id)}>{o.etapa === 0 ? 'Iniciar atendimento' : 'Marcar como resolvido'}</button>}
      </section>
      <section className="card">
        <h2>Leitura simulada do equipamento</h2>
        <p>{sensor.temperatura} °C · {sensor.vibracao} mm/s · Porta {sensor.porta.toLowerCase()} · {sensor.parada} min parado</p>
        <p>{alertas(sensor).join(' · ') || 'Dentro dos limites da simulação.'}</p>
      </section>
      <section className="card">
        <h2>Outros chamados deste elevador</h2>
        <Lista lista={ordenar(anteriores)} abrir={abrir} />
      </section>
    </>;
}
