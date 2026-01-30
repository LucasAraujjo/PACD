import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/MinhasAtividades.css';

const MinhasAtividades = () => {
  const [atividades, setAtividades] = useState([]);
  const [atividadesFiltradas, setAtividadesFiltradas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados de filtro
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');

  // Estado de ordenação
  const [ordenacao, setOrdenacao] = useState({ campo: 'data_execucao', direcao: 'desc' });

  // Carregar atividades ao montar o componente
  useEffect(() => {
    carregarAtividades();
  }, []);

  // Aplicar filtros e ordenação quando atividades ou filtros mudarem
  useEffect(() => {
    aplicarFiltrosEOrdenacao();
  }, [atividades, filtroTipo, filtroArea, filtroBusca, ordenacao]);

  const carregarAtividades = async () => {
    console.log('🔄 Carregando atividades...');
    setIsLoading(true);
    setErro('');

    try {
      const response = await fetch('/api/listar_atividades');
      console.log('📥 Status da resposta:', response.status);

      const data = await response.json();
      console.log('📊 Dados recebidos:', data);

      if (response.ok && data.success) {
        setAtividades(data.data);
        console.log(`✅ ${data.total} atividades carregadas`);
      } else {
        throw new Error(data.error || 'Erro ao carregar atividades');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar atividades:', error);
      setErro(`Erro ao carregar atividades: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltrosEOrdenacao = () => {
    let resultado = [...atividades];

    // Filtro por tipo
    if (filtroTipo) {
      resultado = resultado.filter(a => a.tipo === filtroTipo);
    }

    // Filtro por área
    if (filtroArea) {
      resultado = resultado.filter(a => a.area === filtroArea);
    }

    // Filtro por busca (título, matéria, assunto)
    if (filtroBusca) {
      const busca = filtroBusca.toLowerCase();
      resultado = resultado.filter(a =>
        a.titulo?.toLowerCase().includes(busca) ||
        a.materia?.toLowerCase().includes(busca) ||
        a.assunto?.toLowerCase().includes(busca)
      );
    }

    // Ordenação
    resultado.sort((a, b) => {
      const { campo, direcao } = ordenacao;
      let valorA = a[campo] || '';
      let valorB = b[campo] || '';

      // Tratamento especial para números
      if (campo === 'questoes' || campo === 'acertos') {
        valorA = parseInt(valorA) || 0;
        valorB = parseInt(valorB) || 0;
      }

      // Tratamento especial para datas
      if (campo === 'data_execucao' || campo === 'data_inclusao') {
        valorA = new Date(valorA.split('/').reverse().join('-')).getTime() || 0;
        valorB = new Date(valorB.split('/').reverse().join('-')).getTime() || 0;
      }

      if (valorA < valorB) return direcao === 'asc' ? -1 : 1;
      if (valorA > valorB) return direcao === 'asc' ? 1 : -1;
      return 0;
    });

    setAtividadesFiltradas(resultado);
  };

  const alternarOrdenacao = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const calcularPercentual = (acertos, questoes) => {
    if (!questoes || questoes === 0) return 0;
    return ((acertos / questoes) * 100).toFixed(1);
  };

  const getIconeOrdenacao = (campo) => {
    if (ordenacao.campo !== campo) return '↕';
    return ordenacao.direcao === 'asc' ? '↑' : '↓';
  };

  const limparFiltros = () => {
    setFiltroTipo('');
    setFiltroArea('');
    setFiltroBusca('');
  };

  // Obter listas únicas para filtros
  const tiposUnicos = [...new Set(atividades.map(a => a.tipo))].filter(Boolean);
  const areasUnicas = [...new Set(atividades.map(a => a.area))].filter(Boolean);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="container">
        <button
          className="menu-button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          ☰
        </button>

        <div className="card">
          <div className="header-minhas-atividades">
            <div>
              <h1 className="titulo">Minhas Atividades</h1>
              <p className="subtitulo">
                {atividadesFiltradas.length} de {atividades.length} atividade(s)
              </p>
            </div>
            <button onClick={carregarAtividades} className="botao-recarregar" disabled={isLoading}>
              {isLoading ? '🔄' : '↻'} Atualizar
            </button>
          </div>

          {/* Filtros */}
          <div className="filtros">
            <div className="filtro-grupo">
              <input
                type="text"
                placeholder="🔍 Buscar por título, matéria ou assunto..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="filtro-busca"
              />
            </div>

            <div className="filtro-grupo">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="filtro-select"
              >
                <option value="">Todos os tipos</option>
                {tiposUnicos.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>

              <select
                value={filtroArea}
                onChange={(e) => setFiltroArea(e.target.value)}
                className="filtro-select"
              >
                <option value="">Todas as áreas</option>
                {areasUnicas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>

              {(filtroTipo || filtroArea || filtroBusca) && (
                <button onClick={limparFiltros} className="botao-limpar-filtros">
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* Mensagens de erro */}
          {erro && (
            <div className="mensagem mensagem-erro">
              {erro}
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="loading">Carregando atividades...</div>
          ) : atividadesFiltradas.length === 0 ? (
            <div className="vazio">
              {atividades.length === 0
                ? 'Nenhuma atividade encontrada. Crie sua primeira atividade!'
                : 'Nenhuma atividade encontrada com os filtros aplicados.'}
            </div>
          ) : (
            /* Tabela de atividades */
            <div className="tabela-container">
              <table className="tabela-atividades">
                <thead>
                  <tr>
                    <th onClick={() => alternarOrdenacao('tipo')}>
                      Tipo {getIconeOrdenacao('tipo')}
                    </th>
                    <th onClick={() => alternarOrdenacao('titulo')}>
                      Título {getIconeOrdenacao('titulo')}
                    </th>
                    <th onClick={() => alternarOrdenacao('area')}>
                      Área {getIconeOrdenacao('area')}
                    </th>
                    <th onClick={() => alternarOrdenacao('materia')}>
                      Matéria {getIconeOrdenacao('materia')}
                    </th>
                    <th onClick={() => alternarOrdenacao('assunto')}>
                      Assunto {getIconeOrdenacao('assunto')}
                    </th>
                    <th onClick={() => alternarOrdenacao('questoes')}>
                      Questões {getIconeOrdenacao('questoes')}
                    </th>
                    <th onClick={() => alternarOrdenacao('acertos')}>
                      Acertos {getIconeOrdenacao('acertos')}
                    </th>
                    <th>Aproveitamento</th>
                    <th onClick={() => alternarOrdenacao('tempo_total')}>
                      Tempo {getIconeOrdenacao('tempo_total')}
                    </th>
                    <th onClick={() => alternarOrdenacao('data_execucao')}>
                      Data {getIconeOrdenacao('data_execucao')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {atividadesFiltradas.map((atividade) => {
                    const percentual = calcularPercentual(atividade.acertos, atividade.questoes);
                    return (
                      <tr key={atividade.id_atividade}>
                        <td>
                          <span className={`badge badge-${atividade.tipo?.toLowerCase()}`}>
                            {atividade.tipo}
                          </span>
                        </td>
                        <td className="celula-titulo">{atividade.titulo}</td>
                        <td>{atividade.area || '-'}</td>
                        <td>{atividade.materia || '-'}</td>
                        <td>{atividade.assunto || '-'}</td>
                        <td className="celula-numero">{atividade.questoes || '-'}</td>
                        <td className="celula-numero">{atividade.acertos || '-'}</td>
                        <td className="celula-percentual">
                          {atividade.questoes ? (
                            <span className={`percentual ${percentual >= 70 ? 'bom' : percentual >= 50 ? 'medio' : 'baixo'}`}>
                              {percentual}%
                            </span>
                          ) : '-'}
                        </td>
                        <td>{atividade.tempo_total || '-'}</td>
                        <td className="celula-data">
                          {atividade.data_execucao || atividade.data_inclusao || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MinhasAtividades;
