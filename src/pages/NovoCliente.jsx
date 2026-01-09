import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import Header from "../components/Header";

/* utils locais */
function onlyDigits(v = "") {
  return String(v).replace(/\D/g, "");
}

function capitalizeNome(nome = "") {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

function maskTelefone(v = "") {
  const d = onlyDigits(v).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskCpf(v = "") {
  const d = onlyDigits(v).slice(0, 11);
  if (!d) return "";
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export default function NovoCliente() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    rg: "",
    telefone: "",
    email: "",
    cpf: "",
    status: "ativa",
    observacoes: "",
  });

  function setField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function salvar() {
    if (!form.nome.trim()) {
      alert("Nome é obrigatório.");
      return;
    }

    const payload = {
      nome: capitalizeNome(form.nome),
      rg: form.rg?.trim() || null,
      telefone: onlyDigits(form.telefone) || null,
      email: form.email?.trim() || null,
      cpf: onlyDigits(form.cpf) || null,
      status: form.status,
      observacoes: form.observacoes?.trim() || null,
    };

    try {
      setSaving(true);
      await api.post("/clientes", payload);
      navigate("/clientes");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar cliente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <Header
        right={
          <button className="btn btn-secondary" onClick={() => navigate("/clientes")}>
            ← Voltar
          </button>
        }
      />

      <h2 className="page-title">Novo Cliente</h2>

      {/* DADOS PRINCIPAIS */}
      <div className="card" style={{ padding: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          <div>
            <label className="label">Nome *</label>
            <input
              className="input"
              value={form.nome}
              onChange={(e) => setField("nome", e.target.value)}
              placeholder="Ex: Maria da Silva"
            />
          </div>

          <div>
            <label className="label">RG</label>
            <input
              className="input"
              value={form.rg}
              onChange={(e) => setField("rg", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Telefone</label>
            <input
              className="input"
              value={form.telefone}
              onChange={(e) => setField("telefone", maskTelefone(e.target.value))}
              maxLength={15}
              placeholder="(00) 99999-9999"
            />
          </div>

          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="label">CPF</label>
            <input
              className="input"
              value={form.cpf}
              onChange={(e) => setField("cpf", maskCpf(e.target.value))}
              maxLength={14}
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
            >
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
            </select>
          </div>
        </div>
      </div>

      {/* OBSERVAÇÕES */}
      <div className="card" style={{ padding: 20, marginTop: 18 }}>
        <label className="label">Observações</label>
        <textarea
          className="input"
          rows={4}
          value={form.observacoes}
          onChange={(e) => setField("observacoes", e.target.value)}
          placeholder="Queixa principal, restrições, observações clínicas..."
        />
      </div>

      {/* AÇÕES */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
        <button className="btn btn-secondary" onClick={() => navigate("/clientes")}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={salvar} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
