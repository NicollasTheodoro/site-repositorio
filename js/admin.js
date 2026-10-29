/* Painel admin: edita data/dados.json (e envia imagens/PDFs) direto no repositório via API do GitHub. */
(() => {
  const C = window.SITE_CONFIG;
  const API = "https://api.github.com";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  try { document.documentElement.dataset.theme = localStorage.getItem("tema") || "dark"; } catch (e) { }

  const state = { token: null, data: null, sha: null, dirty: false, tab: "perfil", pending: new Map() };
  const previews = new Map(); // caminho -> blob URL (pré-visualização local)
  const TOKEN_KEY = "admin_token";

  /* ---------- Utilidades ---------- */
  function toast(msg, erro) {
    const t = document.createElement("div");
    t.className = "toast" + (erro ? " err" : "");
    t.textContent = msg;
    $("#toasts").appendChild(t);
    setTimeout(() => t.remove(), erro ? 7000 : 4500);
  }
  const getPath = (o, p) => p.split(".").reduce((a, k) => a?.[k], o);
  const setPath = (o, p, v) => { const ks = p.split("."), last = ks.pop(); ks.reduce((a, k) => (a[k] ??= {}), o)[last] = v; };
  const novoId = (pre) => `${pre}-${Date.now().toString(36)}${Math.floor(Math.random() * 99)}`;
  const isImg = (u) => /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(u || "");

  const utf8ToB64 = (s) => {
    const b = new TextEncoder().encode(s); let bin = "";
    for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  const b64ToUtf8 = (b) => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\s/g, "")), (c) => c.charCodeAt(0)));
  const blobToB64 = (blob) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.onerror = rej; fr.readAsDataURL(blob); });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- API do GitHub ---------- */
  async function gh(path, opts = {}) {
    const r = await fetch(API + path, {
      cache: "no-store",
      ...opts,
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: "Bearer " + state.token,
        ...(opts.body ? { "Content-Type": "application/json" } : {})
      }
    });
    let body = null; try { body = await r.json(); } catch (e) { }
    if (!r.ok) { const err = new Error(body?.message || "Erro HTTP " + r.status); err.status = r.status; throw err; }
    return body;
  }
  const repoPath = `/repos/${C.owner}/${C.repo}`;
  const contentsUrl = (p) => `${repoPath}/contents/${p.split("/").map(encodeURIComponent).join("/")}`;
  const putFile = (path, b64, message, sha) =>
    gh(contentsUrl(path), { method: "PUT", body: JSON.stringify({ message, content: b64, branch: C.branch, ...(sha ? { sha } : {}) }) });

  async function carregarDados() {
    const f = await gh(`${contentsUrl(C.dataPath)}?ref=${encodeURIComponent(C.branch)}`);
    state.sha = f.sha;
    const d = JSON.parse(b64ToUtf8(f.content));
    d.perfil ||= {}; d.contato ||= {}; d.redes ||= {};
    ["sobre", "hardSkills", "softSkills", "experiencias", "formacoes", "certificados", "projetos"].forEach((k) => { if (!Array.isArray(d[k])) d[k] = []; });
    state.data = d;
  }

  async function entrar(token) {
    state.token = token;
    const u = await gh("/user");
    if (u.login.toLowerCase() !== C.owner.toLowerCase()) throw new Error(`Este token pertence à conta "${u.login}", e não a "${C.owner}".`);
    let repo;
    try { repo = await gh(repoPath); } catch (e) { if (e.status === 404) throw new Error("O token não enxerga o repositório " + C.repo + ". Confira o 'Repository access'."); throw e; }
    if (!repo.permissions?.push) throw new Error("O token não tem permissão de escrita. Ative 'Contents: Read and write'.");
    await carregarDados();
  }

  /* ---------- Esquemas ---------- */
  const STATUS = [["concluido", "Concluído"], ["cursando", "Cursando"]];
  const LISTAS = {
    experiencias: {
      label: "Experiências", singular: "experiência", prefix: "exp",
      titulo: (i) => i.titulo, sub: (i) => [i.organizacao, i.periodo].filter(Boolean).join(" · "),
      campos: [
        { k: "titulo", label: "Título / cargo", type: "text", req: 1, full: 1 },
        { k: "organizacao", label: "Empresa / organização", type: "text" },
        { k: "periodo", label: "Período", type: "text", hint: "Ex.: 03/2025 – atual" },
        { k: "descricao", label: "Descrição", type: "textarea", full: 1 }
      ]
    },
    formacoes: {
      label: "Formações", singular: "formação", prefix: "for",
      titulo: (i) => i.titulo, sub: (i) => [i.status === "cursando" ? "Cursando" : "Concluído", i.instituicao, i.periodo].filter(Boolean).join(" · "),
      campos: [
        { k: "titulo", label: "Curso / formação", type: "text", req: 1, full: 1 },
        { k: "instituicao", label: "Instituição", type: "text" },
        { k: "status", label: "Situação", type: "select", options: STATUS },
        { k: "periodo", label: "Período", type: "text", full: 1, hint: "Ex.: 10/05/2024 à 24/05/2025" },
        { k: "descricao", label: "Descrição (opcional)", type: "textarea", full: 1 },
        { k: "certificado", label: "Certificado (opcional)", type: "file", full: 1, hint: "cole um link ou envie PDF/imagem" }
      ],
      novo: () => ({ status: "concluido" })
    },
    certificados: {
      label: "Certificados", singular: "certificado", prefix: "cer",
      titulo: (i) => i.titulo, sub: (i) => [i.instituicao, i.data].filter(Boolean).join(" · "),
      thumb: (i) => (isImg(i.arquivo) || previews.has(i.arquivo) ? i.arquivo : ""),
      campos: [
        { k: "titulo", label: "Nome do certificado", type: "text", req: 1, full: 1 },
        { k: "instituicao", label: "Instituição emissora", type: "text" },
        { k: "data", label: "Data / ano", type: "text" },
        { k: "arquivo", label: "Arquivo do certificado", type: "file", full: 1, hint: "cole um link ou envie PDF/imagem" }
      ]
    },
    projetos: {
      label: "Projetos", singular: "projeto", prefix: "prj",
      titulo: (i) => i.titulo, sub: (i) => i.tecnologias,
      thumb: (i) => i.imagem,
      campos: [
        { k: "titulo", label: "Nome do projeto", type: "text", req: 1, full: 1 },
        { k: "descricao", label: "Descrição", type: "textarea", full: 1 },
        { k: "imagem", label: "Imagem do projeto", type: "image", full: 1 },
        { k: "tecnologias", label: "Tecnologias", type: "text", full: 1, hint: "separe por vírgula. Ex.: Python, Flask" },
        { k: "link", label: "Link do código (GitHub)", type: "url" },
        { k: "demo", label: "Link online (opcional)", type: "url" }
      ]
    }
  };

  const SINGLES = {
    perfil: {
      label: "Perfil", desc: "Informações que aparecem no topo do site.",
      grupos: [{
        campos: [
          { p: "perfil.nome", label: "Nome", type: "text" },
          { p: "perfil.nomeCompleto", label: "Nome completo (rodapé)", type: "text" },
          { p: "perfil.cargo", label: "Cargo / título", type: "text", full: 1 },
          { p: "perfil.saudacao", label: "Saudação", type: "text", full: 1 },
          { p: "perfil.resumo", label: "Resumo", type: "textarea", full: 1, rows: 5 },
          { p: "perfil.foto", label: "Foto", type: "image", full: 1, hint: "opcional. Sem foto, o topo mostra um cartão de código" },
          { p: "perfil.curriculo", label: "Currículo (PDF)", type: "file", full: 1, hint: "usado no botão 'Baixar currículo'" }
        ]
      }]
    },
    sobre: {
      label: "Sobre mim", desc: "Separe os parágrafos com uma linha em branco.",
      grupos: [{ campos: [{ p: "sobre", label: "Texto", type: "paragraphs", full: 1, rows: 16 }] }]
    },
    skills: {
      label: "Skills", desc: "Uma habilidade por linha.",
      grupos: [{ campos: [
        { p: "hardSkills", label: "Hard skills", type: "lines", rows: 10 },
        { p: "softSkills", label: "Soft skills", type: "lines", rows: 10 }
      ] }]
    },
    contato: {
      label: "Contato e redes", desc: "Seção final do site e rodapé.",
      grupos: [
        { titulo: "Seção “Vamos conversar”", campos: [
          { p: "contato.titulo", label: "Título", type: "text", full: 1 },
          { p: "contato.subtitulo", label: "Subtítulo", type: "text", full: 1 },
          { p: "contato.texto", label: "Texto", type: "textarea", full: 1 },
          { p: "contato.whatsapp", label: "WhatsApp", type: "text", hint: "DDI+DDD+número, só dígitos" },
          { p: "contato.email", label: "E-mail", type: "email" },
          { p: "contato.mensagem", label: "Mensagem inicial do WhatsApp", type: "text", full: 1 }
        ] },
        { titulo: "Redes sociais", campos: [
          { p: "redes.github", label: "GitHub", type: "url" },
          { p: "redes.linkedin", label: "LinkedIn", type: "url" },
          { p: "redes.instagram", label: "Instagram", type: "url" }
        ] }
      ]
    }
  };
  const ORDEM = ["perfil", "sobre", "skills", "experiencias", "formacoes", "certificados", "projetos", "contato"];

  /* ---------- Upload / processamento de arquivos ---------- */
  const PERMITIDOS = ["pdf", "png", "jpg", "jpeg", "gif", "webp"];
  async function processarArquivo(file) {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!PERMITIDOS.includes(ext)) throw new Error("Formato não suportado. Use PDF, PNG, JPG, GIF ou WEBP.");
    const slug = file.name.replace(/\.[^.]+$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "arquivo";
    const ts = Date.now();
    let blob = file, finalExt = ext;
    if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
      const bmp = await createImageBitmap(file);
      const fator = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(bmp.width * fator); cv.height = Math.round(bmp.height * fator);
      cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
      const png = ext === "png";
      blob = await new Promise((r) => cv.toBlob(r, png ? "image/png" : "image/jpeg", 0.88));
      finalExt = png ? "png" : "jpg";
    } else if (file.size > 8 * 1024 * 1024) throw new Error("Arquivo muito grande (máximo 8 MB).");
    const pasta = finalExt === "pdf" ? "arquivos/uploads" : "imagens/uploads";
    return { path: `${pasta}/${slug}-${ts}.${finalExt}`, blob };
  }

  /* ---------- Campos de formulário ---------- */
  function criarCampo(c, valor, onChange = () => { }) {
    const wrap = document.createElement("div");
    wrap.className = "field" + (c.full ? " full" : "");
    const id = "f_" + Math.random().toString(36).slice(2);
    wrap.innerHTML = `<label class="f" for="${id}">${esc(c.label)}${c.hint ? ` <span class="hint">· ${esc(c.hint)}</span>` : ""}</label>`;
    let el, get;
    const t = c.type;
    if (t === "textarea" || t === "paragraphs" || t === "lines") {
      el = document.createElement("textarea");
      if (c.rows) el.rows = c.rows;
      el.value = t === "paragraphs" ? (valor || []).join("\n\n") : t === "lines" ? (valor || []).join("\n") : (valor ?? "");
      get = () => t === "paragraphs" ? el.value.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
        : t === "lines" ? el.value.split("\n").map((s) => s.trim()).filter(Boolean) : el.value.trim();
      el.id = id; wrap.appendChild(el);
    } else if (t === "select") {
      el = document.createElement("select");
      el.innerHTML = c.options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("");
      el.value = valor || c.options[0][0];
      get = () => el.value;
      el.id = id; wrap.appendChild(el);
    } else if (t === "image" || t === "file") {
      const row = document.createElement("div"); row.className = "upload-row";
      el = document.createElement("input"); el.type = "text"; el.id = id; el.value = valor ?? ""; el.placeholder = "Link ou envie um arquivo →";
      const file = document.createElement("input"); file.type = "file"; file.accept = t === "image" ? "image/*" : ".pdf,image/*";
      const btn = document.createElement("button"); btn.type = "button"; btn.className = "btn btn-sm"; btn.textContent = "Enviar arquivo";
      btn.onclick = () => file.click();
      row.append(el, btn, file); wrap.appendChild(row);
      const img = document.createElement("img"); img.className = "preview"; img.hidden = true; wrap.appendChild(img);
      const note = document.createElement("div"); note.className = "pending-note"; note.hidden = true; note.textContent = "Arquivo será enviado ao clicar em “Publicar alterações”."; wrap.appendChild(note);
      const atualizar = () => {
        const v = el.value.trim();
        const src = previews.get(v) || v;
        img.hidden = !(previews.has(v) ? /\.(png|jpe?g|gif|webp)$/i.test(v) : isImg(v));
        if (!img.hidden) img.src = src;
        note.hidden = !state.pending.has(v);
      };
      file.onchange = async () => {
        const f = file.files[0]; if (!f) return;
        try {
          btn.disabled = true; btn.textContent = "Processando…";
          const { path, blob } = await processarArquivo(f);
          state.pending.set(path, { blob });
          previews.set(path, URL.createObjectURL(blob));
          el.value = path; atualizar(); onChange(path);
        } catch (e) { toast(e.message, true); } finally { btn.disabled = false; btn.textContent = "Enviar arquivo"; file.value = ""; }
      };
      el.addEventListener("input", atualizar);
      get = () => el.value.trim();
      atualizar();
      el.addEventListener("input", () => onChange(get()));
      wrap.get = get; return wrap;
    } else {
      el = document.createElement("input");
      el.type = t === "url" ? "url" : t === "email" ? "email" : "text";
      el.value = valor ?? ""; get = () => el.value.trim();
      el.id = id; wrap.appendChild(el);
    }
    if (c.req) el.required = true;
    el.addEventListener("input", () => onChange(get()));
    wrap.get = get;
    return wrap;
  }

  /* ---------- Estado sujo / status ---------- */
  function marcarSujo() {
    state.dirty = true; atualizarStatus();
  }
  function atualizarStatus() {
    const s = $("#status");
    s.textContent = state.dirty ? "Alterações não publicadas" : "Tudo publicado";
    s.classList.toggle("dirty", state.dirty);
    $("#publicarBtn").disabled = !state.dirty;
    renderSide();
  }
  window.addEventListener("beforeunload", (e) => { if (state.dirty) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------- Render do painel ---------- */
  function renderSide() {
    $("#side").innerHTML = ORDEM.map((id) => {
      const nome = SINGLES[id]?.label || LISTAS[id].label;
      const n = LISTAS[id] ? `<span class="count">${state.data[id].length}</span>` : "";
      return `<button data-tab="${id}" class="${id === state.tab ? "active" : ""}">${esc(nome)}${n}</button>`;
    }).join("");
  }

  function renderPainel() {
    renderSide();
    SINGLES[state.tab] ? renderSingle(state.tab) : renderLista(state.tab);
  }

  function renderSingle(id) {
    const def = SINGLES[id], panel = $("#panel");
    panel.innerHTML = `<div class="panel-head"><h2>${esc(def.label)}</h2><p>${esc(def.desc)}</p></div>`;
    def.grupos.forEach((g) => {
      if (g.titulo) panel.insertAdjacentHTML("beforeend", `<div class="sec-title">${esc(g.titulo)}</div>`);
      const grid = document.createElement("div"); grid.className = "form-grid";
      g.campos.forEach((c) => grid.appendChild(criarCampo(c, getPath(state.data, c.p), (v) => { setPath(state.data, c.p, v); marcarSujo(); })));
      panel.appendChild(grid);
    });
  }

  function renderLista(key) {
    const def = LISTAS[key], itens = state.data[key], panel = $("#panel");
    panel.innerHTML = `
      <div class="panel-head"><h2>${esc(def.label)}</h2><button class="btn btn-primary btn-sm" data-act="novo">+ Adicionar ${esc(def.singular)}</button></div>
      <div class="items">${itens.length ? itens.map((it, i) => {
        const th = def.thumb ? def.thumb(it) : "";
        return `<div class="item">
          ${th ? `<img class="thumb" src="${esc(previews.get(th) || th)}" alt="">` : ""}
          <div class="info"><b>${esc(def.titulo(it) || "(sem título)")}</b><span>${esc(def.sub(it) || "")}</span></div>
          <div class="acts">
            <button class="btn btn-icon btn-sm" data-act="sobe" data-i="${i}" title="Subir" ${i === 0 ? "disabled" : ""}>↑</button>
            <button class="btn btn-icon btn-sm" data-act="desce" data-i="${i}" title="Descer" ${i === itens.length - 1 ? "disabled" : ""}>↓</button>
            <button class="btn btn-sm" data-act="edita" data-i="${i}">Editar</button>
            <button class="btn btn-sm btn-danger" data-act="apaga" data-i="${i}">Excluir</button>
          </div></div>`;
      }).join("") : `<div class="empty">Nenhum item ainda. Clique em “Adicionar ${esc(def.singular)}”.</div>`}</div>`;
  }

  $("#panel").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const key = state.tab, arr = state.data[key], i = Number(b.dataset.i);
    switch (b.dataset.act) {
      case "novo": abrirModal(key, null); break;
      case "edita": abrirModal(key, i); break;
      case "sobe": [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; marcarSujo(); renderLista(key); break;
      case "desce": [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; marcarSujo(); renderLista(key); break;
      case "apaga":
        if (confirm(`Excluir “${LISTAS[key].titulo(arr[i]) || "este item"}”?`)) { arr.splice(i, 1); marcarSujo(); renderLista(key); }
        break;
    }
  });
  $("#side").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]"); if (!b) return;
    state.tab = b.dataset.tab; renderPainel();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Modal ---------- */
  const modal = $("#modal");
  let salvarModal = null;
  function abrirModal(key, idx) {
    const def = LISTAS[key];
    const item = idx == null ? { ...(def.novo?.() || {}) } : state.data[key][idx];
    $("#modalTitulo").textContent = (idx == null ? "Adicionar " : "Editar ") + def.singular;
    const grid = document.createElement("div"); grid.className = "form-grid";
    const campos = def.campos.map((c) => { const f = criarCampo(c, item[c.k]); grid.appendChild(f); return [c, f]; });
    $("#modalCorpo").replaceChildren(grid);
    salvarModal = () => {
      const novo = idx == null ? { id: novoId(def.prefix) } : state.data[key][idx];
      campos.forEach(([c, f]) => { novo[c.k] = f.get(); });
      if (idx == null) state.data[key].push(novo);
      marcarSujo(); renderLista(key);
    };
    modal.showModal();
  }
  $("#modalForm").addEventListener("submit", () => { salvarModal?.(); salvarModal = null; });
  $("#modalCancelar").addEventListener("click", () => { salvarModal = null; modal.close(); });

  /* ---------- Publicar ---------- */
  async function publicar() {
    const btn = $("#publicarBtn");
    btn.disabled = true; btn.textContent = "Publicando…";
    try {
      const json = JSON.stringify(state.data, null, 2) + "\n";
      // envia somente arquivos que ainda estão sendo usados
      for (const [path, f] of state.pending) {
        if (!json.includes(path)) { state.pending.delete(path); continue; }
        const b64 = await blobToB64(f.blob);
        for (let t = 0; ; t++) {
          try { await putFile(path, b64, `Admin: envia ${path}`); break; }
          catch (e) { if (e.status === 409 && t < 3) await sleep(900); else throw e; }
        }
        state.pending.delete(path);
      }
      let res;
      for (let t = 0; ; t++) {
        try { res = await putFile(C.dataPath, utf8ToB64(json), "Admin: atualiza o conteúdo do site", state.sha); break; }
        catch (e) {
          if ((e.status === 409 || e.status === 422) && t < 3) {
            const f = await gh(`${contentsUrl(C.dataPath)}?ref=${encodeURIComponent(C.branch)}`);
            state.sha = f.sha; await sleep(600);
          } else throw e;
        }
      }
      state.sha = res.content.sha;
      state.dirty = false; atualizarStatus();
      toast("Publicado! O site é atualizado em cerca de 1 minuto.");
    } catch (e) {
      console.error(e);
      toast("Falha ao publicar: " + e.message, true);
    } finally {
      btn.textContent = "Publicar alterações"; btn.disabled = !state.dirty;
    }
  }
  $("#publicarBtn").addEventListener("click", publicar);

  $("#backupBtn").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" }));
    a.download = `backup-site-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  });

  /* ---------- Login / sessão ---------- */
  function mostrarApp() {
    $("#loginView").hidden = true; $("#appView").hidden = false;
    state.tab = "perfil"; renderPainel(); atualizarStatus();
  }
  function sair() {
    if (state.dirty && !confirm("Há alterações não publicadas. Sair mesmo assim?")) return;
    state.dirty = false;
    try { localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY); } catch (e) { }
    location.reload();
  }
  $("#sairBtn").addEventListener("click", sair);

  function traduzErro(e) {
    if (e.status === 401) return "Token inválido ou expirado.";
    if (e.status === 403) return "Acesso negado pelo GitHub: " + e.message;
    if (e instanceof TypeError) return "Sem conexão com o GitHub. Verifique sua internet.";
    return e.message;
  }

  $("#loginForm").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const btn = $("#loginBtn"), erro = $("#loginErro"), token = $("#token").value.trim();
    erro.textContent = ""; btn.disabled = true; btn.textContent = "Verificando…";
    try {
      await entrar(token);
      try { ($("#lembrar").checked ? localStorage : sessionStorage).setItem(TOKEN_KEY, token); } catch (e) { }
      $("#token").value = "";
      mostrarApp();
    } catch (e) {
      state.token = null; erro.textContent = traduzErro(e);
    } finally { btn.disabled = false; btn.textContent = "Entrar"; }
  });

  (async () => {
    let salvo = null;
    try { salvo = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY); } catch (e) { }
    if (!salvo) return;
    $("#loginBtn").disabled = true; $("#loginBtn").textContent = "Entrando…";
    try { await entrar(salvo); mostrarApp(); }
    catch (e) {
      state.token = null; $("#loginErro").textContent = "Sessão anterior inválida: " + traduzErro(e);
      try { localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY); } catch (_) { }
    } finally { $("#loginBtn").disabled = false; $("#loginBtn").textContent = "Entrar"; }
  })();
})();