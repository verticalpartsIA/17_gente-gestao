/* global React */
const { useState } = React;

/* ============================================================
   primitives.jsx — shared atoms used across the kit.
   Loaded BEFORE other component scripts.
   ============================================================ */

function Button({ variant = "primary", size = "md", as = "button", children, arrow, ...rest }) {
  const cls = ["vpk-btn", `vpk-btn--${variant}`, size === "sm" ? "vpk-btn--sm" : ""].join(" ");
  const Tag = as;
  return React.createElement(
    Tag,
    { className: cls, ...rest },
    children,
    arrow ? React.createElement("span", { className: "vpk-btn__arrow" }, " →") : null
  );
}

function Eyebrow({ children, light = false }) {
  return React.createElement(
    "div",
    { className: "vpk-eyebrow" + (light ? " vpk-eyebrow--light" : "") },
    React.createElement("span", { className: "vpk-rule" }),
    React.createElement("span", null, children)
  );
}

function SectionHead({ eyebrow, title, sub, light = false }) {
  return React.createElement(
    "header",
    { className: "vpk-sect-head" + (light ? " vpk-sect-head--light" : "") },
    eyebrow && React.createElement(Eyebrow, { light }, eyebrow),
    React.createElement("h2", { className: "vp-h2 vpk-sect-title" }, title),
    sub && React.createElement("p", { className: "vp-body vpk-sect-sub" }, sub)
  );
}

window.Button = Button;
window.Eyebrow = Eyebrow;
window.SectionHead = SectionHead;
