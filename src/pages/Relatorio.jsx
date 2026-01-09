import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../api/api";
import { capitalizeNome, maskTelefone, maskCpf } from "../utils/format";

const PONTOS = [
  { key: "braco_direito", label: "Braço Direito" },
  { key: "braco_esquerdo", label: "Braço Esquerdo" },
  { key: "quadril", label: "Quadril" },
  { key: "gluteos", label: "Glúteos" },
  { key: "coxa_direita", label: "Coxa Direita" },
  { key: "coxa_esquerda", label: "Coxa Esquerda" },
  { key: "perna_direita", label: "Perna Direita" },
  { key: "perna_esquerda", label: "Perna Esquerda" },
];

function fmtDT(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR");
}

function yn(v) {
  if (v === true) return "Sim";
  if (v === false) return "Não";
  return "—";
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function delta(a, b) {
  const na = num(a);
  const nb = num(b);
  if (na == null || nb == null) return null;
  return Number((nb - na).toFixed(1));
}

const ANAMNESE_FIELDS = [
  { k: "gestante", label: "Gestante", extra: { k: "semanas", label: "Semanas (se gestante)" } },
  { k: "lactante", label: "Lactante" },
  { k: "diabetes", label: "Diabetes" },
  { k: "uso_medicamento", label: "Faz uso de medicamento", extra: { k: "medicamento_qual", label: "Qual medicamento" } },
  { k: "hipo_hipertensao", label: "Hipo / Hipertensão" },
  { k: "disturbio_circulatorio", label: "Distúrbio circulatório", extra: { k: "disturbio_especifique", label: "Especifique" } },
  { k: "cirurgia_recente", label: "Cirurgia recente", extra: { k: "cirurgia_especifique", label: "Especifique" } },
  { k: "problemas_pele", label: "Problemas de pele", extra: { k: "pele_especifique", label: "Especifique" } },
  { k: "alergia_cosmetico", label: "Alergia a cosmético", extra: { k: "alergia_qual", label: "Qual" } },
  { k: "protese", label: "Prótese corporal/facial", extra: { k: "protese_especifique", label: "Especifique" } },
  { k: "marcapasso", label: "Marcapasso" },
  { k: "em_tratamento_medico", label: "Está em tratamento médico" },
  { k: "tratamento_dermatologico_recente", label: "Tratamento dermatológico recente" },
  { k: "tumor_lesao_pre_cancerosa", label: "Tumor ou lesão pré-cancerosa" },
  { k: "varizes_trombose_lesao", label: "Varizes / trombose / lesão", extra: { k: "varizes_especifique", label: "Especifique" } },
  { k: "inflamacao_aguda", label: "Inflamação aguda", extra: { k: "inflamacao_especifique", label: "Especifique" } },
  { k: "problemas_ortopedicos", label: "Problemas ortopédicos", extra: { k: "ortopedicos_especifique", label: "Especifique" } },
  { k: "fumante", label: "Fumante" },
  { k: "pratica_atividade_fisica", label: "Pratica atividade física" },
  { k: "ciclo_menstrual_regular", label: "Ciclo menstrual regular" },
];

export default function Relatorio() {
  const { clienteId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [cliente, setCliente] = useState(null);
  const [anamnese, setAnamnese] = useState(null);

  const [sessoes, setSessoes] = useState([]);
  const [firstDetalhe, setFirstDetalhe] = useState(null); // {sessao, medidas[]}
  const [lastDetalhe, setLastDetalhe] = useState(null);

  const carregar = async () => {
    if (!clienteId) return;
    setLoading(true);
    setErro("");

    try {
      const [cRes, aRes, sRes] = await Promise.all([
        api.get(`/clientes/${clienteId}`),
        api.get(`/clientes/${clienteId}/anamnese`),
        api.get(`/clientes/${clienteId}/sessoes`),
      ]);

      setCliente(cRes.data || null);
      setAnamnese(aRes.data || null);

      const list = Array.isArray(sRes.data) ? sRes.data : [];
      const sorted = [...list].sort(
        (x, y) => new Date(x.data_sessao).getTime() - new Date(y.data_sessao).getTime()
      );
      setSessoes(sorted);

      // Pega detalhe da 1ª e da última sessão (para medidas)
      if (sorted.length > 0) {
        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        const [fd, ld] = await Promise.all([
          api.get(`/sessoes/${first.id}/detalhe`),
          api.get(`/sessoes/${last.id}/detalhe`),
        ]);

        setFirstDetalhe(fd.data || null);
        setLastDetalhe(ld.data || null);
      } else {
        setFirstDetalhe(null);
        setLastDetalhe(null);
      }
    } catch (e) {
      console.error(e);
      setErro("Não foi possível gerar o relatório.");
      setCliente(null);
      setAnamnese(null);
      setSessoes([]);
      setFirstDetalhe(null);
      setLastDetalhe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  const medidasByPonto = useMemo(() => {
    const firstMap = new Map(
      (Array.isArray(firstDetalhe?.medidas) ? firstDetalhe.medidas : []).map((m) => [m.ponto, m])
    );
    const lastMap = new Map(
      (Array.isArray(lastDetalhe?.medidas) ? lastDetalhe.medidas : []).map((m) => [m.ponto, m])
    );

    return PONTOS.map((p) => {
      const f = firstMap.get(p.key);
      const l = lastMap.get(p.key);

      return {
        ponto: p.label,
        f_antes: f?.antes ?? null,
        f_depois: f?.depois ?? null,
        l_antes: l?.antes ?? null,
        l_depois: l?.depois ?? null,
        d_antes: delta(f?.antes, l?.antes),
        d_depois: delta(f?.depois, l?.depois),
      };
    });
  }, [firstDetalhe, lastDetalhe]);

  const imprimir = () => {
    window.print();
  };

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
          <div className="card" style={{ padding: 16, marginTop: 16 }}>Gerando relatório...</div>
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

  if (!cliente) {
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
          <div className="card" style={{ padding: 16, marginTop: 16 }}>Cliente não encontrado.</div>
        </div>
      </div>
    );
  }

  const firstSessao = firstDetalhe?.sessao || null;
  const lastSessao = lastDetalhe?.sessao || null;

  return (
    <div className="page">
      <Header
        right={
          <div className="actions-row print-hide">
            <button className="btn btn-secondary" onClick={() => navigate(`/clientes/${clienteId}`)}>
              ← Voltar
            </button>
            <button className="btn btn-primary" onClick={imprimir}>
              🧾 Exportar PDF
            </button>
          </div>
        }
      />

      <div className="container report">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div className="small muted">Relatório de acompanhamento</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {capitalizeNome(cliente.nome || "")}
              </div>
              <div className="small muted" style={{ marginTop: 6 }}>
                Gerado em {new Date().toLocaleString("pt-BR")}
              </div>
            </div>

            <div style={{ minWidth: 260 }}>
              <div className="small muted">Contato</div>
              <div className="small" style={{ marginTop: 6, lineHeight: 1.6 }}>
                <b>Telefone:</b> {maskTelefone(cliente.telefone) || "-"} <br />
                <b>E-mail:</b> {cliente.email || "-"} <br />
                <b>CPF:</b> {maskCpf(cliente.cpf) || "-"} <br />
                <b>Status:</b> <span className="pill">{cliente.status || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo de sessões */}
        <div className="card" style={{ padding: 18, marginTop: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Resumo</div>

          <div className="grid grid-3">
            <div className="card" style={{ padding: 12 }}>
              <div className="small muted">Total de sessões</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>{sessoes.length}</div>
            </div>

            <div className="card" style={{ padding: 12 }}>
              <div className="small muted">Primeira sessão</div>
              <div style={{ fontWeight: 900, marginTop: 4 }}>{fmtDT(firstSessao?.data_sessao)}</div>
              <div className="small muted" style={{ marginTop: 4 }}>
                Dor: <b>{firstSessao?.dor ?? "-"}</b> | Inchaço: <b>{firstSessao?.inchaco ?? "-"}</b> | Peso:{" "}
                <b>{firstSessao?.peso_pernas ?? "-"}</b>
              </div>
            </div>

            <div className="card" style={{ padding: 12 }}>
              <div className="small muted">Última sessão</div>
              <div style={{ fontWeight: 900, marginTop: 4 }}>{fmtDT(lastSessao?.data_sessao)}</div>
              <div className="small muted" style={{ marginTop: 4 }}>
                Dor: <b>{lastSessao?.dor ?? "-"}</b> | Inchaço: <b>{lastSessao?.inchaco ?? "-"}</b> | Peso:{" "}
                <b>{lastSessao?.peso_pernas ?? "-"}</b>
              </div>
            </div>
          </div>
        </div>

        {/* Medidas (Primeira x Última) */}
        <div className="card" style={{ padding: 18, marginTop: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Medidas (cm) — Primeira x Última sessão</div>

          {!firstDetalhe || !lastDetalhe ? (
            <div className="muted">Sem sessões suficientes para comparar medidas.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ponto</th>
                    <th>1ª Antes</th>
                    <th>1ª Depois</th>
                    <th>Últ. Antes</th>
                    <th>Últ. Depois</th>
                    <th>Δ Antes</th>
                    <th>Δ Depois</th>
                  </tr>
                </thead>
                <tbody>
                  {medidasByPonto.map((r) => (
                    <tr key={r.ponto}>
                      <td>{r.ponto}</td>
                      <td>{r.f_antes ?? "-"}</td>
                      <td>{r.f_depois ?? "-"}</td>
                      <td>{r.l_antes ?? "-"}</td>
                      <td>{r.l_depois ?? "-"}</td>
                      <td>{r.d_antes == null ? "-" : `${r.d_antes > 0 ? "+" : ""}${r.d_antes}`}</td>
                      <td>{r.d_depois == null ? "-" : `${r.d_depois > 0 ? "+" : ""}${r.d_depois}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Anamnese */}
        <div className="card" style={{ padding: 18, marginTop: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Anamnese</div>

          {!anamnese ? (
            <div className="muted">Sem anamnese registrada.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Pergunta</th>
                    <th>Resposta</th>
                  </tr>
                </thead>
                <tbody>
                  {ANAMNESE_FIELDS.map((f) => {
                    const v = anamnese?.[f.k];
                    const base = yn(v);

                    let extra = "";
                    if (f.extra && v === true) {
                      const t = String(anamnese?.[f.extra.k] || "").trim();
                      if (t) extra = ` — ${t}`;
                    }

                    return (
                      <tr key={f.k}>
                        <td>{f.label}</td>
                        <td>
                          <b>{base}</b>
                          {extra}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="small muted" style={{ marginTop: 16 }}>
          Observação: este relatório é um resumo de acompanhamento (sintomas e medidas) com base nos registros do sistema.
        </div>
      </div>
    </div>
  );
}
