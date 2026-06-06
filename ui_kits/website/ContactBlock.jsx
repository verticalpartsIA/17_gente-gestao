/* global React, Button, Eyebrow */
const { useState } = React;

function ContactBlock() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", produto: "Elevadores", msg: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return React.createElement(
    "section",
    { id: "contato", className: "vpk-contact" },
    React.createElement(
      "div",
      { className: "vpk-contact__inner" },
      React.createElement(
        "div",
        { className: "vpk-contact__left" },
        React.createElement(Eyebrow, null, "Fale conosco"),
        React.createElement("h2", { className: "vp-h2 vpk-contact__title" }, "Solicite um or\u00e7amento t\u00e9cnico"),
        React.createElement(
          "p",
          { className: "vp-body vpk-contact__sub" },
          "Entre em contato por um de nossos canais de atendimento. Resposta em at\u00e9 1 dia \u00fatil."
        ),
        React.createElement(
          "ul",
          { className: "vpk-contact__list" },
          React.createElement("li", null, React.createElement("span", { className: "vpk-contact__l-lbl" }, "TEL"), React.createElement("span", null, "(11) 2528-6473 \u00b7 (11) 2528-6479")),
          React.createElement("li", null, React.createElement("span", { className: "vpk-contact__l-lbl" }, "WAPP"), React.createElement("span", null, "(11) 99557-8519")),
          React.createElement("li", null, React.createElement("span", { className: "vpk-contact__l-lbl" }, "EMAIL"), React.createElement("span", null, "comercial@verticalparts.com.br")),
          React.createElement("li", null, React.createElement("span", { className: "vpk-contact__l-lbl" }, "END."), React.createElement("span", null, "Rua Armandina Braga de Almeida, 383 \u00b7 SP"))
        )
      ),
      React.createElement(
        "form",
        { className: "vpk-contact__form", onSubmit: (e) => { e.preventDefault(); setSent(true); } },
        React.createElement(
          "div",
          { className: "vpk-field" },
          React.createElement("label", null, "Nome"),
          React.createElement("input", { value: form.nome, onChange: set("nome"), placeholder: "Seu nome completo" })
        ),
        React.createElement(
          "div",
          { className: "vpk-field" },
          React.createElement("label", null, "Email"),
          React.createElement("input", { type: "email", value: form.email, onChange: set("email"), placeholder: "seu@email.com.br" })
        ),
        React.createElement(
          "div",
          { className: "vpk-field" },
          React.createElement("label", null, "Produto de interesse"),
          React.createElement(
            "select",
            { value: form.produto, onChange: set("produto") },
            ["Elevadores", "Escada rolante", "Esteira rolante", "Corrim\u00e3o", "Botoeiras", "Corrente de degrau", "Guia de elevadores", "Barreiras infravermelhas"].map(
              (o) => React.createElement("option", { key: o }, o)
            )
          )
        ),
        React.createElement(
          "div",
          { className: "vpk-field" },
          React.createElement("label", null, "Mensagem"),
          React.createElement("textarea", { rows: 3, value: form.msg, onChange: set("msg"), placeholder: "Descreva sua necessidade, marca e modelo do equipamento." })
        ),
        React.createElement(
          Button,
          { variant: "primary", arrow: true, type: "submit" },
          sent ? "Enviado" : "Enviar Or\u00e7amento"
        ),
        sent ? React.createElement("p", { className: "vpk-contact__sent" }, "Recebemos sua solicita\u00e7\u00e3o. Entraremos em contato em at\u00e9 1 dia \u00fatil.") : null
      )
    )
  );
}

window.ContactBlock = ContactBlock;
