// src/pages/Clientes.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import Header from "../components/Header";
import { capitalizeNome, maskTelefone, onlyDigits } from "../utils/format";

export default function Clientes() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);

  const [q, setQ] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos"); // todos | ativa | inativa

  // ✅ NOVO: estado de erro (para não ficar “sumido” quando dá 401/500)
  const [erro, setErro] = useState("");

  const carregar = async () => {
    setLoading(true);
    setErro("");
    try {
      const res = await api.get("/clientes");
      console.log("GET /clientes status:", res.status);
      console.log("GET /clientes data:", res.data);

      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      console.error("GET /clientes erro:", err);
      console.log("status:", status);
      console.log("data:", err?.response?.data);

      // ✅ mensagem clara pro usuário
      let msg = "Erro ao carregar clientes.";
      if (status === 401) msg = "Sem autorização (401). Faça login novamente.";
      if (detail) msg += `\n\nDetalhe: ${detail}`;

      setErro(msg);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const excluirCliente = async (c) => {
    const ok = confirm(
      `Excluir cliente?\n\n${capitalizeNome(c.nome || "")}\n\nIsso remove também anamnese e sessões vinculadas.`
    );
    if (!ok) return;

    try {
      await api.delete(`/clientes/${c.id}`);
      await carregar();
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      alert(
        `Erro ao excluir cliente.${status ? `\nStatus: ${status}` : ""}${
          detail ? `\nDetalhe: ${detail}` : ""
        }`
      );
    }
  };

  const clientesFiltrados = useMemo(() => {
    const term = (q || "").trim().toLowerCase();
    const termDigits = onlyDigits(term);

    return (clientes || [])
      .filter((c) => {
        if (statusFiltro === "todos") return true;
        return String(c.status || "").toLowerCase() === statusFiltro;
      })
      .filter((c) => {
        if (!term) return true;

        const nome = String(c.nome || "").toLowerCase();
        const tel = onlyDigits(String(c.telefone || ""));
        const cpf = onlyDigits(String(c.cpf || ""));
        const email = String(c.email || "").toLowerCase();

        if (termDigits) return tel.includes(termDigits) || cpf.includes(termDigits);
        return nome.includes(term) || email.includes(term);
      });
  }, [clientes, q, statusFiltro]);

  const badgeText = (s) => {
    const v = String(s || "").toLowerCase();
    if (v === "ativa") return "Ativa";
    if (v === "inativa") return "Inativa";
    return s || "-";
  };

  return (
    <div className="container">
      <Header
        right={
          <div className="actions-row">
            <button className="btn btn-secondary" onClick={carregar}>
              ↻ Atualizar
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/clientes/novo")}>
              + Novo Cliente
            </button>
          </div>
        }
      />

      <h1 className="page-title">Clientes</h1>

      {/* ✅ NOVO: bloco de erro visível */}
      {erro ? (
        <div className="card" style={{ padding: 14, borderLeft: "4px solid #d14" }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Falha ao carregar</div>
          <div className="small" style={{ whiteSpace: "pre-wrap" }}>
            {erro}
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-secondary" onClick={carregar}>
              Tentar novamente
            </button>

            {/* ✅ se for 401, botão prático */}
            <button
              className="btn btn-danger"
              onClick={() => {
                localStorage.removeItem("auth_ok");
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_nome");
                navigate("/login");
              }}
            >
              Ir para Login
            </button>
          </div>
        </div>
      ) : null}

      {/* Filtros */}
      <div className="card" style={{ padding: 16, marginTop: 12 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 360px" }}>
            <label className="label">Buscar</label>
            <input
              className="input"
              placeholder="Nome, telefone, CPF ou e-mail"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div style={{ width: 220 }}>
            <label className="label">Status</label>
            <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="ativa">Ativos</option>
              <option value="inativa">Inativos</option>
            </select>
          </div>

          <div style={{ alignSelf: "end", marginLeft: "auto" }}>
            <div className="small muted">
              {loading ? "Carregando..." : `${clientesFiltrados.length} cliente(s)`}
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div style={{ marginTop: 16 }}>
        <div className="table-card">
          {/* ✅ overflow horizontal no mobile */}
          <div className="table-scroll">
            <div className="table-head" style={{ gridTemplateColumns: "2fr 1.3fr 1fr 1.6fr" }}>
              <div>Cliente</div>
              <div>Telefone</div>

              {/* ✅ header Status centralizado */}
              <div className="tc">Status</div>

              <div className="ta-right">Ações</div>
            </div>

            {loading ? (
              <div className="table-row" style={{ gridTemplateColumns: "2fr 1.3fr 1fr 1.6fr" }}>
                <div className="muted">Carregando...</div>
                <div />
                <div />
                <div />
              </div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="table-row" style={{ gridTemplateColumns: "2fr 1.3fr 1fr 1.6fr" }}>
                <div className="muted">
                  {erro ? "Sem dados (erro na API)." : "Nenhum cliente encontrado."}
                </div>
                <div />
                <div />
                <div />
              </div>
            ) : (
              clientesFiltrados.map((c) => (
                <div
                  className="table-row"
                  style={{ gridTemplateColumns: "2fr 1.3fr 1fr 1.6fr" }}
                  key={c.id}
                >
                  <div style={{ fontWeight: 900 }}>
                    {capitalizeNome(c.nome || "")}
                    {c.email ? (
                      <div className="small muted" style={{ marginTop: 2 }}>
                        {c.email}
                      </div>
                    ) : null}
                  </div>

                  <div>{maskTelefone(c.telefone) || "-"}</div>

                  {/* ✅ pill centralizada */}
                  <div className="cell-center">
                    <span className="pill">{badgeText(c.status)}</span>
                  </div>

                  <div
                    className="ta-right"
                    style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}
                  >
                    <button className="btn btn-secondary" onClick={() => navigate(`/clientes/${c.id}`)}>
                      Abrir
                    </button>

                    <button className="btn btn-secondary" onClick={() => navigate(`/clientes/${c.id}/editar`)}>
                      ✏️ Editar
                    </button>

                    <button className="btn btn-danger" onClick={() => excluirCliente(c)}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
