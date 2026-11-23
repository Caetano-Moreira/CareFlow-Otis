import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { inicial, registrar, avancar, equipamento } from './dados.js';
import Painel from './telas/Painel.jsx';
import Monitoramento from './telas/Monitoramento.jsx';
import { Registro, Fila, Detalhe } from './telas/Atendimento.jsx';
import './styles.css';
const chave = 'careflow-otis-v1';
const telas = {
  painel: ['Painel de gestão', 'Visão geral das ocorrências e dos atendimentos.'],
  registro: ['Nova ocorrência', 'Registre uma falha ou solicitação para a equipe técnica.'],
  fila: ['Fila de atendimento', 'Consulte os chamados e acompanhe o atendimento por prioridade.'],
  monitor: ['Monitoramento', 'Teste sinais operacionais e consulte alertas simulados por elevador.']
};
function ler() {
  const salvo = localStorage.getItem(chave);
  return salvo ? JSON.parse(salvo) : inicial();
}

function App() {
  const [dados, setDados] = useState(() => {
    try {
      return ler();
    } catch {
      return inicial();
    }
  });
  const [erro, setErro] = useState('');
  const [rota, setRota] = useState(location.hash.slice(1) || 'painel');
  useEffect(() => {
    function navegar() {
      setRota(location.hash.slice(1) || 'painel');
      window.scrollTo(0, 0);
    }
    function sincronizar() {
      try {
        setDados(ler());
      } catch {
        setErro('Não foi possível ler os dados locais.');
      }
    }
    window.addEventListener('hashchange', navegar);
    window.addEventListener('storage', sincronizar);
    return () => {
      window.removeEventListener('hashchange', navegar);
      window.removeEventListener('storage', sincronizar);
    };
  }, []);
  function gravar(novos) {
    try {
      localStorage.setItem(chave, JSON.stringify(novos));
      setDados(novos);
      setErro('');
      return true;
    } catch {
      setErro('O navegador não conseguiu salvar. Libere espaço ou habilite o armazenamento local e tente novamente.');
      return false;
    }
  }
  const abrir = id => {
    location.hash = 'fila/' + id;
  };
  const [secao, id] = rota.split('/');
  const pagina = telas[secao] ? secao : 'painel';
  const item = pagina === 'fila' && dados.lista.find(o => o.id === id);
  return <div className="app">
      <aside>
        <a className="brand" href="#painel"><i aria-hidden="true">↕</i>Careflow <b>Otis</b></a>
        <nav aria-label="Navegação principal">{Object.entries(telas).map(([key, [nome]]) => <a key={key} href={'#' + key} aria-current={key === pagina ? 'page' : undefined}>
            <span className={'navIcon icon-' + key} aria-hidden="true" />
            {nome}
          </a>)}</nav>
        <small className="ambiente">Ambiente de demonstração</small>
      </aside>
      <main>
        <header>
          <span className="kicker">Central de operações</span>
          <h1>{item ? 'Detalhe da ocorrência' : telas[pagina][0]}</h1>
          <p>{item ? item.id : telas[pagina][1]}</p>
          {pagina === 'painel' && <a className="cta" href="#registro">+ Nova ocorrência</a>}
        </header>
        {erro && <p role="alert" className="card alerta">{erro}</p>}
        {pagina === 'painel' && <Painel lista={dados.lista} abrir={abrir} />}
        {pagina === 'registro' && <Registro abrir={abrir} salvar={form => {
        const o = registrar(form, dados.lista);
        return gravar({
          ...dados,
          lista: [...dados.lista, o]
        }) && o;
      }} />}
        {pagina === 'fila' && (item ? <Detalhe o={item} lista={dados.lista} sensor={dados.sensores[equipamento(item)]} abrir={abrir} avancar={id => gravar({
        ...dados,
        lista: dados.lista.map(o => o.id === id ? avancar(o) : o)
      })} /> : <Fila lista={dados.lista} abrir={abrir} />)}
        {pagina === 'monitor' && <Monitoramento sensores={dados.sensores} salvar={(key, s) => gravar({
        ...dados,
        sensores: {
          ...dados.sensores,
          [key]: s
        }
      })} />}
      </main>
    </div>;
}
createRoot(document.getElementById('root')).render(<App />);
