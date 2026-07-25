import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid, Package, Wrench, Plus, Search, Trash2, X,
  Boxes, Receipt, TrendingUp, AlertTriangle, Menu,
} from "lucide-react";
import "./App.css";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const PRODUCTS_KEY = "oficina-produtos";
const SERVICES_KEY = "oficina-servicos";
const emptyProductForm = { name: "", description: "", price: "", stock: "" };
const emptyServiceForm = { name: "", description: "", price: "" };

function genCode(n) {
  return `OF-${String(n).padStart(5, "0")}`;
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [products, setProducts] = useState(() => loadJSON(PRODUCTS_KEY, { items: [], nextCode: 1 }).items || []);
  const [nextCode, setNextCode] = useState(() => loadJSON(PRODUCTS_KEY, { items: [], nextCode: 1 }).nextCode || 1);
  const [services, setServices] = useState(() => loadJSON(SERVICES_KEY, []));

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify({ items: products, nextCode }));
  }, [products, nextCode]);

  useEffect(() => {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  }, [services]);

  const addProduct = (form) => {
    const item = {
      id: crypto.randomUUID(),
      code: genCode(nextCode),
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
    };
    setProducts([item, ...products]);
    setNextCode(nextCode + 1);
  };
  const removeProduct = (id) => setProducts(products.filter((p) => p.id !== id));

  const addService = (form) => {
    const item = { id: crypto.randomUUID(), name: form.name.trim(), description: form.description.trim(), price: Number(form.price) || 0 };
    setServices([item, ...services]);
  };
  const removeService = (id) => setServices(services.filter((s) => s.id !== id));

  const stats = useMemo(() => {
    const stockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStock = products.filter((p) => p.stock <= 3).length;
    const avgServicePrice = services.length ? services.reduce((s, x) => s + x.price, 0) / services.length : 0;
    return { stockValue, lowStock, avgServicePrice, totalProducts: products.length, totalServices: services.length };
  }, [products, services]);

  const go = (v) => { setView(v); setMobileNavOpen(false); };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><Wrench size={20} color="#ff5722" /> Oficina<span>OS</span></div>
        <nav className="nav-list">
          <button className={`nav-link ${view === "dashboard" ? "active" : ""}`} onClick={() => go("dashboard")}><LayoutGrid size={17} /> Painel</button>
          <button className={`nav-link ${view === "produtos" ? "active" : ""}`} onClick={() => go("produtos")}><Package size={17} /> Produtos</button>
          <button className={`nav-link ${view === "servicos" ? "active" : ""}`} onClick={() => go("servicos")}><Wrench size={17} /> Serviços</button>
        </nav>
        <div className="sidebar-bottom"><span className="status-dot" /> Uso interno da equipe</div>
      </aside>

      <div className="mobile-header">
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Wrench size={18} color="#ff5722" /> Oficina<span>OS</span></span>
        <button className="mobile-menu-btn" onClick={() => setMobileNavOpen(true)}><Menu size={22} /></button>
      </div>
      <div className={`mobile-nav-overlay ${mobileNavOpen ? "open" : ""}`}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <button className="icon-button" onClick={() => setMobileNavOpen(false)}><X size={20} /></button>
        </div>
        <div className="nav-list">
          <button className={`nav-link ${view === "dashboard" ? "active" : ""}`} onClick={() => go("dashboard")}><LayoutGrid size={18} /> Painel</button>
          <button className={`nav-link ${view === "produtos" ? "active" : ""}`} onClick={() => go("produtos")}><Package size={18} /> Produtos</button>
          <button className={`nav-link ${view === "servicos" ? "active" : ""}`} onClick={() => go("servicos")}><Wrench size={18} /> Serviços</button>
        </div>
      </div>

      <main className="main-area">
        <div className="page">
          {view === "dashboard" && <Dashboard stats={stats} setView={setView} />}
          {view === "produtos" && <ProductsPage products={products} onAdd={addProduct} onRemove={removeProduct} nextCode={nextCode} />}
          {view === "servicos" && <ServicesPage services={services} onAdd={addService} onRemove={removeService} />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ stats, setView }) {
  return (
    <div>
      <p className="eyebrow">VISÃO GERAL</p>
      <h1>Painel da oficina</h1>
      <div className="metric-grid" style={{ marginTop: 30 }}>
        <div className="metric-card"><div className="metric-icon orange"><Boxes size={18} /></div><p>Produtos cadastrados</p><strong>{stats.totalProducts}</strong></div>
        <div className="metric-card"><div className="metric-icon blue"><Wrench size={18} /></div><p>Serviços cadastrados</p><strong>{stats.totalServices}</strong></div>
        <div className="metric-card"><div className="metric-icon green"><TrendingUp size={18} /></div><p>Valor em estoque</p><strong>{money.format(stats.stockValue)}</strong></div>
        <div className="metric-card"><div className="metric-icon yellow"><AlertTriangle size={18} /></div><p>Estoque baixo</p><strong>{stats.lowStock}</strong></div>
      </div>
      <div className="dashboard-grid">
        <div className="focus-panel">
          <p className="eyebrow">PRÓXIMO PASSO</p>
          <h2>Mantenha o estoque e os serviços sempre atualizados</h2>
          <p>Cada peça cadastrada recebe um código interno automático, pronto para etiqueta. Serviços ficam com nome, descrição e preço, sem burocracia.</p>
          <button className="primary-button" onClick={() => setView("produtos")}><Plus size={16} /> Cadastrar produto</button>
        </div>
        <div className="quick-panel">
          <p>Preço médio por serviço</p>
          <strong className="big">{money.format(stats.avgServicePrice)}</strong>
          <button onClick={() => setView("servicos")}><Receipt size={17} /> Ver todos os serviços</button>
        </div>
      </div>
    </div>
  );
}

