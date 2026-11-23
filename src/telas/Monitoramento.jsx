import React, { useState } from 'react';
import { Local } from './Atendimento.jsx';
import { predios, normal, alertas, dataHora, equipamento } from '../dados.js';

function Leitura({
  sensor,
  salvar
}) {
  const [leitura, setLeitura] = useState({
    ...normal,
    ...sensor
  });
  const definir = (campo, valor) => setLeitura({
    ...leitura,
    [campo]: valor
  });
  const avisos = alertas(sensor || normal);
  return <>
      <form className="card form" onSubmit={e => {
      e.preventDefault();
      salvar({
        ...leitura,
        hora: Date.now()
      });
    }}>
        <h2>Simular leitura</h2>
        <p>Limites fictícios desta demonstração: 60 °C, 7 mm/s, porta irregular ou 15 minutos de parada.</p>
        <div className="dupla">
          {[['temperatura', 'Temperatura (°C)', 0, 120], ['vibracao', 'Vibração (mm/s)', 0, 30], ['parada', 'Tempo parado (min)', 0, 240]].map(([campo, label, min, max]) => <label key={campo}>
            {label}
            <input type="number" required min={min} max={max} step="0.1" value={leitura[campo]} onChange={e => definir(campo, e.target.value === '' ? '' : Number(e.target.value))} />
          </label>)}
          <label>Ciclo da porta<select value={leitura.porta} onChange={e => definir('porta', e.target.value)}>
              <option>Regular</option>
              <option>Irregular</option>
            </select></label>
        </div>
        <button>Aplicar simulação</button>
      </form>
      <section className={'card ' + (avisos.length ? 'alerta' : '')} aria-live="polite">
        <small>{sensor ? 'Última simulação · ' + dataHora(sensor.hora) : 'Condição inicial simulada'}</small>
        <h2>{avisos.length ? 'Alertas preventivos' : 'Operação regular'}</h2>
        {avisos.length ? <ul>{avisos.map(a => <li key={a}>{a}</li>)}</ul> : <p>Nenhum limite atingido para este elevador.</p>}
      </section>
    </>;
}

export default function Monitoramento({
  sensores,
  salvar
}) {
  const [predio, setPredio] = useState(Object.keys(predios)[0]),
    [elevador, setElevador] = useState(predios[predio][0]);
  const chave = equipamento({
    predio,
    elevador
  });
  return <>
      <section className="card">
        <Local {...{
        predio,
        elevador
      }} mudar={(p, e) => {
        setPredio(p);
        setElevador(e);
      }} />
      </section>
      <Leitura key={chave} sensor={sensores[chave]} salvar={s => salvar(chave, s)} />
    </>;
}
