/* FleetOps PCM — interface demonstrativa.
 * Os registros são armazenados no navegador (localStorage).
 * Para produção multiusuário, substitua o armazenamento local por uma API segura.
 */
"use strict";

const STORAGE_KEY = "fleetops-pcm-v1";
const BRANDING_KEY = "fleetops-pcm-branding-v1";
const MAX_BRANDING_FILE_SIZE = 2 * 1024 * 1024;

const modules = [
  { id: "frotas", title: "Cadastro de Frotas", icon: "🚚", description: "Cadastro mestre dos veículos e equipamentos.", fields: [
    ["codigo","Código da frota","text",true],["tipo","Tipo de frota","config:tipos",true],["veiculo","Veículo / equipamento","text",true],["modelo","Modelo","text",false],["placa","Placa","text",false],["serie","Número de série","text",false],["locadora","Locadora","config:fornecedores",false],["fornecedor","Fornecedor","config:fornecedores",false],["status","Status","select:Ativa|Inativa",true],["observacoes","Observações","textarea",false]
  ]},
  { id: "ra", title: "Acompanhamento de RA", icon: "📋", description: "Controle de registros, responsáveis e andamento.", fields: [
    ["frotaId","Frota","fleet",true],["numero","Número da RA","text",true],["descricao","Descrição","text",true],["responsavel","Responsável","config:pessoas",true],["status","Status","config:statusRA",true],["dataAbertura","Data de abertura","date",true],["pendencias","Pendências / observações","textarea",false]
  ]},
  { id: "km-onibus", title: "KM de Ônibus", icon: "🚌", description: "Histórico de quilometragem dos ônibus.", fields: [
    ["frotaId","Frota","fleet",true],["dataLeitura","Data da leitura","date",true],["quilometragem","Quilometragem (km)","number",true],["responsavel","Responsável","config:pessoas",true],["pendencias","Observações / pendências","textarea",false]
  ]},
  { id: "atividades", title: "Atividades do Time de PCM", icon: "🧭", description: "Atribuição e acompanhamento das atividades.", fields: [
    ["frotaId","Frota","fleet",true],["os","Ordem de serviço relacionada","text",false],["descricao","Descrição da atividade","text",true],["responsavel","Responsável","config:pessoas",true],["status","Status","config:statusAtividade",true],["prazo","Prazo","date",false],["pendencias","Observações / pendências","textarea",false]
  ]},
  { id: "pecas", title: "Status das Peças", icon: "⚙️", description: "Solicitações, fornecedores e previsão de chegada.", fields: [
    ["frotaId","Frota","fleet",true],["codigoPeca","Código / pedido","text",true],["peca","Peça / descrição","text",true],["responsavel","Responsável","config:pessoas",true],["status","Status","config:statusPecas",true],["dataAbertura","Data de abertura","date",false],["quantidade","Quantidade","number",true],["fornecedor","Fornecedor","config:fornecedores",false],["previsao","Previsão de chegada","date",false],["osRelacionadas","OS relacionadas","text",false],["pendencias","Observações / pendências","textarea",false]
  ]},
  { id: "paradas", title: "Frotas Paradas", icon: "🛑", description: "Disponibilidade e previsão de liberação.", fields: [
    ["frotaId","Frota","fleet",true],["os","Ordem de serviço","text",false],["motivo","Motivo da parada","text",true],["responsavel","Responsável","config:pessoas",true],["status","Status","config:statusParada",true],["dataParada","Data da parada","date",true],["previsao","Previsão de liberação","date",false],["dataLiberacao","Data de liberação","date",false],["pendencias","Observações / pendências","textarea",false]
  ]},
  { id: "horimetro", title: "Horímetro Frota AC", icon: "⏱️", description: "Leituras de horímetro dos equipamentos.", fields: [
    ["frotaId","Frota","fleet",true],["dataLeitura","Data da leitura","date",true],["horimetro","Horímetro (h)","number",true],["responsavel","Responsável","config:pessoas",true],["dataPendencia","Data de pendência","date",false],["pendencias","Observações / pendências","textarea",false]
  ]},
  { id: "km-caminhonetes", title: "KM de Caminhonetes", icon: "🛻", description: "Histórico de quilometragem das caminhonetes.", fields: [
    ["frotaId","Frota","fleet",true],["dataLeitura","Data da leitura","date",true],["quilometragem","Quilometragem (km)","number",true],["responsavel","Responsável","config:pessoas",true],["pendencias","Observações / pendências","textarea",false]
  ]},
  { id: "preventiva", title: "Manutenção Preventiva", icon: "🗓️", description: "Planejamento por data e leitura prevista.", fields: [
    ["frotaId","Frota","fleet",true],["os","Ordem de serviço","text",false],["descricao","Descrição","text",true],["responsavel","Responsável","config:pessoas",true],["status","Status","config:statusAtividade",true],["dataProgramada","Data programada","date",true],["leituraPrevista","Leitura prevista (km/h)","number",false],["pendencias","Observações / pendências","textarea",false]
  ]},
  { id: "os", title: "Ordens de Serviço", icon: "🧾", description: "Abertura, acompanhamento e encerramento de OS.", fields: [
    ["numero","Número da OS","text",true],["frotaId","Frota","fleet",true],["descricao","Descrição","text",true],["responsavel","Responsável","config:pessoas",true],["status","Status","config:statusOS",true],["dataAbertura","Data de abertura","date",true],["previsao","Previsão de liberação","date",false],["dataConclusao","Data de conclusão / liberação","date",false],["pendencias","Observações / pendências","textarea",false]
  ]},
  { id: "corretivas", title: "Pendências das Corretivas", icon: "🔧", description: "Acompanhamento das ações corretivas pendentes.", fields: [
    ["frotaId","Frota","fleet",true],["os","OS relacionada","text",false],["descricao","Descrição da pendência","text",true],["responsavel","Responsável","config:pessoas",true],["status","Status","config:statusOS",true],["dataAbertura","Data de abertura","date",true],["previsao","Previsão de liberação","date",false],["dataConclusao","Data de conclusão","date",false],["osRelacionadas","OS relacionadas","text",false],["pendencias","Observações / pendências","textarea",false]
  ]}
];

