/* global React, Header, Hero, TrustStats, ServicesGrid, FAQ, ContactBlock, Footer */
const { useState } = React;

function App() {
  const [active, setActive] = useState("Início");
  const handleNav = (label) => {
    setActive(label);
    const id = ({
      "Início": "home",
      "Sobre nós": "sobre",
      "Serviços": "servicos",
      "Catálogo": "servicos",
      "Equipamentos": "servicos",
      "Contato": "contato"
    })[label] || "home";
    const el = document.getElementById(id);
    if (el) el.scrollIntoView ? window.scrollTo({ top: el.offsetTop - 96, behavior: "smooth" }) : null;
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Header, { active, onNav: handleNav }),
    React.createElement(Hero),
    React.createElement(TrustStats),
    React.createElement(ServicesGrid, { onSelect: (c) => console.log("Selected", c.name) }),
    React.createElement(FAQ),
    React.createElement(ContactBlock),
    React.createElement(Footer),
    React.createElement(
      "a",
      { className: "vpk-wapp", href: "https://wa.me/5511995578519", target: "_blank", rel: "noreferrer", title: "Fale conosco" },
      "💬"
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
