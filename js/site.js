/* Renderiza o site público a partir de data/dados.json */
(() => {
  const C = window.SITE_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return ""; // bloqueia javascript:, data:, etc.
    return u;
  };
  const isImage = (u) => /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(u || "");
  const lista = (v) => (Array.isArray(v) ? v : String(v || "").split(",")).map((x) => String(x).trim()).filter(Boolean);

  const ICON = {
    github: '<svg class="icon" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>',
    linkedin: '<svg class="icon" viewBox="0 0 16 16"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/></svg>',
    instagram: '<svg class="icon" viewBox="0 0 16 16"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/></svg>',
    mail: '<svg class="icon" viewBox="0 0 16 16"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/></svg>',
    wa: '<svg class="icon" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>',
    down: '<svg class="icon" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/></svg>',
    ext: '<svg class="icon" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/><path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/></svg>'
  };

  /* ---------- Tema ---------- */
  $("#temaBtn").addEventListener("click", () => {
    const novo = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = novo;
    try { localStorage.setItem("tema", novo); } catch (e) { }
  });

  /* ---------- Menu mobile ---------- */
  const navLinks = $("#navLinks"), menuBtn = $("#menuBtn");
  menuBtn.addEventListener("click", () => {
    const aberto = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", aberto);
  });
  navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) { navLinks.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); } });

  /* ---------- Abas genéricas ---------- */
  function montarAbas(container, abas, aoMudar) {
    container.innerHTML = abas.map((a, i) => `<button class="tab${i === 0 ? " active" : ""}" role="tab" data-k="${esc(a.k)}">${esc(a.label)}</button>`).join("");
    container.hidden = abas.length < 2;
    container.onclick = (e) => {
      const b = e.target.closest(".tab"); if (!b) return;
      $$(".tab", container).forEach((t) => t.classList.toggle("active", t === b));
      aoMudar(b.dataset.k);
    };
    if (abas.length) aoMudar(abas[0].k);
  }

  /* ---------- Render ---------- */
  function render(d) {
    const p = d.perfil || {}, ct = d.contato || {}, rd = d.redes || {};
    document.title = `${p.nome || "Currículo"} | Desenvolvedor`;
    $("#brand").innerHTML = `&lt;<span>${esc((p.nome || "nt").split(" ").map((x) => x[0]).slice(0, 2).join("").toLowerCase())}</span>/&gt;`;

    // Hero
    $("#heroSaudacao").textContent = p.saudacao || p.nome || "";
    $("#heroCargo").textContent = p.cargo || "";
    $("#heroResumo").textContent = p.resumo || "";
    const wa = ct.whatsapp ? `https://wa.me/${String(ct.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(ct.mensagem || "")}` : "";
    const curriculo = safeUrl(p.curriculo);
    $("#heroAcoes").innerHTML =
      (curriculo ? `<a class="btn btn-primary" href="${esc(curriculo)}" download="Curriculo-${esc((p.nome || "").replace(/\s+/g, "-"))}.pdf">${ICON.down} Baixar currículo</a>` : "") +
      ((d.projetos || []).length ? `<a class="btn btn-ghost" href="#meus-projetos">Ver projetos</a>` : "") +
      (wa ? `<a class="btn btn-ghost" href="${esc(wa)}" target="_blank" rel="noopener">${ICON.wa} WhatsApp</a>` : "");

    const foto = safeUrl(p.foto);
    const stack = lista(d.hardSkills).slice(0, 4).map((s) => `<span class="ts">"${esc(s)}"</span>`).join(", ");
    $("#heroVisual").innerHTML = foto
      ? `<div class="photo-frame"><img src="${esc(foto)}" alt="Foto de ${esc(p.nome)}"></div>`
      : `<div class="terminal" aria-hidden="true">
           <div class="terminal-bar"><i></i><i></i><i></i></div>
<pre><span class="tm">// perfil.js</span>
<span class="tk">const</span> <span class="tc">dev</span> = {
  nome: <span class="ts">"${esc(p.nome)}"</span>,
  stack: [${stack}],
  aberto: <span class="tk">true</span>
};</pre></div>`;

    // Sobre
    const paragrafos = Array.isArray(d.sobre) ? d.sobre : [];
    $("#sobreTexto").innerHTML = paragrafos.map((t) => `<p>${esc(t)}</p>`).join("");
    const stats = [
      [(d.projetos || []).length, "projetos publicados"],
      [(d.formacoes || []).length, "formações e cursos"],
      [lista(d.hardSkills).length, "tecnologias no radar"]
    ].filter(([n]) => n > 0);
    $("#stats").innerHTML = stats.map(([n, t]) => `<div class="card stat"><b>${n}</b><span>${t}</span></div>`).join("");
    $("#sobre-mim").hidden = !paragrafos.length;

    // Skills
    const abasSkills = [];
    if (lista(d.hardSkills).length) abasSkills.push({ k: "h", label: "Hard skills" });
    if (lista(d.softSkills).length) abasSkills.push({ k: "s", label: "Soft skills" });
    $("#skills").hidden = !abasSkills.length;
    montarAbas($("#skillsTabs"), abasSkills, (k) => {
      $("#skillsChips").innerHTML = lista(k === "h" ? d.hardSkills : d.softSkills).map((s) => `<span class="chip">${esc(s)}</span>`).join("");
    });

    // Experiências
    const exps = d.experiencias || [];
    $("#experiencias").hidden = !exps.length;
    $("#listaExperiencias").innerHTML = exps.map((x) => `
      <article class="tl-item"><div class="card">
        <h3>${esc(x.titulo)}</h3>
        <div class="meta">${[x.organizacao, x.periodo].filter(Boolean).map(esc).join(" · ")}</div>
        ${x.descricao ? `<p>${esc(x.descricao)}</p>` : ""}
      </div></article>`).join("");

    // Formações
    const forms = d.formacoes || [];
    const cardFormacao = (f) => {
      const cert = safeUrl(f.certificado);
      return `<article class="card">
        <span class="badge ${f.status === "cursando" ? "run" : "ok"}">${f.status === "cursando" ? "Cursando" : "Concluído"}</span>
        <h3>${esc(f.titulo)}</h3>
        <div class="meta">${[f.instituicao, f.periodo].filter(Boolean).map(esc).join(" · ")}</div>
        ${f.descricao ? `<p>${esc(f.descricao)}</p>` : ""}
        ${cert ? `<div class="card-actions"><a class="btn btn-sm" href="${esc(cert)}" target="_blank" rel="noopener">Ver certificado ${ICON.ext}</a></div>` : ""}
      </article>`;
    };
    const abasForm = [];
    if (forms.some((f) => f.status !== "cursando")) abasForm.push({ k: "concluido", label: "Concluídos" });
    if (forms.some((f) => f.status === "cursando")) abasForm.push({ k: "cursando", label: "Cursando" });
    $("#formacoes").hidden = !abasForm.length;
    montarAbas($("#formacoesTabs"), abasForm, (k) => {
      $("#listaFormacoes").innerHTML = forms.filter((f) => (f.status === "cursando") === (k === "cursando")).map(cardFormacao).join("");
    });

    // Certificados
    const certs = d.certificados || [];
    $("#certificados").hidden = !certs.length;
    $("#listaCertificados").innerHTML = certs.map((c) => {
      const url = safeUrl(c.arquivo);
      const thumb = url && isImage(url) ? `<img class="cert-thumb" src="${esc(url)}" alt="" loading="lazy">` : `<div class="cert-doc" aria-hidden="true">🎓</div>`;
      return `<article class="card">${thumb}
        <h3>${esc(c.titulo)}</h3>
        <div class="meta">${[c.instituicao, c.data].filter(Boolean).map(esc).join(" · ")}</div>
        ${url ? `<div class="card-actions"><a class="btn btn-sm" href="${esc(url)}" target="_blank" rel="noopener">Ver certificado ${ICON.ext}</a></div>` : ""}
      </article>`;
    }).join("");

    // Projetos
    const projs = d.projetos || [];
    $("#meus-projetos").hidden = !projs.length;
    $("#listaProjetos").innerHTML = projs.map((j) => {
      const img = safeUrl(j.imagem), link = safeUrl(j.link), demo = safeUrl(j.demo);
      return `<article class="card projeto">
        ${img ? `<div class="projeto-media"><img class="projeto-img" src="${esc(img)}" alt="Imagem do projeto ${esc(j.titulo)}" loading="lazy"></div>` : ""}
        <div class="projeto-body">
          <div class="tags">${lista(j.tecnologias).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          <h3 style="margin-top:.7rem">${esc(j.titulo)}</h3>
          <p>${esc(j.descricao)}</p>
          <div class="card-actions">
            ${link ? `<a class="btn btn-sm" href="${esc(link)}" target="_blank" rel="noopener">${ICON.github} Código</a>` : ""}
            ${demo ? `<a class="btn btn-sm btn-primary" href="${esc(demo)}" target="_blank" rel="noopener">Ver online ${ICON.ext}</a>` : ""}
          </div>
        </div></article>`;
    }).join("");

    // Contato
    $("#contatoTitulo").textContent = ct.titulo || "";
    $("#contatoSub").textContent = ct.subtitulo || "";
    $("#contatoTexto").textContent = ct.texto || "";
    $("#contatoAcoes").innerHTML =
      (wa ? `<a class="btn btn-wa" href="${esc(wa)}" target="_blank" rel="noopener">${ICON.wa} Me mande uma mensagem no WhatsApp</a>` : "") +
      (ct.email ? `<a class="btn btn-ghost" href="mailto:${esc(ct.email)}">${ICON.mail} E-mail</a>` : "");
    $("#contato").hidden = !(wa || ct.email || ct.titulo);

    // Rodapé
    const redes = [
      ["instagram", "Instagram", safeUrl(rd.instagram), ICON.instagram],
      ["linkedin", "LinkedIn", safeUrl(rd.linkedin), ICON.linkedin],
      ["github", "GitHub", safeUrl(rd.github), ICON.github],
      ["mail", ct.email || "", ct.email ? "mailto:" + ct.email : "", ICON.mail]
    ].filter((r) => r[2]);
    $("#redes").innerHTML = redes.map(([, nome, url, ic]) => `<li><a href="${esc(url)}" ${url.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${ic} ${esc(nome)}</a></li>`).join("");
    $("#direitos").textContent = `© ${new Date().getFullYear()} ${p.nomeCompleto || p.nome || ""}. Todos os direitos reservados.`;

    // Esconde links do menu de seções vazias
    $$("#navLinks a").forEach((a) => { const s = document.getElementById(a.dataset.sec); a.parentElement.hidden = !!(s && s.hidden); });

    iniciarObservadores();
  }

  /* ---------- Animações e menu ativo ---------- */
  function iniciarObservadores() {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 });
    $$(".reveal").forEach((el) => io.observe(el));

    const links = new Map($$("#navLinks a").map((a) => [a.dataset.sec, a]));
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { links.forEach((l) => l.classList.remove("active")); links.get(e.target.id)?.classList.add("active"); }
    }), { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Carregar dados ---------- */
  fetch(`${C.dataPath}?v=${Date.now()}`, { cache: "no-store" })
    .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(render)
    .catch((err) => {
      console.error(err);
      $("main").insertAdjacentHTML("afterbegin", `<p class="load-error">Não foi possível carregar o conteúdo do site.<br>Se estiver abrindo o arquivo direto do disco, use o Live Server (ou outro servidor local).</p>`);
    });
})();
