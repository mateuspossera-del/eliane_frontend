// src/pages/Evolucao.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api";
import Header from "../components/Header";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const labels = {
  braco_direito: "Braço direito",
  braco_esquerdo: "Braço esquerdo",
  quadril: "Quadril",
  gluteos: "Glúteos",
  coxa_direita: "Coxa direita",
  coxa_esquerda: "Coxa esquerda",
  perna_direita: "Perna direita",
  perna_esquerda: "Perna esquerda",
};

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR");
}

function fmtDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR");
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function Evolucao() {
  const { clienteId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [cliente, setCliente] = useState(null);
  const [data, setData] = useState(null);

  const [ponto, setPonto] = useState("perna_direita");

  const carregar = async () => {
    setLoading(true);
    setErro("");
    try {
      const [c, d] = await Promise.all([
        api.get(`/clientes/${clienteId}`),
        api.get(`/clientes/${clienteId}/evolucao`),
      ]);
      setCliente(c.data || null);
      setData(d.data || null);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar a evolução.");
      setCliente(null);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clienteId) return;
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  const sessoes = useMemo(() => {
    const arr = Array.isArray(data?.sessoes) ? data.sessoes : [];
    return [...arr].sort(
      (a, b) => new Date(a.data_sessao).getTime() - new Date(b.data_sessao).getTime()
    );
  }, [data]);

  const chartData = useMemo(() => {
    return sessoes.map((s, idx) => {
      const medidas = Array.isArray(s.medidas) ? s.medidas : [];
      const m = medidas.find((x) => x.ponto === ponto);

      return {
        idx,
        data: fmtDate(s.data_sessao),
        data_full: fmtDateTime(s.data_sessao),
        antes: m?.antes != null ? toNum(m.antes) : null,
        depois: m?.depois != null ? toNum(m.depois) : null,
        dor: toNum(s.dor ?? null),
        inchaco: toNum(s.inchaco ?? null),
        peso: toNum(s.peso_pernas ?? null),
      };
    });
  }, [sessoes, ponto]);

  // pega primeiro/último registro do ponto com algum valor
  const firstValid = useMemo(() => {
    return chartData.find((x) => x.antes != null || x.depois != null) || null;
  }, [chartData]);

  const lastValid = useMemo(() => {
    for (let i = chartData.length - 1; i >= 0; i--) {
      const x = chartData[i];
      if (x.antes != null || x.depois != null) return x;
    }
    return null;
  }, [chartData]);

  const variacao = useMemo(() => {
    if (!firstValid || !lastValid) return null;

    // início: prefere "antes", senão "depois"
    const inicio = firstValid.antes != null ? firstValid.antes : firstValid.depois;
    // fim: prefere "depois", senão "antes"
    const fim = lastValid.depois != null ? lastValid.depois : lastValid.antes;

    if (inicio == null || fim == null) return null;
    return Number((fim - inicio).toFixed(1));
  }, [firstValid, lastValid]);

  const temAlgumaSessao = sessoes.length > 0;
  const temMedidaNoPonto = !!firstValid && !!lastValid;

  if (loading) {
    return (
      <div className="page">
        <Header
          right={
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              ← Voltar
            </button>
          }
        />
        <div className="container">
          <div className="card" style={{ padding: 16, marginTop: 16 }}>
            Carregando...
          </div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="page">
        <Header
          right={
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              ← Voltar
            </button>
          }
        />
        <div className="container">
          <div
            className="card"
            style={{
              padding: 16,
              marginTop: 16,
              border: "1px solid rgba(217, 28, 28, 0.25)",
              background: "rgba(217, 28, 28, 0.08)",
              fontWeight: 800,
            }}
          >
            {erro}
          </div>

          <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!cliente || !data) {
    return (
      <div className="page">
        <Header
          right={
            <button className="btn btn-secondary" onClick={() => navigate("/clientes")}>
              ← Voltar
            </button>
          }
        />
        <div className="container">
          <div className="card" style={{ padding: 16, marginTop: 16 }}>
            Cliente não encontrado.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header
        right={
          <div className="actions-row">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              ← Voltar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/clientes/${clienteId}/sessoes/nova`)}
            >
              + Nova Sessão
            </button>
          </div>
        }
      />

      <div className="container">
        <h2 className="page-title">Evolução — {cliente.nome}</h2>

        <div className="small muted">
          {data.total_sessoes ?? sessoes.length} sessões •{" "}
          {data.periodo?.inicio ? fmtDate(data.periodo.inicio) : "-"} →{" "}
          {data.periodo?.fim ? fmtDate(data.periodo.fim) : "-"}
        </div>

        {/* Seletor */}
        <div className="actions-row" style={{ marginTop: 18 }}>
          <select
            className="input"
            value={ponto}
            onChange={(e) => setPonto(e.target.value)}
            style={{ maxWidth: 360 }}
          >
            {Object.entries(labels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Estados vazios */}
        {!temAlgumaSessao ? (
          <div className="card" style={{ marginTop: 18, padding: 18 }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Sem sessões registradas</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Cadastre a primeira sessão para começar a acompanhar a evolução.
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => navigate(`/clientes/${clienteId}/sessoes/nova`)}
            >
              + Nova Sessão
            </button>
          </div>
        ) : !temMedidaNoPonto ? (
          <div className="card" style={{ marginTop: 18, padding: 18 }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              Sem medidas para “{labels[ponto]}”
            </div>
            <div className="muted" style={{ marginTop: 6 }}>
              Existem sessões, mas não há medidas registradas para este ponto.
            </div>
          </div>
        ) : (
          <>
            {/* Resumo */}
            <div className="card" style={{ marginTop: 20, padding: 18 }}>
              <div className="actions-row" style={{ justifyContent: "space-between" }}>
                <div>
                  <strong>{labels[ponto]}</strong>
                  <div className="small muted">
                    {firstValid?.data} → {lastValid?.data}
                  </div>
                </div>

                {variacao !== null && (
                  <span className="pill">
                    Variação: {variacao > 0 ? "+" : ""}
                    {variacao} cm
                  </span>
                )}
              </div>

              <div className="grid grid-3" style={{ marginTop: 14 }}>
                <div className="card" style={{ padding: 12 }}>
                  <div className="small muted">Primeiro</div>
                  <div style={{ fontWeight: 900, fontSize: 18, marginTop: 4 }}>
                    {firstValid?.antes ?? firstValid?.depois ?? "-"}
                  </div>
                  <div className="small muted" style={{ marginTop: 4 }}>
                    {firstValid?.data_full}
                  </div>
                </div>

                <div className="card" style={{ padding: 12 }}>
                  <div className="small muted">Último</div>
                  <div style={{ fontWeight: 900, fontSize: 18, marginTop: 4 }}>
                    {lastValid?.depois ?? lastValid?.antes ?? "-"}
                  </div>
                  <div className="small muted" style={{ marginTop: 4 }}>
                    {lastValid?.data_full}
                  </div>
                </div>

                <div className="card" style={{ padding: 12 }}>
                  <div className="small muted">Sintomas (geral)</div>
                  <div className="small" style={{ marginTop: 6, lineHeight: 1.6 }}>
                    Dor: <b>{data.dor_inicio ?? "-"}</b> → <b>{data.dor_fim ?? "-"}</b>
                    <br />
                    Inchaço: <b>{data.inchaco_inicio ?? "-"}</b> → <b>{data.inchaco_fim ?? "-"}</b>
                    <br />
                    Peso: <b>{data.peso_inicio ?? "-"}</b> → <b>{data.peso_fim ?? "-"}</b>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <div className="card" style={{ marginTop: 22, height: 380, padding: 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="antes" name="Antes (cm)" dot={false} />
                  <Line type="monotone" dataKey="depois" name="Depois (cm)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Histórico */}
            <div className="card" style={{ marginTop: 16, padding: 16 }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Histórico — {labels[ponto]}</div>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Antes</th>
                      <th>Depois</th>
                      <th>Δ (Depois - Antes)</th>
                      <th>Dor</th>
                      <th>Inchaço</th>
                      <th>Peso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((r) => {
                      const delta =
                        r.antes != null && r.depois != null
                          ? Number((r.depois - r.antes).toFixed(1))
                          : null;

                      return (
                        <tr key={`${r.idx}-${r.data_full}`}>
                          <td>{r.data_full}</td>
                          <td>{r.antes ?? "-"}</td>
                          <td>{r.depois ?? "-"}</td>
                          <td>{delta == null ? "-" : `${delta > 0 ? "+" : ""}${delta}`}</td>
                          <td>{r.dor ?? "-"}</td>
                          <td>{r.inchaco ?? "-"}</td>
                          <td>{r.peso ?? "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
