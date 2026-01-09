import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";

export default function Login() {
  const nav = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { usuario, senha });
      localStorage.setItem("auth_ok", "1");
      localStorage.setItem("auth_token", res.data.token);
      localStorage.setItem("auth_nome", res.data.nome);
      nav("/clientes");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "Usuário ou senha inválidos.";
      setErro(msg);
      localStorage.removeItem("auth_ok");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_nome");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page login-page">
      <div className="login-grid">
        <div className="login-left">
          <img className="login-logo" src="/logo.png" alt="Eliane Leandro" />
        </div>

        <div className="login-right">
          <div className="card card-login">
            <div className="login-titlebar">LOGIN</div>

            <form onSubmit={onSubmit} className="form">
              <label className="label">Usuário</label>
              <input
                className="input"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Usuário"
                autoComplete="username"
              />

              <label className="label">Senha</label>
              <input
                className="input"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                autoComplete="current-password"
              />

              {erro ? (
                <div className="alert alert-error">{erro}</div>
              ) : null}

              <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
