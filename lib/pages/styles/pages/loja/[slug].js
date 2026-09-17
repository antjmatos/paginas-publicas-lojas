import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

const OPCOES = [
  { tipo: 'mensagem_responsavel', label: '💬 Enviar mensagem ao responsável', temMensagem: true },
  { tipo: 'sugestao_produto', label: '🛒 Sugerir produto', temMensagem: true },
  { tipo: 'problema', label: '⚠️ Informar problema', temMensagem: true },
  { tipo: 'falta_produto', label: '📦 Avisar falta de produto', temMensagem: true },
  { tipo: 'app', label: '📱 Baixar o app', link: 'https://SEU_LINK_DO_APP' },
  { tipo: 'regras', label: '📋 Consultar regras', link: 'https://SEU_LINK_DE_REGRAS' },
  { tipo: 'indicacao_condominio', label: '🏢 Indicar condomínio', temMensagem: true },
  { tipo: 'pesquisa', label: '📝 Responder pesquisa', link: 'https://SEU_LINK_DE_PESQUISA' },
  { tipo: 'promocoes', label: '🔥 Consultar promoções', link: 'https://SEU_LINK_DE_PROMOCOES' },
];

export default function PaginaLoja() {
  const router = useRouter();
  const { slug } = router.query;
  const [loja, setLoja] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [opcaoAtiva, setOpcaoAtiva] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function buscarLoja() {
      const { data } = await supabase
        .from('lojas')
        .select('id_loja, nome_condominio, slug')
        .eq('slug', slug)
        .single();
      setLoja(data);
      setCarregando(false);
    }
    buscarLoja();
  }, [slug]);

  async function enviarFormulario(e) {
    e.preventDefault();
    setEnviando(true);
    await supabase.from('solicitacoes').insert({
      loja_id: loja.id_loja,
      tipo: opcaoAtiva.tipo,
      telefone,
      mensagem,
    });
    setEnviando(false);
    setEnviado(true);
  }

  if (carregando) return <div className="container">Carregando...</div>;
  if (!loja) return <div className="container">Loja não encontrada.</div>;

  if (opcaoAtiva && !opcaoAtiva.link) {
    if (enviado) {
      return (
        <div className="container">
          <p className="sucesso">✅ Recebemos sua mensagem!</p>
          <a className="voltar" onClick={() => { setOpcaoAtiva(null); setEnviado(false); setTelefone(''); setMensagem(''); }}>
            ← Voltar
          </a>
        </div>
      );
    }
    return (
      <div className="container">
        <h1>{opcaoAtiva.label}</h1>
        <form onSubmit={enviarFormulario}>
          <input
            type="tel"
            placeholder="Seu telefone (opcional)"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
          <textarea
            rows={5}
            placeholder="Digite sua mensagem"
            required
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />
          <button className="enviar" type="submit" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
        <a className="voltar" onClick={() => setOpcaoAtiva(null)}>← Voltar</a>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{loja.nome_condominio}</h1>
      <p className="subtitulo">Como podemos ajudar?</p>
      {OPCOES.map((op) => (
        op.link ? (
          <a key={op.tipo} href={op.link} target="_blank" rel="noreferrer" className="card">
            {op.label}
          </a>
        ) : (
          <button key={op.tipo} className="card" onClick={() => setOpcaoAtiva(op)}>
            {op.label}
          </button>
        )
      ))}
    </div>
  );
}
