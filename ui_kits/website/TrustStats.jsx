/* global React */

const STATS = [
  { n: "+11", lbl: "anos de experi\u00eancia" },
  { n: "+4 mil", lbl: "pe\u00e7as a pronta entrega" },
  { n: "+800", lbl: "clientes atendidos" },
  { n: "27", lbl: "estados com cobertura" }
];

function TrustStats() {
  return React.createElement(
    "section",
    { className: "vpk-stats" },
    React.createElement(
      "div",
      { className: "vpk-stats__inner" },
      STATS.map((s, i) =>
        React.createElement(
          "div",
          { key: s.lbl, className: "vpk-stat" },
          React.createElement("div", { className: "vpk-stat__n" }, s.n),
          React.createElement("div", { className: "vpk-stat__l" }, s.lbl)
        )
      )
    )
  );
}

window.TrustStats = TrustStats;