const defaultConfig = {
  tipos: ["Ônibus", "Caminhonete", "Equipamento AC", "Máquina", "Outro"],
  pessoas: ["Equipe PCM"],
  fornecedores: [],
  statusRA: ["Aberto", "Em andamento", "Aguardando retorno", "Fechado", "Encerrado", "Concluído"],
  statusAtividade: ["Pendente", "Em andamento", "Aguardando", "Concluído", "Cancelado"],
  statusPecas: ["Solicitada", "Em cotação", "Pedido realizado", "Aguardando entrega", "Recebida", "Cancelada"],
  statusParada: ["Parada", "Em manutenção", "Aguardando peças", "Aguardando equipe", "Liberada"],
  statusOS: ["Aberta", "Em andamento", "Aguardando peças", "Concluída", "Encerrada"]
};
const configLabels = {
  tipos: "Tipos de frota", pessoas: "Responsáveis", fornecedores: "Fornecedores",
  statusRA: "Status de RA", statusAtividade: "Status de atividades e preventiva",
  statusPecas: "Status de peças", statusParada: "Status de frota parada", statusOS: "Status de OS e corretivas"
};

let state = loadState();
let currentPage = "dashboard";
let editingId = null;
let activeModuleId = null;
let searchTerm = "";

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.records && saved.config) {
      Object.keys(defaultConfig).forEach(k => { if (!saved.config[k]) saved.config[k] = [...defaultConfig[k]]; });
      return saved;
    }
  } catch (error) { console.warn("Não foi possível ler os dados locais.", error); }
  return { records: Object.fromEntries(modules.map(m => [m.id, []])), config: structuredClone(defaultConfig) };
}
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function displayValue(moduleId, field, value) {
  if (field === "frotaId") {
    const fleet = (state.records.frotas || []).find(item => item.id === value);
    return fleet ? `${fleet.codigo} — ${fleet.veiculo}` : (value || "—");
  }
  return value || "—";
}
function moduleById(id) { return modules.find(m => m.id === id); }
function getNavItems() {
  return [
    { id: "dashboard", title: "Painel", icon: "▦" },
    ...modules.map(m => ({ id: m.id, title: m.title, icon: m.icon })),
    { id: "parametros", title: "Parâmetros", icon: "⚙" },
    { id: "usuarios", title: "Usuários e acesso", icon: "♙" }
  ];
}
function showPage(pageId) {
  currentPage = pageId;
  searchTerm = "";
  document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.page === pageId));
  const nav = getNavItems().find(item => item.id === pageId);
  document.getElementById("breadcrumb-current").textContent = nav?.title || "Painel";
  document.getElementById("sidebar").classList.remove("open");
  renderPage();
}
function heading(title, subtitle, buttonText = "", buttonAction = "") {
  return `<div><div class="eyebrow">FLEETOPS PCM / OPERAÇÃO</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div>
    <div class="heading-actions">${buttonText ? `<button class="button button-primary" data-action="${buttonAction}">＋ ${escapeHtml(buttonText)}</button>` : ""}</div>`;
}
function renderPage() {
  const headingEl = document.getElementById("page-heading");
  const bodyEl = document.getElementById("page-body");
  if (currentPage === "dashboard") {
    headingEl.innerHTML = heading("Painel de controle", "Visão geral das frotas, registros e atividades de manutenção.");
    bodyEl.innerHTML = renderDashboard();
  } else if (currentPage === "parametros") {
    headingEl.innerHTML = heading("Parâmetros do sistema", "Gerencie listas utilizadas pelos formulários dos módulos.");
    bodyEl.innerHTML = renderParameters();
  } else if (currentPage === "usuarios") {
    headingEl.innerHTML = heading("Usuários e acesso", "Demonstração visual de perfis. A autorização real precisa ser implementada no backend.");
    bodyEl.innerHTML = renderUsersNotice();
  } else {
    const mod = moduleById(currentPage);
    if (!mod) { currentPage = "dashboard"; renderPage(); return; }
    headingEl.innerHTML = heading(mod.title, mod.description, "Novo registro", "create");
    bodyEl.innerHTML = renderModuleTable(mod);
  }
  bindPage();
}
function renderDashboard() {
  const totalFrotas = (state.records.frotas || []).length;
  const totalOS = (state.records.os || []).length;
  const abertasOS = (state.records.os || []).filter(r => !/concluída|encerrada/i.test(r.status || "")).length;
  const paradas = (state.records.paradas || []).filter(r => !/liberada/i.test(r.status || "")).length;
  return `
    <div class="stats-grid">
      ${statCard("Frotas cadastradas", totalFrotas, "Cadastro mestre", "🚚")}
      ${statCard("Ordens de serviço", totalOS, "Registros de OS", "🧾")}
      ${statCard("OS em aberto", abertasOS, "Acompanhar andamento", "📋")}
      ${statCard("Frotas indisponíveis", paradas, "Registros de parada não liberados", "🛑")}
    </div>
    <div class="dashboard-grid">
      <section class="panel"><div class="panel-header"><div><h2>Acesso rápido</h2><p>Abra um módulo para consultar ou cadastrar informações.</p></div></div>
        <div class="panel-body"><div class="quick-grid">
          ${modules.slice(0,6).map(m => `<button class="quick-link" data-page="${m.id}"><span>${m.icon}</span><strong>${escapeHtml(m.title)}</strong><small>${(state.records[m.id] || []).length} registro(s)</small></button>`).join("")}
        </div></div>
      </section>
      <section class="panel"><div class="panel-header"><div><h2>Últimos registros</h2><p>Itens incluídos recentemente neste navegador.</p></div></div>
        <div class="panel-body">${renderRecentRecords()}</div>
      </section>
    </div>
    <div class="note-banner" style="margin-top:18px"><strong>Importante:</strong> este frontend salva dados somente no armazenamento local deste navegador. Ele não oferece login real, compartilhamento entre computadores nem controle de acesso seguro. Integre-o à API e ao PostgreSQL antes de uso operacional.</div>`;
}
function statCard(label, value, caption, icon) {
  return `<article class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-caption">${caption}</div></article>`;
}
function renderRecentRecords() {
  const items = [];
  modules.forEach(m => (state.records[m.id] || []).forEach(r => items.push({ mod:m, record:r })));
  items.sort((a,b) => (b.record.updatedAt || b.record.createdAt || "").localeCompare(a.record.updatedAt || a.record.createdAt || ""));
  if (!items.length) return `<div class="empty-state"><strong>Nenhum registro ainda</strong>Use “Cadastro de Frotas” para começar.</div>`;
  return `<div class="config-list">${items.slice(0,5).map(({mod,record}) => `<button class="quick-link" data-page="${mod.id}"><strong>${escapeHtml(record.codigo || record.numero || record.descricao || record.peca || mod.title)}</strong><small>${escapeHtml(mod.title)} · ${escapeHtml(record.status || "Sem status")}</small></button>`).join("")}</div>`;
}
function renderModuleTable(mod) {
  const rows = (state.records[mod.id] || []).filter(record => JSON.stringify(record).toLowerCase().includes(searchTerm.toLowerCase()));
  const columns = mod.fields.slice(0,5);
  return `<div class="toolbar"><input class="search-input" id="table-search" type="search" placeholder="Pesquisar registros..." value="${escapeHtml(searchTerm)}" aria-label="Pesquisar registros"><button class="button button-secondary" data-action="export">Exportar CSV</button></div>
    <div class="table-wrap"><table class="data-table"><thead><tr>${columns.map(f=>`<th>${escapeHtml(f[1])}</th>`).join("")}<th>Ações</th></tr></thead><tbody>
    ${rows.length ? rows.map(r=>`<tr>${columns.map(f=>`<td>${f[0]==="status" ? `<span class="status-pill ${statusClass(r[f[0]])}">${escapeHtml(displayValue(mod.id,f[0],r[f[0]]))}</span>` : `<span class="${f[0]==="codigo"||f[0]==="numero"||f[0]==="descricao" ? "cell-primary" : ""}">${escapeHtml(displayValue(mod.id,f[0],r[f[0]]))}</span>`}</td>`).join("")}
    <td><div class="row-actions"><button class="action-button" data-action="edit" data-id="${r.id}">Editar</button><button class="action-button" data-action="delete" data-id="${r.id}">Excluir</button></div></td></tr>`).join("") : `<tr><td colspan="${columns.length+1}" class="empty-state"><strong>Nenhum registro encontrado</strong>Cadastre um registro ou altere a pesquisa.</td></tr>`}
    </tbody></table></div>
    <p style="font-size:10px;color:var(--muted);margin:12px 2px">${rows.length} registro(s) exibido(s). Campos adicionais podem ser consultados ao editar.</p>`;
}
function statusClass(status = "") {
  const s = status.toLowerCase();
  if (/conclu|fechado|encerrado|recebida|liberada|ativa/.test(s)) return "concluido";
  if (/abert|parada|atrasad|cancelad/.test(s)) return "aberto";
  if (/aguard|andamento|manuten|cotação|pedido/.test(s)) return "aguardando";
  return "";
}
function fieldOptions(type) {
  if (type === "fleet") return (state.records.frotas || []).map(r => [r.id, `${r.codigo} — ${r.veiculo}`]);
  if (type.startsWith("config:")) {
    const key = type.split(":")[1];
    return (state.config[key] || []).map(v => [v,v]);
  }
  if (type.startsWith("select:")) return type.slice(7).split("|").map(v=>[v,v]);
  return [];
}
function renderField(field, value = "") {
  const [key,label,type,required] = field;
  const requiredMark = required ? " *" : "";
  let control = "";
  if (type === "textarea") {
    control = `<textarea class="field-control" id="field-${key}" name="${key}" ${required?"required":""}>${escapeHtml(value)}</textarea>`;
  } else if (type === "fleet" || type.startsWith("config:") || type.startsWith("select:")) {
    const options = fieldOptions(type);
    control = `<select class="field-control" id="field-${key}" name="${key}" ${required?"required":""}><option value="">Selecione...</option>${options.map(([v,l])=>`<option value="${escapeHtml(v)}" ${String(v)===String(value)?"selected":""}>${escapeHtml(l)}</option>`).join("")}</select>`;
  } else {
    const inputType = ["date","number"].includes(type) ? type : "text";
    control = `<input class="field-control" id="field-${key}" name="${key}" type="${inputType}" value="${escapeHtml(value)}" ${required?"required":""} ${type==="number"?'min="0" step="any"':""}>`;
  }
  return `<div class="form-field ${type==="textarea"?"full":""}"><label for="field-${key}">${escapeHtml(label)}${requiredMark}</label>${control}</div>`;
}
function openRecordDialog(mod, record = null) {
  if (mod.id !== "frotas" && !(state.records.frotas || []).length) {
    showToast("Cadastre uma frota antes de criar registros operacionais.");
    showPage("frotas");
    return;
  }
  activeModuleId = mod.id;
  editingId = record?.id || null;
  document.getElementById("dialog-eyebrow").textContent = mod.title.toUpperCase();
  document.getElementById("dialog-title").textContent = record ? "Editar registro" : "Novo registro";
  document.getElementById("form-fields").innerHTML = mod.fields.map(field => renderField(field, record?.[field[0]] ?? "")).join("");
  document.getElementById("record-dialog").showModal();
}
function saveRecord(event) {
  event.preventDefault();
  const mod = moduleById(activeModuleId);
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  if (mod.id === "frotas") {
    const duplicate = (state.records.frotas || []).some(r => r.codigo?.toLowerCase() === data.codigo?.toLowerCase() && r.id !== editingId);
    if (duplicate) { showToast("Já existe uma frota com este código."); return; }
  }
  const records = state.records[mod.id] || (state.records[mod.id] = []);
  const now = new Date().toISOString();
  if (editingId) {
    const index = records.findIndex(r => r.id === editingId);
    if (index >= 0) records[index] = { ...records[index], ...data, updatedAt: now };
  } else {
    records.unshift({ id: crypto.randomUUID(), ...data, createdAt: now, updatedAt: now });
  }
  persist();
  document.getElementById("record-dialog").close();
  renderPage();
  showToast(editingId ? "Registro atualizado." : "Registro salvo.");
  editingId = null;
}
function deleteRecord(mod, id) {
  const record = (state.records[mod.id] || []).find(r => r.id === id);
  if (!record) return;
  if (mod.id === "frotas") {
    const referenced = modules.some(m => m.id !== "frotas" && (state.records[m.id] || []).some(r => r.frotaId === id));
    if (referenced) { showToast("Esta frota possui registros vinculados. Não é possível excluí-la."); return; }
  }
  if (!confirm("Deseja realmente excluir este registro?")) return;
  state.records[mod.id] = state.records[mod.id].filter(r => r.id !== id);
  persist(); renderPage(); showToast("Registro excluído.");
}
function exportCsv(mod) {
  const records = state.records[mod.id] || [];
  if (!records.length) { showToast("Não há registros para exportar."); return; }
  const fields = mod.fields.map(f=>f[0]);
  const csvCell = v => `"${String(v ?? "").replace(/"/g,'""')}"`;
  const lines = [fields.map(key => csvCell(mod.fields.find(f=>f[0]===key)[1])).join(";")];
  records.forEach(r => lines.push(fields.map(key => csvCell(key==="frotaId" ? displayValue(mod.id,key,r[key]) : r[key])).join(";")));
  const blob = new Blob(["\ufeff"+lines.join("\r\n")], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=`fleetops-${mod.id}.csv`; a.click();
  URL.revokeObjectURL(url); showToast("Arquivo CSV gerado.");
}
function renderParameters() {
  return `<div class="note-banner">Os parâmetros abaixo alimentam os campos de seleção dos formulários. Nesta versão, as alterações ficam apenas no armazenamento local do navegador.</div>
  <div class="module-grid">${Object.entries(configLabels).map(([key,label])=>`<section class="panel"><div class="panel-header"><div><h2>${escapeHtml(label)}</h2><p>${(state.config[key]||[]).length} opção(ões)</p></div></div><div class="panel-body"><div class="config-list">${(state.config[key]||[]).map((value,index)=>`<div class="config-row"><input class="field-control" data-config-key="${key}" data-config-index="${index}" value="${escapeHtml(value)}"><button class="action-button" data-action="save-config" data-key="${key}" data-index="${index}">Salvar</button><button class="action-button" data-action="delete-config" data-key="${key}" data-index="${index}">×</button></div>`).join("")}<div class="config-row"><input class="field-control" id="new-${key}" placeholder="Adicionar opção"><button class="button button-primary" data-action="add-config" data-key="${key}">Adicionar</button></div></div></div></section>`).join("")}</div>`;
}
function renderUsersNotice() {
  return `<div class="panel"><div class="panel-header"><div><h2>Modelo de acesso</h2><p>Perfis sugeridos para a versão integrada ao backend.</p></div></div><div class="panel-body">
  <div class="note-banner"><strong>Limitação desta tela:</strong> ela não cria contas, não autentica pessoas e não protege dados. Não utilize esta demonstração para conceder acesso real.</div>
  <div class="table-wrap"><table class="data-table"><thead><tr><th>Perfil sugerido</th><th>Permissões planejadas</th></tr></thead><tbody>
  <tr><td><strong>Administrador</strong></td><td>Gerenciar usuários, parâmetros e todos os módulos.</td></tr>
  <tr><td><strong>PCM</strong></td><td>Criar e atualizar registros operacionais conforme atribuições.</td></tr>
  <tr><td><strong>Consulta</strong></td><td>Visualizar dados autorizados, sem alterar registros.</td></tr>
  <tr><td><strong>Gestor</strong></td><td>Consultar indicadores, relatórios e disponibilidade.</td></tr>
  </tbody></table></div></div></div>`;
}
function bindPage() {
  document.querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", () => showPage(el.dataset.page)));
  document.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", () => {
    const action = el.dataset.action;
    if (action === "create") openRecordDialog(moduleById(currentPage));
    if (action === "edit") openRecordDialog(moduleById(currentPage), (state.records[currentPage] || []).find(r => r.id === el.dataset.id));
    if (action === "delete") deleteRecord(moduleById(currentPage), el.dataset.id);
    if (action === "export") exportCsv(moduleById(currentPage));
    if (action === "add-config") addConfig(el.dataset.key);
    if (action === "save-config") saveConfig(el.dataset.key, Number(el.dataset.index));
    if (action === "delete-config") deleteConfig(el.dataset.key, Number(el.dataset.index));
  }));
  const search = document.getElementById("table-search");
  if (search) search.addEventListener("input", () => {
    searchTerm = search.value;
    const mod = moduleById(currentPage);
    const body = document.getElementById("page-body");
    const y = window.scrollY;
    body.innerHTML = renderModuleTable(mod);
    bindPage();
    const nextSearch = document.getElementById("table-search");
    nextSearch?.focus();
    nextSearch?.setSelectionRange(searchTerm.length, searchTerm.length);
    window.scrollTo(0,y);
  });
}
function addConfig(key) {
  const input = document.getElementById(`new-${key}`);
  const value = input?.value.trim();
  if (!value) { showToast("Digite uma opção antes de adicionar."); return; }
  if (state.config[key].some(v => v.toLowerCase() === value.toLowerCase())) { showToast("Essa opção já existe."); return; }
  state.config[key].push(value); persist(); renderPage(); showToast("Opção adicionada.");
}
function saveConfig(key, index) {
  const input = document.querySelector(`[data-config-key="${key}"][data-config-index="${index}"]`);
  const value = input?.value.trim();
  if (!value) { showToast("O valor não pode ficar vazio."); return; }
  state.config[key][index] = value; persist(); renderPage(); showToast("Parâmetro atualizado.");
}
function deleteConfig(key, index) {
  if (!confirm("Remover esta opção dos parâmetros?")) return;
  state.config[key].splice(index,1); persist(); renderPage(); showToast("Opção removida.");
}
function showToast(message) {
  const region = document.getElementById("toast-region");
  const toast = document.createElement("div"); toast.className = "toast"; toast.textContent = message;
  region.appendChild(toast); setTimeout(() => toast.remove(), 3200);
}
function loadBranding() {
  try {
    const branding = JSON.parse(localStorage.getItem(BRANDING_KEY) || "{}");
    ["header", "footer"].forEach(slot => {
      const image = document.getElementById(`${slot}-logo-preview`);
      if (image && branding[slot]) { image.src = branding[slot]; image.hidden = false; }
    });
  } catch (error) { console.warn("Não foi possível carregar as imagens institucionais.", error); }
}
function handleBrandingUpload(event, slot) {
  const input = event.currentTarget;
  const file = input.files && input.files[0];
  if (!file) return;
  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) { showToast("Formato inválido. Use PNG, JPEG, WebP ou SVG."); input.value = ""; return; }
  if (file.size > MAX_BRANDING_FILE_SIZE) { showToast("A imagem deve ter no máximo 2 MB."); input.value = ""; return; }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const branding = JSON.parse(localStorage.getItem(BRANDING_KEY) || "{}");
      branding[slot] = reader.result;
      localStorage.setItem(BRANDING_KEY, JSON.stringify(branding));
      const preview = document.getElementById(`${slot}-logo-preview`);
      preview.src = reader.result; preview.hidden = false;
      showToast("Imagem institucional atualizada neste navegador.");
    } catch (error) {
      console.error("Falha ao salvar imagem institucional.", error);
      showToast("Não foi possível salvar a imagem. Tente um arquivo menor.");
    }
    input.value = "";
  };
  reader.onerror = () => { showToast("Não foi possível ler o arquivo de imagem."); input.value = ""; };
  reader.readAsDataURL(file);
}
function init() {
  const nav = document.getElementById("main-nav");
  nav.innerHTML = getNavItems().map(item => `<button class="nav-item ${item.id==="dashboard"?"active":""}" data-page="${item.id}"><span class="nav-icon">${item.icon}</span><span>${escapeHtml(item.title)}</span></button>`).join("");
  document.getElementById("record-form").addEventListener("submit", saveRecord);
  document.getElementById("dialog-close").addEventListener("click", () => document.getElementById("record-dialog").close());
  document.getElementById("dialog-cancel").addEventListener("click", () => document.getElementById("record-dialog").close());
  document.getElementById("menu-toggle").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
  document.getElementById("header-image-input").addEventListener("change", event => handleBrandingUpload(event, "header"));
  document.getElementById("footer-image-input").addEventListener("change", event => handleBrandingUpload(event, "footer"));
  loadBranding();
  bindPage();
  renderPage();
}
document.addEventListener("DOMContentLoaded", init);
