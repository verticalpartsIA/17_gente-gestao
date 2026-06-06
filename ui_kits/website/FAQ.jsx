/* global React, SectionHead */
const { useState } = React;

const ITEMS = [
  { q: "Quais os modelos de corrim\u00f5es vendidos na VerticalParts?", a: "Corrim\u00f5es de borracha para todas as marcas e modelos de escadas e esteiras rolantes, incluindo Otis, Schindler e Atlas. Borracha vulcanizada de alta durabilidade." },
  { q: "Qual o prazo de entrega para pe\u00e7as de escadas e esteiras rolantes?", a: "Trabalhamos com estoque para pronta entrega. Pe\u00e7as cr\u00edticas saem em 24h. Itens importados sob demanda: 30 a 60 dias." },
  { q: "Tenho uma escada rolante antiga \u2014 como melhorar o desempenho?", a: "Atrav\u00e9s do servi\u00e7o de Retrofit: revitalizamos o equipamento e modernizamos o quadro de comando, gerando economia de energia e mais seguran\u00e7a." },
  { q: "Posso aplicar a identidade da minha empresa nos corrim\u00f5es?", a: "Sim. Aplicamos sua marca atrav\u00e9s de adesivo customizado instalado no corrim\u00e3o, de forma r\u00e1pida e n\u00e3o poluente." },
  { q: "Atendem todo o Brasil?", a: "Sim. Realizamos a entrega de componentes em todo o territ\u00f3rio nacional, com transportadora pr\u00f3pria para o eixo Rio-S\u00e3o Paulo." }
];

function FAQItem({ item, isOpen, onClick }) {
  return React.createElement(
    "div",
    { className: "vpk-faq__item" + (isOpen ? " is-open" : "") },
    React.createElement(
      "button",
      { className: "vpk-faq__q", onClick },
      React.createElement("span", { className: "vpk-faq__sign" }, isOpen ? "\u2013" : "+"),
      React.createElement("span", null, item.q)
    ),
    isOpen ? React.createElement("div", { className: "vpk-faq__a" }, item.a) : null
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return React.createElement(
    "section",
    { id: "faq", className: "vpk-faq" },
    React.createElement(
      "div",
      { className: "vpk-faq__inner" },
      React.createElement(SectionHead, {
        eyebrow: "Tire suas d\u00favidas",
        title: "Perguntas frequentes",
        sub: "Respostas r\u00e1pidas sobre prazos, compatibilidade e personaliza\u00e7\u00e3o."
      }),
      React.createElement(
        "div",
        { className: "vpk-faq__list" },
        ITEMS.map((it, i) =>
          React.createElement(FAQItem, {
            key: it.q,
            item: it,
            isOpen: open === i,
            onClick: () => setOpen(open === i ? -1 : i)
          })
        )
      )
    )
  );
}

window.FAQ = FAQ;
