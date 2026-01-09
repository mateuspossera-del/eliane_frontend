import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Clientes from "./pages/Clientes.jsx";
import NovoCliente from "./pages/NovoCliente.jsx";
import ClienteDetalhe from "./pages/ClienteDetalhe.jsx";
import Anamnese from "./pages/Anamnese.jsx";
import Evolucao from "./pages/Evolucao.jsx";
import NovaSessao from "./pages/NovaSessao.jsx";
import EditarSessao from "./pages/EditarSessao.jsx";
import EditarCliente from "./pages/EditarCliente.jsx";
import Relatorio from "./pages/Relatorio.jsx";

function isAuthed() {
  return !!localStorage.getItem("auth_token");
}

function PrivateRoute({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
      <Route path="/clientes/novo" element={<PrivateRoute><NovoCliente /></PrivateRoute>} />
      <Route path="/clientes/:clienteId" element={<PrivateRoute><ClienteDetalhe /></PrivateRoute>} />
      <Route path="/clientes/:clienteId/anamnese" element={<PrivateRoute><Anamnese /></PrivateRoute>} />
      <Route path="/clientes/:clienteId/evolucao" element={<PrivateRoute><Evolucao /></PrivateRoute>} />
      <Route path="/clientes/:clienteId/sessoes/nova" element={<PrivateRoute><NovaSessao /></PrivateRoute>} />
      <Route path="/clientes/:clienteId/sessoes/:sessaoId/editar" element={<PrivateRoute><EditarSessao /></PrivateRoute>} />
      <Route path="/clientes/:clienteId/editar" element={<PrivateRoute><EditarCliente /></PrivateRoute>} />
      <Route path="/clientes/:clienteId/relatorio" element={<PrivateRoute><Relatorio /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
