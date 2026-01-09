import React from "react";

export default function Header({ right }) {
  return (
    <header className="topbar">
      <div className="brand">
        {/* ícone vem da pasta /public */}
        <img
          className="brand-icon"
          src="/icon.png"
          alt="Massoterapeuta Eliane Leandro"
        />

        <div className="brand-text">
          <div className="brand-title">MASSOTERAPEUTA</div>
          <div className="brand-subtitle">Eliane Leandro</div>
        </div>
      </div>

      {right && <div className="actions-row">{right}</div>}
    </header>
  );
}
