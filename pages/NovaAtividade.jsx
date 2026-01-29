import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/NovaAtividade.css';

const NovaAtividade = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: '',
    tempo_total: '',
    comentarios: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Tipos de atividade disponíveis
  const tiposAtividade = [
    'SIMULADO',
    'LISTA',
    'REVISAO',
    'EXERCICIOS',
    'LEITURA',
    'VIDEO_AULA'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('📝 Campo alterado:', name, '=', value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    console.log('🔍 Validando formulário:', formData);

    if (!formData.titulo.trim()) {
      console.error('❌ Validação falhou: título vazio');
      setMensagem({ tipo: 'erro', texto: 'O título é obrigatório' });
      return false;
    }
    if (!formData.tipo) {
      console.error('❌ Validação falhou: tipo não selecionado');
      setMensagem({ tipo: 'erro', texto: 'Selecione o tipo da atividade' });
      return false;
    }
    if (!formData.tempo_total) {
      console.error('❌ Validação falhou: tempo total não preenchido');
      setMensagem({ tipo: 'erro', texto: 'O tempo total é obrigatório' });
      return false;
    }

    console.log('✅ Validação passou!');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Formulário submetido!');
    console.log('📦 Dados do formulário:', formData);

    setMensagem({ tipo: '', texto: '' });

    if (!validarFormulario()) {
      console.warn('⚠️ Formulário inválido, abortando submit');
      return;
    }

    setIsLoading(true);
    console.log('⏳ Enviando requisição para API...');

    try {
      const url = '/api/criar_atividade';
      console.log('🌐 URL:', url);
      console.log('📤 Payload:', JSON.stringify(formData, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('📥 Status da resposta:', response.status, response.statusText);

      // Primeiro pegar o texto da resposta
      const responseText = await response.text();
      console.log('📄 Resposta como texto:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📊 Dados da resposta:', data);
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        console.error('📄 Texto recebido:', responseText);
        throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}`);
      }

      if (response.ok && data.success) {
        console.log('✅ Sucesso!', data);
        setMensagem({
          tipo: 'sucesso',
          texto: `Atividade criada com sucesso! ID: ${data.id_atividade}`
        });

        // Limpar formulário
        setFormData({
          titulo: '',
          tipo: '',
          tempo_total: '',
          comentarios: ''
        });
      } else {
        console.error('❌ Erro na resposta:', data);
        setMensagem({
          tipo: 'erro',
          texto: data.error || 'Erro ao criar atividade'
        });
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      console.error('Stack:', error.stack);
      setMensagem({
        tipo: 'erro',
        texto: `Erro de conexão: ${error.message}`
      });
    } finally {
      setIsLoading(false);
      console.log('✔️ Requisição finalizada');
    }
  };

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
          <h1 className="titulo">Nova Atividade</h1>
          <p className="subtitulo">Registre uma nova atividade de estudo</p>

        {mensagem.texto && (
          <div className={`mensagem mensagem-${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="formulario">
          <div className="campo">
            <label htmlFor="titulo">
              Título <span className="obrigatorio">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ex: Simulado ENEM - Matemática"
              disabled={isLoading}
              maxLength={200}
            />
          </div>

          <div className="campo">
            <label htmlFor="tipo">
              Tipo <span className="obrigatorio">*</span>
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">Selecione o tipo</option>
              {tiposAtividade.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="tempo_total">
              Tempo Total <span className="obrigatorio">*</span>
            </label>
            <input
              type="text"
              id="tempo_total"
              name="tempo_total"
              value={formData.tempo_total}
              onChange={handleChange}
              placeholder="Ex: 2:30 (H:M)"
              disabled={isLoading}
              pattern="[0-9]+:[0-5][0-9]"
            />
          </div>

          <div className="campo">
            <label htmlFor="comentarios">
              Comentários
            </label>
            <textarea
              id="comentarios"
              name="comentarios"
              value={formData.comentarios}
              onChange={handleChange}
              placeholder="Observações opcionais sobre a atividade"
              disabled={isLoading}
              rows={4}
              maxLength={500}
            />
          </div>

          <button
            type="submit"
            className="botao-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Criando...' : 'Criar Atividade'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default NovaAtividade;
