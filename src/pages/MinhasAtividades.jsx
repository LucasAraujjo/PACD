import { useState, useEffect } from 'react';
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
  const [filtroBusca, setFiltroBusca] = useState('');

  // Estado de ordenação
  const [ordenacao, setOrdenacao] = useState({ campo: 'DT_ATUALIZACAO', direcao: 'desc' });

  // Estados do modal
  const [modalAberto, setModalAberto] = useState(false);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null);

  // Carregar atividades ao montar o componente
  useEffect(() => {
    carregarAtividades();
  }, []);

  // Aplicar filtros e ordenação quando atividades ou filtros mudarem
  useEffect(() => {
    aplicarFiltrosEOrdenacao();
  }, [atividades, filtroTipo, filtroBusca, ordenacao]);

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
      resultado = resultado.filter(a => a.TIPO === filtroTipo);
    }

    // Filtro por busca (ID e título)
    if (filtroBusca) {
      const busca = filtroBusca.toLowerCase();
      resultado = resultado.filter(a =>
        String(a.ID_ATIVIDADE).includes(busca) ||
        a.TITULO?.toLowerCase().includes(busca)
      );
    }

    // Ordenação
    resultado.sort((a, b) => {
      const { campo, direcao } = ordenacao;
      let valorA = a[campo] || '';
      let valorB = b[campo] || '';

      // Tratamento especial para números
      if (campo === 'ID_ATIVIDADE') {
        valorA = parseInt(valorA) || 0;
        valorB = parseInt(valorB) || 0;
      }

      // Tratamento especial para datas
      if (campo === 'DT_ATUALIZACAO') {
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

  const getIconeOrdenacao = (campo) => {
    if (ordenacao.campo !== campo) return '↕';
    return ordenacao.direcao === 'asc' ? '↑' : '↓';
  };

  const limparFiltros = () => {
    setFiltroTipo('');
    setFiltroBusca('');
  };

  const abrirDetalhes = (atividade) => {
    setAtividadeSelecionada(atividade);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setAtividadeSelecionada(null);
  };

  // Obter tipos únicos para filtro
  const tiposUnicos = [...new Set(atividades.map(a => a.TIPO))].filter(Boolean);

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
                placeholder="🔍 Buscar por ID ou título..."
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

              {(filtroTipo || filtroBusca) && (
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
                    <th onClick={() => alternarOrdenacao('ID_ATIVIDADE')}>
                      ID {getIconeOrdenacao('ID_ATIVIDADE')}
                    </th>
                    <th onClick={() => alternarOrdenacao('TITULO')}>
                      Título {getIconeOrdenacao('TITULO')}
                    </th>
                    <th onClick={() => alternarOrdenacao('TIPO')}>
                      Tipo {getIconeOrdenacao('TIPO')}
                    </th>
                    <th onClick={() => alternarOrdenacao('DT_ATUALIZACAO')}>
                      Data de Atualização {getIconeOrdenacao('DT_ATUALIZACAO')}
                    </th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {atividadesFiltradas.map((atividade) => (
                    <tr key={atividade.ID_ATIVIDADE}>
                      <td className="celula-numero">{atividade.ID_ATIVIDADE}</td>
                      <td className="celula-titulo">{atividade.TITULO}</td>
                      <td>
                        <span className={`badge badge-${atividade.TIPO?.toLowerCase()}`}>
                          {atividade.TIPO}
                        </span>
                      </td>
                      <td className="celula-data">{atividade.DT_ATUALIZACAO}</td>
                      <td>
                        <button
                          className="botao-detalhes"
                          onClick={() => abrirDetalhes(atividade)}
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {modalAberto && atividadeSelecionada && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                Detalhes - {atividadeSelecionada.TITULO}
              </h2>
              <button className="modal-fechar" onClick={fecharModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {atividadeSelecionada.TIPO === 'Simulado' ? (
                /* Modal de Simulados */
                <div className="tabela-container">
                  <table className="tabela-detalhes">
                    <thead>
                      <tr>
                        <th>ID Simulado</th>
                        <th>Área</th>
                        <th>Questões</th>
                        <th>Acertos</th>
                        <th>Aproveitamento</th>
                        <th>Tempo Total</th>
                        <th>Comentários</th>
                        <th>Data Inclusão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atividadeSelecionada.INFO?.map((simulado, index) => {
                        const percentual = ((simulado.ACERTOS / simulado.QUESTOES) * 100).toFixed(1);
                        return (
                          <tr key={index}>
                            <td>{simulado.ID_SIMULADO}</td>
                            <td>{simulado.AREA}</td>
                            <td className="celula-numero">{simulado.QUESTOES}</td>
                            <td className="celula-numero">{simulado.ACERTOS}</td>
                            <td className="celula-percentual">
                              <span className={`percentual ${percentual >= 70 ? 'bom' : percentual >= 50 ? 'medio' : 'baixo'}`}>
                                {percentual}%
                              </span>
                            </td>
                            <td>{simulado.TEMPO_TOTAL}</td>
                            <td className="celula-comentarios">{simulado.COMENTARIOS || '-'}</td>
                            <td className="celula-data">{simulado.DT_INCLUSAO}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Modal de Questões */
                <div className="tabela-container">
                  <table className="tabela-detalhes">
                    <thead>
                      <tr>
                        <th>ID Bloco</th>
                        <th>Área</th>
                        <th>Matéria</th>
                        <th>Assunto</th>
                        <th>Questões</th>
                        <th>Acertos</th>
                        <th>Aproveitamento</th>
                        <th>Tempo Total</th>
                        <th>Comentários</th>
                        <th>Data Inclusão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atividadeSelecionada.INFO?.map((questao, index) => {
                        const percentual = ((questao.ACERTOS / questao.QUESTOES) * 100).toFixed(1);
                        return (
                          <tr key={index}>
                            <td>{questao.ID_QUESTAO}</td>
                            <td>{questao.AREA}</td>
                            <td>{questao.MATERIA}</td>
                            <td>{questao.ASSUNTO}</td>
                            <td className="celula-numero">{questao.QUESTOES}</td>
                            <td className="celula-numero">{questao.ACERTOS}</td>
                            <td className="celula-percentual">
                              <span className={`percentual ${percentual >= 70 ? 'bom' : percentual >= 50 ? 'medio' : 'baixo'}`}>
                                {percentual}%
                              </span>
                            </td>
                            <td>{questao.TEMPO_TOTAL}</td>
                            <td className="celula-comentarios">{questao.COMENTARIOS || '-'}</td>
                            <td className="celula-data">{questao.DT_INCLUSAO}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MinhasAtividades;
