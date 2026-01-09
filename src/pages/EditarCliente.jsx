import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../api/api";
import { onlyDigits, capitalizeNome, maskCpf, maskTelefone } from "../utils/format";

export default function EditarCliente() {
  const { clienteId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const initial = useMemo(
    () => ({
      nome: "",
      rg: "",
      telefone: "",
      email: "",
      cpf: "",
      status: "ativa",
      observacoes: "",
    }),
    []
  );

  const [form, setForm] = useState(initial);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const carregar = async () => {
    setErro("");
    setLoading(true);
    try {
      const res = await api.get(`/clientes/${clienteId}`);
      const c = res.data || {};

      setForm({
        nome: c.nome || "",
        rg: c.rg || "",
        telefone: c.telefone || "",
        email: c.email || "",
        cpf: c.cpf || "",
        status: (c.status || "ativa").toLowerCase(),
        observacoes: c.observacoes || "",
      });
    } catch (e) {
      setErro("Cliente não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clienteId) return;
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  const salvar = async () => {
    setErro("");
    setSaving(true);

    // normaliza para o backend
    const payload = {
      nome: capitalizeNome(form.nome || ""),
      rg: String(form.rg || "").trim() || null,
      telefone: onlyDigits(form.telefone || "") || null,
      email: String(form.email || "").trim() || null,
      cpf: onlyDigits(form.cpf || "") || null,
      status: (form.status || "ativa").toLowerCase(),
      observacoes: String(form.observacoes || "").trim() || null,
    };

    try {
      await api.patch(`/clientes/${clienteId}`, payload);
      alert("Cliente atualizado.");
      navigate(`/clientes/${clienteId}`);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Erro ao salvar alterações.";
      setErro(typeof msg === "string" ? msg : "Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container">Carregando...</div>;

  return (
    <div className="container">
      <Header
        right={
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            ← Voltar
          </button>
        }
      />

      <h2 style={{ marginTop: 18 }}>Editar Cliente</h2>

      {erro ? (
        <div
          className="card"
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid rgba(217, 28, 28, 0.25)",
            background: "rgba(217, 28, 28, 0.08)",
            fontWeight: 700,
          }}
        >
          {erro}
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 14, padding: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1.2fr 2fr 1.2fr",
            gap: 12,
          }}
        >
          <label className="label" style={{ margin: 0 }}>
            Nome *
            <input
              className="input"
              value={form.nome}
              onChange={(e) => setField("nome", e.target.value)}
              placeholder="Nome completo"
            />
          </label>

          <label className="label" style={{ margin: 0 }}>
            RG
            <input
              className="input"
              value={form.rg}
              onChange={(e) => setField("rg", e.target.value)}
              placeholder="RG"
            />
          </label>

          <label className="label" style={{ margin: 0 }}>
            Telefone
            <input
              className="input"
              value={maskTelefone(form.telefone)}
              onChange={(e) => setField("telefone", e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </label>

          <label className="label" style={{ margin: 0 }}>
            E-mail
            <input
              className="input"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="email@exemplo.com"
            />
          </label>

          <label className="label" style={{ margin: 0 }}>
            CPF
            <input
              className="input"
              value={maskCpf(form.cpf)}
              onChange={(e) => setField("cpf", e.target.value)}
              placeholder="000.000.000-00"
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 12 }}>
          <label className="label" style={{ margin: 0, maxWidth: 260 }}>
            Status
            <select
              value={(form.status || "ativa").toLowerCase()}
              onChange={(e) => setField("status", e.target.value)}
            >
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
            </select>
          </label>

          <label className="label" style={{ margin: 0 }}>
            Observações
            <textarea
              rows={4}
              value={form.observacoes}
              onChange={(e) => setField("observacoes", e.target.value)}
              placeholder="Anotações relevantes..."
            />
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={salvar} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
