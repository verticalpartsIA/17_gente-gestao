/* global React, Button, Eyebrow */

function Hero() {
  return React.createElement(
    "section",
    { id: "home", className: "vpk-hero" },
    React.createElement("div", { className: "vpk-hero__bg" }),
    React.createElement(
      "div",
      { className: "vpk-hero__inner" },
      React.createElement(
        "div",
        { className: "vpk-hero__copy" },
        React.createElement(Eyebrow, { light: true }, "Vertical Parts \u00b7 desde 2014"),
        React.createElement(
          "h1",
          { className: "vp-display vpk-hero__title" },
          "Mobilidade vertical, ",
          React.createElement("span", { className: "vpk-hero__accent" }, "pronta entrega.")
        ),
        React.createElement(
          "p",
          { className: "vp-body vpk-hero__sub" },
          "Soluções personalizadas em transporte de passageiros \u2014 elevadores, escadas e esteiras rolantes. Mais de 4 mil pe\u00e7as catalogadas e equipe t\u00e9cnica em todo o Brasil."
        ),
        React.createElement(
          "div",
          { className: "vpk-hero__ctas" },
          React.createElement(Button, { variant: "primary", arrow: true, onClick: () => location.hash = "#servicos" }, "Ver Servi\u00e7os"),
          React.createElement(Button, { variant: "outline-light", onClick: () => location.hash = "#sobre" }, "Saiba Mais")
        )
      ),
      React.createElement(
        "div",
        { className: "vpk-hero__art" },
        React.createElement(
          "div",
          { className: "vpk-hero__photo" },
          React.createElement("div", { className: "vpk-hero__photo-label" }, "Escada rolante \u00b7 Aeroporto de Bras\u00edlia"),
          React.createElement("img", { src: "../../assets/selo-vertical.png", alt: "Selo Vertical", className: "vpk-hero__selo", onError: (e) => e.currentTarget.style.display = "none" })
        )
      )
    )
  );
}

window.Hero = Hero;
