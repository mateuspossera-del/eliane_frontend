import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api";
import Header from "../components/Header";

function YesNo({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 20 }}>
      <label>
        <input
          type="radio"
          checked={value === true}
          onChange={() => onChange(true)}
        />{" "}
        Sim
      </label>
      <label>
        <input
          type="radio"
          checked={value === false}
          onChange={() => onChange(false)}
        />{" "}
        Não
      </label>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: 16,
        padding: "14px 0",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        alignItems: "flex-start",
      }}
    >
      <div style={{ fontWeight: 800 }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="card" style={{ marginTop: 24, padding: 20 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

export default function Anamnese() {
  const { clienteId } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    async function carregar() {
      const c = await api.get(`/clientes/${clienteId}`);
      setCliente(c.data);

      const a = await api.get(`/clientes/${clienteId}/anamnese`);
      setForm(a.data || {});
    }
    carregar();
  }, [clienteId]);

  const salvar = async () => {
    setSaving(true);
    await api.put(`/clientes/${clienteId}/anamnese`, form);
    setSaving(false);
    alert("Anamnese salva com sucesso");
  };

  if (!cliente) return <div className="container">Carregando...</div>;

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

        <h2>Anamnese — {cliente.nome}</h2>

        {/* AVALIAÇÃO */}
        <Card title="Avaliação">
          <Row label="Gestante">
            <div>
              <YesNo value={form.gestante} onChange={(v) => set("gestante", v)} />
              {form.gestante === true && (
                <input
                  className="input"
                  placeholder="Semanas"
                  style={{ marginTop: 8, maxWidth: 200 }}
                  value={form.semanas || ""}
                  onChange={(e) => set("semanas", e.target.value)}
                />
              )}
            </div>
          </Row>

          <Row label="Lactante">
            <YesNo value={form.lactante} onChange={(v) => set("lactante", v)} />
          </Row>

          <Row label="Diabetes">
            <YesNo value={form.diabetes} onChange={(v) => set("diabetes", v)} />
          </Row>

          <Row label="Faz uso de medicamento">
            <div>
              <YesNo
                value={form.uso_medicamento}
                onChange={(v) => set("uso_medicamento", v)}
              />
              {form.uso_medicamento === true && (
                <input
                  className="input"
                  placeholder="Qual medicamento"
                  style={{ marginTop: 8 }}
                  value={form.medicamento_qual || ""}
                  onChange={(e) => set("medicamento_qual", e.target.value)}
                />
              )}
            </div>
          </Row>

          <Row label="Hipo / Hipertensão">
            <YesNo
              value={form.hipo_hipertensao}
              onChange={(v) => set("hipo_hipertensao", v)}
            />
          </Row>

          <Row label="Distúrbio circulatório">
            <div>
              <YesNo
                value={form.disturbio_circulatorio}
                onChange={(v) => set("disturbio_circulatorio", v)}
              />
              {form.disturbio_circulatorio === true && (
                <input
                  className="input"
                  placeholder="Especifique"
                  style={{ marginTop: 8 }}
                  value={form.disturbio_especifique || ""}
                  onChange={(e) => set("disturbio_especifique", e.target.value)}
                />
              )}
            </div>
          </Row>

          <Row label="Cirurgia recente">
            <div>
              <YesNo
                value={form.cirurgia_recente}
                onChange={(v) => set("cirurgia_recente", v)}
              />
              {form.cirurgia_recente === true && (
                <input
                  className="input"
                  placeholder="Especifique"
                  style={{ marginTop: 8 }}
                  value={form.cirurgia_especifique || ""}
                  onChange={(e) => set("cirurgia_especifique", e.target.value)}
                />
              )}
            </div>
          </Row>

          <Row label="Problemas de pele">
            <div>
              <YesNo
                value={form.problemas_pele}
                onChange={(v) => set("problemas_pele", v)}
              />
              {form.problemas_pele === true && (
                <input
                  className="input"
                  placeholder="Especifique"
                  style={{ marginTop: 8 }}
                  value={form.pele_especifique || ""}
                  onChange={(e) => set("pele_especifique", e.target.value)}
                />
              )}
            </div>
          </Row>

          <Row label="Alergia a cosmético">
            <div>
              <YesNo
                value={form.alergia_cosmetico}
                onChange={(v) => set("alergia_cosmetico", v)}
              />
              {form.alergia_cosmetico === true && (
                <input
                  className="input"
                  placeholder="Qual"
                  style={{ marginTop: 8 }}
                  value={form.alergia_qual || ""}
                  onChange={(e) => set("alergia_qual", e.target.value)}
                />
              )}
            </div>
          </Row>

          <Row label="Prótese corporal / facial">
            <div>
              <YesNo
                value={form.protese}
                onChange={(v) => set("protese", v)}
              />
              {form.protese === true && (
                <input
                  className="input"
                  placeholder="Especifique"
                  style={{ marginTop: 8 }}
                  value={form.protese_especifique || ""}
                  onChange={(e) => set("protese_especifique", e.target.value)}
                />
              )}
            </div>
          </Row>

          <Row label="Marcapasso">
            <YesNo
              value={form.marcapasso}
              onChange={(v) => set("marcapasso", v)}
            />
          </Row>

          <Row label="Está em tratamento médico">
            <YesNo
              value={form.em_tratamento_medico}
              onChange={(v) => set("em_tratamento_medico", v)}
            />
          </Row>

          <Row label="Tratamento dermatológico recente">
            <YesNo
              value={form.tratamento_dermatologico_recente}
              onChange={(v) =>
                set("tratamento_dermatologico_recente", v)
              }
            />
          </Row>

          <Row label="Tumor ou lesão pré-cancerosa">
            <YesNo
              value={form.tumor_lesao_pre_cancerosa}
              onChange={(v) =>
                set("tumor_lesao_pre_cancerosa", v)
              }
            />
          </Row>

          <Row label="Varizes / trombose / lesão">
            <div>
              <YesNo
                value={form.varizes_trombose_lesao}
                onChange={(v) => set("varizes_trombose_lesao", v)}
              />
              {form.varizes_trombose_lesao === true && (
                <input
                  className="input"
                  placeholder="Especifique"
                  style={{ marginTop: 8 }}
                  value={form.varizes_especifique || ""}
                  onChange={(e) => set("varizes_especifique", e.target.value)}
                />
              )}
            </div>
          </Row>

          <Row label="Inflamação aguda">
            <div>
              <YesNo
                value={form.inflamacao_aguda}
                onChange={(v) => set("inflamacao_aguda", v)}
              />
              {form.inflamacao_aguda === true && (
                <input
                  className="input"
                  placeholder="Especifique"
                  style={{ marginTop: 8 }}
                  value={form.inflamacao_especifique || ""}
                  onChange={(e) =>
                    set("inflamacao_especifique", e.target.value)
                  }
                />
              )}
            </div>
          </Row>

          <Row label="Problemas ortopédicos">
            <div>
              <YesNo
                value={form.problemas_ortopedicos}
                onChange={(v) => set("problemas_ortopedicos", v)}
              />
              {form.problemas_ortopedicos === true && (
                <input
                  className="input"
                  placeholder="Especifique"
                  style={{ marginTop: 8 }}
                  value={form.ortopedicos_especifique || ""}
                  onChange={(e) =>
                    set("ortopedicos_especifique", e.target.value)
                  }
                />
              )}
            </div>
          </Row>

          <Row label="Fumante">
            <YesNo
              value={form.fumante}
              onChange={(v) => set("fumante", v)}
            />
          </Row>

          <Row label="Pratica atividade física">
            <YesNo
              value={form.pratica_atividade_fisica}
              onChange={(v) => set("pratica_atividade_fisica", v)}
            />
          </Row>

          <Row label="Ciclo menstrual regular">
            <YesNo
              value={form.ciclo_menstrual_regular}
              onChange={(v) =>
                set("ciclo_menstrual_regular", v)
              }
            />
          </Row>
        </Card>
      </div>

      {/* BARRA FIXA */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(255,255,255,0.96)",
          borderTop: "1px solid rgba(0,0,0,0.1)",
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
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
          <button
            className="btn btn-primary"
            onClick={salvar}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
