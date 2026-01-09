import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api";
import { capitalizeNome, maskTelefone } from "../utils/format";
import Header from "../components/Header";

export default function ClienteDetalhe() {
  const { clienteId } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarCliente = async () => {
    const res = await api.get(`/clientes/${clienteId}`);
    setCliente(res.data);
  };

  const carregarSessoes = async () => {
    const res = await api.get(`/clientes/${clienteId}/sessoes`);
    setSessoes(res.data || []);
  };

  useEffect(() => {
    if (!clienteId) return;

    setLoading(true);
    Promise.all([carregarCliente(), carregarSessoes()]).finally(() => setLoading(false));
  }, [clienteId]);

  const excluirSessao = async (sessao) => {
    const ok = confirm(
      `Excluir esta sessão?\n\nData: ${new Date(sessao.data_sessao).toLocaleString()}\n\nIsso remove também as medidas.`
    );
    if (!ok) return;

    await api.delete(`/sessoes/${sessao.id}`);
    carregarSessoes();
  };

  const baixarRelatorioPdf = async () => {
    try {
      const res = await api.get(`/clientes/${clienteId}/relatorio.pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_cliente_${clienteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar o relatório.");
    }
  };

  if (loading) return <div className="container">Carregando...</div>;
  if (!cliente) return <div className="container">Cliente não encontrado.</div>;

  return (
    <div className="container">
      <Header
        right={
          <>
            <button className="btn btn-secondary" onClick={() => navigate(`/clientes/${clienteId}/anamnese`)}>
              📝 Anamnese
            </button>

            <button className="btn btn-secondary" onClick={() => navigate(`/clientes/${clienteId}/evolucao`)}>
              📈 Evolução
            </button>

            <button className="btn btn-secondary" onClick={baixarRelatorioPdf}>
              📄 Relatório (PDF)
            </button>

            <button className="btn btn-primary" onClick={() => navigate(`/clientes/${clienteId}/sessoes/nova`)}>
              + Nova Sessão
            </button>
          </>
        }
      />

      <button className="btn" style={{ marginBottom: 16 }} onClick={() => navigate("/clientes")}>
        ← Voltar
      </button>

      <div>
        <h2>{capitalizeNome(cliente.nome)}</h2>
        <div style={{ opacity: 0.8, fontSize: 13 }}>
          <b>Telefone:</b> {maskTelefone(cliente.telefone) || "-"} &nbsp; | &nbsp;
          <b>Status:</b> <span className="pill">{cliente.status}</span>
        </div>
      </div>

      <h3 style={{ marginTop: 24 }}>Sessões</h3>

      {sessoes.length === 0 ? (
        <p>Nenhuma sessão ainda.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Dor</th>
                <th>Inchaço</th>
                <th>Peso</th>
                <th style={{ width: 260 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sessoes.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.data_sessao).toLocaleString()}</td>
                  <td>{s.dor ?? "-"}</td>
                  <td>{s.inchaco ?? "-"}</td>
                  <td>{s.peso_pernas ?? "-"}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/clientes/${clienteId}/sessoes/${s.id}/editar`)}
                    >
                      Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => excluirSessao(s)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
