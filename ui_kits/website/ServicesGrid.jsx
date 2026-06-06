/* global React, Button, SectionHead */

const CATEGORIES = [
  { name: "Elevadores", desc: "Tecnologia avan\u00e7ada, efici\u00eancia econ\u00f4mica e m\u00e1xima seguran\u00e7a em transporte vertical.", sku: "VP-ELV", tag: "Equipamento" },
  { name: "Escadas rolantes", desc: "Qualidade, robustez e seguran\u00e7a com prazos de entrega r\u00e1pidos e pre\u00e7os competitivos.", sku: "VP-ESC", tag: "Equipamento" },
  { name: "Esteiras rolantes", desc: "Inova\u00e7\u00e3o cont\u00ednua para m\u00e1xima economia e seguran\u00e7a em qualquer ambiente comercial.", sku: "VP-EST", tag: "Equipamento" },
  { name: "Corrim\u00f5es", desc: "Borracha vulcanizada de alta durabilidade. Aplicamos a identidade da sua empresa.", sku: "VP-COR", tag: "Pe\u00e7a" },
  { name: "Botoeiras", desc: "Alta durabilidade e design moderno. Combinam estilo, resist\u00eancia e seguran\u00e7a.", sku: "VP-BOT", tag: "Pe\u00e7a" },
  { name: "Corrente de degraus / pallet", desc: "Produzida por fabricantes internacionais. Atende aos rigorosos padr\u00f5es de certifica\u00e7\u00e3o.", sku: "VP-CDP", tag: "Pe\u00e7a" },
  { name: "Guia de elevadores", desc: "A\u00e7o de primeira linha. Abrangem as principais medidas do mercado brasileiro.", sku: "VP-GUI", tag: "Pe\u00e7a" },
  { name: "Barreiras infravermelhas", desc: "Sensores de seguran\u00e7a altamente eficientes para portas de elevador.", sku: "VP-INF", tag: "Pe\u00e7a" },
  { name: "Quadro de Comando Monarch", desc: "Quadros de comando para todos os modelos e tipos de elevadores em opera\u00e7\u00e3o.", sku: "VP-QCM", tag: "Sistema" }
];

function CategoryCard({ c, onClick }) {
  return React.createElement(
    "article",
    { className: "vpk-cat", onClick },
    React.createElement(
      "div",
      { className: "vpk-cat__media" },
      React.createElement("div", { className: "vpk-cat__media-label" }, c.name.toUpperCase()),
      React.createElement("div", { className: "vpk-cat__media-overlay" })
    ),
    React.createElement(
      "div",
      { className: "vpk-cat__body" },
      React.createElement("span", { className: "vpk-cat__stripe" }),
      React.createElement(
        "div",
        { className: "vpk-cat__meta" },
        React.createElement("span", { className: "vpk-cat__eyebrow" }, "Cat\u00e1logo \u00b7 ", c.tag),
        React.createElement("span", { className: "vpk-cat__sku" }, c.sku)
      ),
      React.createElement("h3", { className: "vp-h3 vpk-cat__title" }, c.name),
      React.createElement("p", { className: "vpk-cat__desc" }, c.desc),
      React.createElement(
        "div",
        { className: "vpk-cat__foot" },
        React.createElement("span", { className: "vpk-cat__more" }, "Saiba mais"),
        React.createElement("span", { className: "vpk-cat__arrow" }, "\u2192")
      )
    )
  );
}

function ServicesGrid({ onSelect }) {
  return React.createElement(
    "section",
    { id: "servicos", className: "vpk-services" },
    React.createElement(
      "div",
      { className: "vpk-services__inner" },
      React.createElement(SectionHead, {
        eyebrow: "Cat\u00e1logo completo",
        title: "Conhe\u00e7a nossos servi\u00e7os e produtos",
        sub: "9 categorias cobrindo equipamentos, pe\u00e7as de reposi\u00e7\u00e3o e sistemas de comando. Todas as marcas, com estoque local em S\u00e3o Paulo."
      }),
      React.createElement(
        "div",
        { className: "vpk-services__grid" },
        CATEGORIES.map((c) => React.createElement(CategoryCard, { key: c.name, c, onClick: () => onSelect && onSelect(c) }))
      )
    )
  );
}

window.ServicesGrid = ServicesGrid;
window.CATEGORIES = CATEGORIES;
