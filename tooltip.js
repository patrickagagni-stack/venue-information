/* tooltip.js — Instant HTML-capable speech-bubble tooltips for .ua-help elements */
(function () {
  // Inject minimal CSS
  var css = [
    ".ua-tip-bubble{position:fixed;display:none;background:#fff;color:#203040;border:1px solid rgba(32,48,64,.35);",
    "box-shadow:0 10px 24px rgba(0,0,0,.25);border-radius:8px;padding:10px 12px;min-width:260px;max-width:420px;",
    "font-size:12.5px;line-height:1.45;z-index:9999}",
    ".ua-tip-arrow{position:fixed;display:none;width:0;height:0;border-left:8px solid transparent;",
    "border-right:8px solid transparent;border-top:8px solid #fff;filter:drop-shadow(0 -1px 0 rgba(32,48,64,.35));z-index:10000}"
  ].join("");
  var style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // Shared bubble + arrow
  var bubble = document.createElement("div");
  bubble.className = "ua-tip-bubble";
  bubble.setAttribute("role", "tooltip");
  var arrow = document.createElement("div");
  arrow.className = "ua-tip-arrow";
  document.body.appendChild(bubble);
  document.body.appendChild(arrow);

  var currentAnchor = null;
  var hideTimer = null;

  function hide() {
    bubble.style.display = "none";
    arrow.style.display = "none";
    bubble.innerHTML = "";
    currentAnchor = null;
  }

  function place(anchor, text) {
    bubble.innerHTML = text || "";
    bubble.style.display = "block";
    bubble.style.width = Math.min(420, Math.max(260, 320)) + "px";
    var r = anchor.getBoundingClientRect();
    var w = parseFloat(bubble.style.width);
    var h = bubble.offsetHeight || 120;
    var margin = 10;

    // Prefer above; if not enough space, place below
    var top = r.top - h - margin;
    var below = top < 8;
    if (below) top = r.bottom + margin;

    var left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
    bubble.style.left = left + "px";
    bubble.style.top = Math.max(8, Math.min(top, window.innerHeight - h - 8)) + "px";

    // Arrow
    arrow.style.display = "block";
    var ax = r.left + r.width / 2 - 8;
    var ay = below ? (parseFloat(bubble.style.top) - 8) : (parseFloat(bubble.style.top) + h);
    if (below) {
      arrow.style.borderTop = "8px solid transparent";
      arrow.style.borderBottom = "8px solid #fff";
      arrow.style.filter = "drop-shadow(0 1px 0 rgba(32,48,64,.35))";
    } else {
      arrow.style.borderTop = "8px solid #fff";
      arrow.style.borderBottom = "8px solid transparent";
      arrow.style.filter = "drop-shadow(0 -1px 0 rgba(32,48,64,.35))";
    }
    arrow.style.left = Math.max(8, Math.min(ax, window.innerWidth - 16)) + "px";
    arrow.style.top = ay + "px";
  }

  function show(anchor) {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    var text = anchor.getAttribute("data-tip") || anchor.getAttribute("title") || "";
    if (!text) return;
    anchor.setAttribute("data-tip", text);
    anchor.removeAttribute("title");
    currentAnchor = anchor;
    place(anchor, text);
  }

  function scheduleHide() {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 120);
  }

  function attach(el) {
    if (el.tagName === "A") el.addEventListener("click", function (e) { e.preventDefault(); });
    el.addEventListener("mouseenter", function () { show(el); }, { passive: true });
    el.addEventListener("mouseleave", scheduleHide, { passive: true });
    el.addEventListener("focus", function () { show(el); });
    el.addEventListener("blur", scheduleHide);
    el.addEventListener("click", function () { show(el); });
  }

  function init() {
    var nodes = document.querySelectorAll(".ua-help");
    for (var i = 0; i < nodes.length; i++) attach(nodes[i]);
    window.addEventListener("scroll", function () { if (currentAnchor) hide(); }, { passive: true });
    window.addEventListener("resize", function () { if (currentAnchor) hide(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
