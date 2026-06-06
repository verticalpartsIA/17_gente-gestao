/* global React */

function Footer() {
  return React.createElement(
    "footer",
    { className: "vpk-footer" },
    React.createElement(
      "div",
      { className: "vpk-footer__top" },
      React.createElement(
        "div",
        { className: "vpk-footer__brand" },
        React.createElement("img", {
          src: "../../assets/logo-verticalparts-white.png",
          alt: "VerticalParts",
          className: "vpk-footer__logo",
          onError: (e) => { e.currentTarget.style.display = "none"; }
        }),
        React.createElement(
          "p",
          { className: "vpk-footer__tag" },
          "Buscamos oferecer agilidade na entrega, qualidade e pre\u00e7os competitivos atrav\u00e9s de uma equipe altamente treinada e comprometida com um \u00f3timo atendimento."
        ),
        React.createElement(
          "div",
          { className: "vpk-footer__social" },
          ["WhatsApp", "Instagram", "LinkedIn"].map((s) =>
            React.createElement("a", { key: s, href: "#" }, s)
          )
        )
      ),
      React.createElement(
        "div",
        { className: "vpk-footer__cols" },
        React.createElement(
          "div",
          { className: "vpk-footer__col" },
          React.createElement("h4", null, "Links"),
          React.createElement("ul", null,
            ["Home", "Sobre n\u00f3s", "Contato", "Loja", "Fa\u00e7a sua den\u00fancia"].map(
              (l) => React.createElement("li", { key: l }, React.createElement("a", { href: "#" }, l))
            )
          )
        ),
        React.createElement(
          "div",
          { className: "vpk-footer__col" },
          React.createElement("h4", null, "Catálogos"),
          React.createElement("ul", null,
            ["Escadas e Esteiras", "Elevadores", "Pe\u00e7as para Elevadores", "Pe\u00e7as Escada/Esteira"].map(
              (l) => React.createElement("li", { key: l }, React.createElement("a", { href: "#" }, l))
            )
          )
        ),
        React.createElement(
          "div",
          { className: "vpk-footer__col" },
          React.createElement("h4", null, "Contatos"),
          React.createElement("ul", { className: "vpk-footer__mono" },
            React.createElement("li", null, "(11) 2528-6473"),
            React.createElement("li", null, "(11) 2528-6479"),
            React.createElement("li", null, "(11) 99557-8519"),
            React.createElement("li", null, "comercial@verticalparts.com.br"),
            React.createElement("li", null, "Rua Armandina Braga de Almeida, 383")
          )
        )
      )
    ),
    React.createElement(
      "div",
      { className: "vpk-footer__bottom" },
      React.createElement("span", null, "Copyright \u00a9 2026 VerticalParts \u2014 Todos os direitos reservados."),
      React.createElement("span", { className: "vpk-footer__bottom-r" }, "Design System v0.1")
    )
  );
}

window.Footer = Footer;
