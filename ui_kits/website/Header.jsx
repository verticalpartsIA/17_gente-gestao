/* global React, Button */
const { useState } = React;

function TopStrip() {
  return React.createElement(
    "div",
    { className: "vpk-topstrip" },
    React.createElement(
      "div",
      { className: "vpk-topstrip__inner" },
      React.createElement("span", null, "📞 (11) 2528-6473"),
      React.createElement("span", null, "comercial@verticalparts.com.br"),
      React.createElement(
        "div",
        { className: "vpk-topstrip__social" },
        React.createElement("a", { href: "#" }, "WhatsApp"),
        React.createElement("a", { href: "#" }, "Instagram"),
        React.createElement("a", { href: "#" }, "LinkedIn")
      )
    )
  );
}

const NAV = [
  { label: "Início", href: "#home" },
  { label: "Sobre nós", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "Catálogo", href: "#catalogo", sub: ["Escadas e Esteiras", "Elevadores", "Peças para Elevadores"] },
  { label: "Equipamentos", href: "#equip", sub: ["Escada rolante", "Esteiras rolantes", "Elevadores"] },
  { label: "Contato", href: "#contato" }
];

function Header({ active, onNav }) {
  const [open, setOpen] = useState(null);
  return React.createElement(
    "header",
    { className: "vpk-header" },
    React.createElement(TopStrip),
    React.createElement(
      "nav",
      { className: "vpk-nav" },
      React.createElement(
        "a",
        { href: "#home", className: "vpk-nav__brand", onClick: (e) => { e.preventDefault(); onNav("home"); } },
        React.createElement("img", {
          src: "../../assets/logo-verticalparts-white.png",
          alt: "Vertical Parts",
          className: "vpk-nav__logo"
        })
      ),
      React.createElement(
        "ul",
        { className: "vpk-nav__links" },
        NAV.map((item, i) =>
          React.createElement(
            "li",
            {
              key: item.label,
              className: "vpk-nav__item" + (active === item.label ? " is-active" : ""),
              onMouseEnter: () => item.sub && setOpen(i),
              onMouseLeave: () => setOpen(null)
            },
            React.createElement(
              "a",
              { href: item.href, onClick: (e) => { e.preventDefault(); onNav(item.label); } },
              item.label,
              item.sub ? React.createElement("span", { className: "vpk-nav__chev" }, " ▾") : null
            ),
            item.sub && open === i
              ? React.createElement(
                  "ul",
                  { className: "vpk-nav__sub" },
                  item.sub.map((s) => React.createElement("li", { key: s }, React.createElement("a", { href: "#" }, s)))
                )
              : null
          )
        )
      ),
      React.createElement(
        Button,
        { variant: "primary", size: "sm", as: "a", href: "https://lojaverticalparts.com", arrow: true, target: "_blank", rel: "noreferrer" },
        "Ir para a Loja"
      )
    )
  );
}

window.Header = Header;
