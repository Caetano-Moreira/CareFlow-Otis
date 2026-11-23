export const predios = {
  'Torre Atlântica': ['Social 01', 'Social 02', 'Serviço'],
  'Edifício Aurora': ['Social 01', 'Serviço'],
  'Centro Empresarial Sul': ['Torre A', 'Torre B']
};
export const tipos = ['Solicitação de rotina', 'Falha na porta', 'Ruído ou vibração', 'Interrupção de energia', 'Elevador parado', 'Passageiro preso'];
export const impactos = ['Sem impacto imediato', 'Operação parcial', 'Parada total'];
export const niveis = ['Baixa', 'Média', 'Alta', 'Crítica'];
export const status = ['Aberto', 'Em atendimento', 'Resolvido'];
export const equipamento = o => o.predio + ' / ' + o.elevador;
export const dataHora = t => new Date(t).toLocaleString('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short'
});

export function registrar(form, lista, hora = Date.now()) {
  const repetida = lista.some(o => equipamento(o) === equipamento(form) && o.tipo === form.tipo && hora - o.hora <= 30 * 86400000);
  let prioridade = 0,
    motivo = 'Solicitação sem impacto imediato.';
  if (['Passageiro preso', 'Elevador parado'].includes(form.tipo) || form.impacto === 'Parada total') {
    prioridade = 3;
    motivo = form.tipo === 'Passageiro preso' ? 'Há relato de passageiro preso.' : 'Elevador com parada total.';
  } else if (repetida && form.tipo !== tipos[0] || form.tipo === 'Interrupção de energia') {
    prioridade = 2;
    motivo = repetida ? 'Mesmo tipo de falha registrado neste elevador nos últimos 30 dias.' : 'Interrupção no fornecimento de energia.';
  } else if (form.tipo !== tipos[0] || form.impacto === 'Operação parcial') {
    prioridade = 1;
    motivo = 'Falha técnica ou operação parcial informada.';
  }
  return {
    ...form,
    id: 'CF-' + String(1001 + lista.length),
    prioridade,
    motivo,
    hora,
    etapa: 0,
    historico: [{
      etapa: 0,
      hora
    }]
  };
}

export function avancar(o, hora = Date.now()) {
  if (o.etapa >= 2) return o;
  const etapa = o.etapa + 1;
  return {
    ...o,
    etapa,
    historico: [...o.historico, {
      etapa,
      hora
    }]
  };
}

export function ordenar(lista) {
  return [...lista].sort((a, b) => Number(a.etapa === 2) - Number(b.etapa === 2) || b.prioridade - a.prioridade || a.hora - b.hora);
}
export const normal = {
  temperatura: 32,
  vibracao: 2,
  porta: 'Regular',
  parada: 0
};

export function alertas(s) {
  return [s.temperatura >= 60 && 'Temperatura elevada', s.vibracao >= 7 && 'Vibração elevada', s.porta === 'Irregular' && 'Ciclo de porta irregular', s.parada >= 15 && 'Parada prolongada'].filter(Boolean);
}

export function inicial() {
  const lista = [];
  const exemplos = [[0, 0, 1, 2, 'Porta social apresentou fechamento irregular.'], [1, 0, 2, 2, 'Ruído relatado durante o deslocamento.'], [0, 0, 1, 1, 'Portaria voltou a observar falha no fechamento.'], [2, 1, 0, 0, 'Solicitada revisão da identificação da cabine.'], [1, 1, 4, 0, 'Elevador de serviço indisponível.']];
  exemplos.forEach(([p, e, t, etapa, descricao], i) => {
    const predio = Object.keys(predios)[p];
    const hora = Date.now() - (5 - i) * 3600000;
    let o = registrar({
      predio,
      elevador: predios[predio][e],
      tipo: tipos[t],
      impacto: impactos[t === 4 ? 2 : Number(t !== 0)],
      descricao
    }, lista, hora);
    for (let j = 1; j <= etapa; j++) o = avancar(o, hora + j * 900000);
    lista.push(o);
  });
  return {
    lista,
    sensores: {}
  };
}