function ProductsPage({ products, onAdd, onRemove, nextCode }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyProductForm);
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;
    onAdd(form); setForm(emptyProductForm); setOpen(false);
  };

  return (
    <div>
      <div className="page-heading">
        <div><p className="eyebrow">ESTOQUE</p><h1>Produtos</h1><p className="subheading">Peças e itens com código interno gerado automaticamente.</p></div>
        <button className="primary-button" onClick={() => setOpen(true)}><Plus size={17} /> Novo produto</button>
      </div>
      <div className="table-toolbar">
        <div className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto" /></div>
        <p>{filtered.length} produto(s)</p>
      </div>
      <div className="data-table-wrap">
        <table>
          <thead><tr><th>Código</th><th>Produto</th><th>Preço</th><th>Estoque</th><th></th></tr></thead>
          <tbody>
            {filtered.length ? filtered.map((p) => (
              <tr key={p.id}>
                <td><span className="barcode-chip">{p.code}</span></td>
                <td><strong>{p.name}</strong><small>{p.description || "Sem descrição"}</small></td>
                <td>{money.format(p.price)}</td>
                <td><span className={`stock-badge ${p.stock <= 3 ? "low" : ""}`}>{p.stock} un.</span></td>
                <td style={{ textAlign: "right" }}><button className="icon-button danger" onClick={() => onRemove(p.id)}><Trash2 size={15} /></button></td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="empty-cell"><Package size={24} style={{ verticalAlign: "middle" }} /> Nenhum produto cadastrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="modal-backdrop">
          <form className="form-modal" onSubmit={submit}>
            <div className="modal-title"><div><p className="eyebrow">NOVA PEÇA</p><h2>Cadastrar produto</h2></div><button type="button" className="icon-button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <div className="barcode-note"><Boxes size={14} /> Código gerado automaticamente: <span>{genCode(nextCode)}</span></div>
            <label>Nome do produto<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Descrição<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <div className="form-row">
              <label>Preço (R$)<input required type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
              <label>Estoque<input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label>
            </div>
            <button type="submit" className="primary-button full-button">Salvar produto</button>
          </form>
        </div>
      )}
    </div>
  );
}

function ServicesPage({ services, onAdd, onRemove }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyServiceForm);
  const filtered = services.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;
    onAdd(form); setForm(emptyServiceForm); setOpen(false);
  };

  return (
    <div>
      <div className="page-heading">
        <div><p className="eyebrow">MÃO DE OBRA</p><h1>Serviços</h1><p className="subheading">Nome, descrição e preço — sem burocracia extra.</p></div>
        <button className="primary-button" onClick={() => setOpen(true)}><Plus size={17} /> Novo serviço</button>
      </div>
      <div className="table-toolbar">
        <div className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar serviço" /></div>
        <p>{filtered.length} serviço(s)</p>
      </div>
      <div className="services-grid">
        {filtered.length ? filtered.map((s) => (
          <article className="service-card" key={s.id}>
            <Wrench size={18} className="service-card-icon" />
            <button className="icon-button danger service-delete" onClick={() => onRemove(s.id)}><Trash2 size={15} /></button>
            <p className="service-price">{money.format(s.price)}</p>
            <h2>{s.name}</h2>
            <p className="desc">{s.description || "Sem descrição cadastrada."}</p>
          </article>
        )) : (
          <div className="empty-services"><Wrench size={26} />Nenhum serviço cadastrado ainda.</div>
        )}
      </div>

      {open && (
        <div className="modal-backdrop">
          <form className="form-modal" onSubmit={submit}>
            <div className="modal-title"><div><p className="eyebrow">NOVA MÃO DE OBRA</p><h2>Cadastrar serviço</h2></div><button type="button" className="icon-button" onClick={() => setOpen(false)}><X size={18} /></button></div>
            <label>Nome do serviço<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Descrição<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label>Preço (R$)<input required type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
            <button type="submit" className="primary-button full-button">Salvar serviço</button>
          </form>
        </div>
      )}
    </div>
  );
}
