import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api";
import Header from "../components/Header";

const PONTOS = [
  { key: "braco_direito", label: "Braço direito" },
  { key: "braco_esquerdo", label: "Braço esquerdo" },
  { key: "quadril", label: "Quadril" },
  { key: "gluteos", label: "Glúteos" },
  { key: "coxa_direita", label: "Coxa direita" },
  { key: "coxa_esquerda", label: "Coxa esquerda" },
  { key: "perna_direita", label: "Perna direita" },
  { key: "perna_esquerda", label: "Perna esquerda" },
];

function toDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditarSessao() {
  const { clienteId, sessaoId } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  const [dataSessao, setDataSessao] = useState("");
  const [dor, setDor] = useState("");
  const [inchaco, setInchaco] = useState("");
  const [peso, setPeso] = useState("");

  const [medidas, setMedidas] = useState(
    PONTOS.map((p) => ({ ponto: p.key, antes: "", depois: "" }))
  );

  useEffect(() => {
    async function carregar() {
      const c = await api.get(`/clientes/${clienteId}`);
      const res = await api.get(`/sessoes/${sessaoId}/detalhe`);

      setCliente(c.data);

      const s = res.data.sessao;
      const ms = res.data.medidas;

      setDataSessao(toDatetimeLocal(s.data_sessao));
      setDor(s.dor ?? "");
      setInchaco(s.inchaco ?? "");
      setPeso(s.peso_pernas ?? "");

      const map = new Map(ms.map((m) => [m.ponto, m]));

      setMedidas(
        PONTOS.map((p) => ({
          ponto: p.key,
          antes: map.get(p.key)?.antes ?? "",
          depois: map.get(p.key)?.depois ?? "",
        }))
      );

      setLoading(false);
    }

    carregar();
  }, [clienteId, sessaoId]);

  const setMedida = (idx, campo, valor) => {
    setMedidas((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [campo]: valor } : m))
    );
  };

  const salvar = async () => {
    await api.put(`/sessoes/${sessaoId}`, {
      data_sessao: new Date(dataSessao).toISOString(),
      dor: dor !== "" ? Number(dor) : null,
      inchaco: inchaco !== "" ? Number(inchaco) : null,
      peso_pernas: peso !== "" ? Number(peso) : null,
    });

    await api.put(
      `/sessoes/${sessaoId}/medidas`,
      medidas.map((m) => ({
        ponto: m.ponto,
        antes: m.antes !== "" ? Number(m.antes) : null,
        depois: m.depois !== "" ? Number(m.depois) : null,
      }))
    );

    navigate(`/clientes/${clienteId}`);
  };

  if (loading) {
    return <div className="container">Carregando...</div>;
  }

  return (
    <div className="page">
      <div className="container" style={{ paddingBottom: 120 }}>
        <Header
          right={
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              ← Voltar
            </button>
          }
        />

        <h2>Editar Sessão — {cliente.nome}</h2>

        {/* Dados principais */}
        <div
          className="card"
          style={{
            marginTop: 20,
            padding: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          <label>
            <div className="label">Data / Hora</div>
            <input
              type="datetime-local"
              className="input"
              value={dataSessao}
              onChange={(e) => setDataSessao(e.target.value)}
            />
          </label>

          <label>
            <div className="label">Dor (0–10)</div>
            <input
              type="number"
              min="0"
              max="10"
              className="input"
              value={dor}
              onChange={(e) => setDor(e.target.value)}
            />
          </label>

          <label>
            <div className="label">Inchaço (0–10)</div>
            <input
              type="number"
              min="0"
              max="10"
              className="input"
              value={inchaco}
              onChange={(e) => setInchaco(e.target.value)}
            />
          </label>

          <label>
            <div className="label">Peso nas pernas (0–10)</div>
            <input
              type="number"
              min="0"
              max="10"
              className="input"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
          </label>
        </div>

        {/* Medidas */}
        <div className="card" style={{ marginTop: 24, padding: 20 }}>
          <h3>Medidas (cm)</h3>

          <div className="table-card" style={{ marginTop: 12 }}>
            <div className="table-head">
              <div>Ponto</div>
              <div>Antes</div>
              <div>Depois</div>
            </div>

            {PONTOS.map((p, idx) => (
              <div className="table-row" key={p.key}>
                <div>{p.label}</div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    value={medidas[idx].antes}
                    onChange={(e) =>
                      setMedida(idx, "antes", e.target.value)
                    }
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    value={medidas[idx].depois}
                    onChange={(e) =>
                      setMedida(idx, "depois", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barra fixa */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(255,255,255,0.96)",
          borderTop: "1px solid rgba(0,0,0,0.12)",
          padding: 12,
          display: "flex",
          justifyContent: "center",
          zIndex: 999,
        }}
      >
        <div
          style={{
            width: "min(1100px, 100%)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={salvar}>
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}
