import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid, Package, Wrench, Plus, Search, Trash2, X,
  Boxes, Receipt, TrendingUp, AlertTriangle, Menu, ShoppingCart, Banknote, CreditCard, QrCode, Pencil,
} from "lucide-react";
import "./App.css";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const PRODUCTS_KEY = "oficina-produtos";
const SERVICES_KEY = "oficina-servicos";
const SALES_KEY = "oficina-vendas";
const emptyProductForm = { name: "", description: "", price: "", stock: "" };
const emptyServiceForm = { name: "", description: "", price: "" };
const PAYMENT_METHODS = ["Dinheiro", "Cartão", "Pix"];
const paymentIcon = { "Dinheiro": Banknote, "Cartão": CreditCard, "Pix": QrCode };

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
  const [sales, setSales] = useState(() => loadJSON(SALES_KEY, []));
  const [receiptSale, setReceiptSale] = useState(null);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify({ items: products, nextCode }));
  }, [products, nextCode]);

  useEffect(() => {
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }, [sales]);

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
  const updateProduct = (id, form) => setProducts(products.map((p) => p.id === id ? {
    ...p, name: form.name.trim(), description: form.description.trim(), price: Number(form.price) || 0, stock: Number(form.stock) || 0,
  } : p));

  const addService = (form) => {
    const item = { id: crypto.randomUUID(), name: form.name.trim(), description: form.description.trim(), price: Number(form.price) || 0 };
    setServices([item, ...services]);
  };
  const removeService = (id) => setServices(services.filter((s) => s.id !== id));
  const updateService = (id, form) => setServices(services.map((s) => s.id === id ? {
    ...s, name: form.name.trim(), description: form.description.trim(), price: Number(form.price) || 0,
  } : s));

  const registerSale = ({ type, itemId, itemName, unitPrice, quantity, payment }) => {
    const sale = {
      id: crypto.randomUUID(), type, itemId, itemName, unitPrice, quantity,
      total: unitPrice * quantity, payment, date: new Date().toISOString(),
    };
    setSales([sale, ...sales]);
    if (type === "produto") {
      setProducts(products.map((p) => p.id === itemId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p));
    }
    setReceiptSale(sale);
  };

  const removeSale = (id) => {
    const sale = sales.find((s) => s.id === id);
    if (sale && sale.type === "produto") {
      setProducts(products.map((p) => p.id === sale.itemId ? { ...p, stock: p.stock + sale.quantity } : p));
    }
    setSales(sales.filter((s) => s.id !== id));
  };

  const stats = useMemo(() => {
    const stockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStock = products.filter((p) => p.stock <= 3).length;
    const avgServicePrice = services.length ? services.reduce((s, x) => s + x.price, 0) / services.length : 0;
    const revenueTotal = sales.reduce((s, x) => s + x.total, 0);
    const revenueByPayment = PAYMENT_METHODS.reduce((acc, m) => {
      acc[m] = sales.filter((s) => s.payment === m).reduce((sum, s) => sum + s.total, 0);
      return acc;
    }, {});
    return { stockValue, lowStock, avgServicePrice, totalProducts: products.length, totalServices: services.length, revenueTotal, revenueByPayment };
  }, [products, services, sales]);

  const go = (v) => { setView(v); setMobileNavOpen(false); };

  const navItems = [
    { key: "dashboard", label: "Painel", icon: LayoutGrid },
    { key: "produtos", label: "Produtos", icon: Package },
    { key: "servicos", label: "Serviços", icon: Wrench },
    { key: "vendas", label: "Vendas", icon: ShoppingCart },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><Wrench size={20} color="#ff5722" /> Oficina<span>OS</span></div>
        <nav className="nav-list">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button key={key} className={`nav-link ${view === key ? "active" : ""}`} onClick={() => go(key)}><Icon size={17} /> {label}</button>
          ))}
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
          {navItems.map(({ key, label, icon: Icon }) => (
            <button key={key} className={`nav-link ${view === key ? "active" : ""}`} onClick={() => go(key)}><Icon size={18} /> {label}</button>
          ))}
        </div>
      </div>

      <main className="main-area">
        <div className="page">
          {view === "dashboard" && <Dashboard stats={stats} setView={setView} sales={sales} />}
          {view === "produtos" && <ProductsPage products={products} onAdd={addProduct} onUpdate={updateProduct} onRemove={removeProduct} nextCode={nextCode} onSell={registerSale} />}
          {view === "servicos" && <ServicesPage services={services} onAdd={addService} onUpdate={updateService} onRemove={removeService} onSell={registerSale} />}
          {view === "vendas" && <VendasPage sales={sales} products={products} services={services} onSell={registerSale} onRemove={removeSale} />}
        </div>
      </main>

      {receiptSale && <ReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />}
    </div>
  );
}

function ReceiptModal({ sale, onClose }) {
  return (
    <div className="modal-backdrop no-print-hide">
      <div className="receipt-modal">
        <div className="receipt-print-area">
          <p className="receipt-brand">Oficina<span>OS</span></p>
          <p className="receipt-sub">Recibo de venda (comprovante não fiscal)</p>
          <div className="receipt-divider" />
          <p className="receipt-line"><span>Data</span><span>{new Date(sale.date).toLocaleString("pt-BR")}</span></p>
          <p className="receipt-line"><span>Item</span><span>{sale.itemName}</span></p>
          <p className="receipt-line"><span>Tipo</span><span>{sale.type === "produto" ? "Produto" : "Serviço"}</span></p>
          <p className="receipt-line"><span>Quantidade</span><span>{sale.quantity}</span></p>
          <p className="receipt-line"><span>Preço unitário</span><span>{money.format(sale.unitPrice)}</span></p>
          <p className="receipt-line"><span>Forma de pagamento</span><span>{sale.payment}</span></p>
          <div className="receipt-divider" />
          <p className="receipt-total"><span>Total</span><span>{money.format(sale.total)}</span></p>
        </div>
        <div className="receipt-actions no-print">
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
          <button className="primary-button full-button" onClick={() => window.print()}><Receipt size={16} /> Imprimir / salvar PDF</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ stats, setView, sales }) {
  const recent = sales.slice(0, 4);
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
          <p className="eyebrow">FATURAMENTO</p>
          <h2>{money.format(stats.revenueTotal)}</h2>
          <div className="payment-breakdown">
            {PAYMENT_METHODS.map((m) => {
              const Icon = paymentIcon[m];
              return <span key={m} className="payment-chip"><Icon size={14} /> {m}: {money.format(stats.revenueByPayment[m] || 0)}</span>;
            })}
          </div>
          <button className="primary-button" onClick={() => setView("vendas")}><Plus size={16} /> Registrar venda</button>
        </div>
        <div className="quick-panel">
          <p>Vendas recentes</p>
          {recent.length ? recent.map((s) => (
            <div className="recent-sale" key={s.id}>
              <div><strong>{s.itemName}</strong><small>{s.payment} · {s.quantity}x</small></div>
              <span>{money.format(s.total)}</span>
            </div>
          )) : <p className="muted-note">Nenhuma venda registrada ainda.</p>}
          <button onClick={() => setView("vendas")}><Receipt size={17} /> Ver todas as vendas</button>
        </div>
      </div>
    </div>
  );
}

function SaleModal({ presetItem, allItems, onClose, onConfirm }) {
  const [itemId, setItemId] = useState(presetItem ? `${presetItem.type}:${presetItem.id}` : "");
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState("Dinheiro");
  const [error, setError] = useState("");

  const item = presetItem || (allItems || []).find((i) => `${i.type}:${i.id}` === itemId);
  const total = item ? item.price * quantity : 0;

  const submit = (e) => {
    e.preventDefault();
    if (!item) { setError("Selecione um item."); return; }
    if (item.type === "produto" && quantity > item.stock) { setError(`Estoque insuficiente (disponível: ${item.stock}).`); return; }
    onConfirm({ type: item.type, itemId: item.id, itemName: item.name, unitPrice: item.price, quantity, payment });
  };

  return (
    <div className="modal-backdrop">
      <form className="form-modal" onSubmit={submit}>
        <div className="modal-title"><div><p className="eyebrow">NOVA VENDA</p><h2>Registrar venda</h2></div><button type="button" className="icon-button" onClick={onClose}><X size={18} /></button></div>

        {!presetItem && (
          <label>Item
            <select required value={itemId} onChange={(e) => { setItemId(e.target.value); setError(""); }}>
              <option value="" disabled>Selecione produto ou serviço</option>
              <optgroup label="Produtos">
                {(allItems || []).filter((i) => i.type === "produto").map((i) => (
                  <option key={`produto:${i.id}`} value={`produto:${i.id}`}>{i.name} — {money.format(i.price)}</option>
                ))}
              </optgroup>
              <optgroup label="Serviços">
                {(allItems || []).filter((i) => i.type === "servico").map((i) => (
                  <option key={`servico:${i.id}`} value={`servico:${i.id}`}>{i.name} — {money.format(i.price)}</option>
                ))}
              </optgroup>
            </select>
          </label>
        )}

        {presetItem && <div className="barcode-note"><ShoppingCart size={14} /> Vendendo: <span>{presetItem.name}</span></div>}

        <div className="form-row">
          <label>Quantidade<input type="number" min="1" value={quantity} onChange={(e) => { setQuantity(Number(e.target.value) || 1); setError(""); }} /></label>
          <label>Total<input readOnly value={money.format(total)} /></label>
        </div>

        <label>Forma de pagamento
          <div className="payment-select">
            {PAYMENT_METHODS.map((m) => {
              const Icon = paymentIcon[m];
              return (
                <button type="button" key={m} className={`payment-option ${payment === m ? "active" : ""}`} onClick={() => setPayment(m)}>
                  <Icon size={16} /> {m}
                </button>
              );
            })}
          </div>
        </label>

        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="primary-button full-button">Confirmar venda</button>
      </form>
    </div>
  );
}

function ProductsPage({ products, onAdd, onUpdate, onRemove, nextCode, onSell }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [sellItem, setSellItem] = useState(null);
  const [form, setForm] = useState(emptyProductForm);
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const startEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: String(p.price), stock: String(p.stock) });
    setEditItem(p);
  };
  const closeModal = () => { setOpen(false); setEditItem(null); setForm(emptyProductForm); };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;
    if (editItem) { onUpdate(editItem.id, form); } else { onAdd(form); }
    closeModal();
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
                <td className="row-actions">
                  <button className="icon-button" title="Vender" disabled={p.stock <= 0} onClick={() => setSellItem({ type: "produto", id: p.id, name: p.name, price: p.price, stock: p.stock })}><ShoppingCart size={15} /></button>
                  <button className="icon-button" title="Editar" onClick={() => startEdit(p)}><Pencil size={15} /></button>
                  <button className="icon-button danger" title="Excluir" onClick={() => onRemove(p.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="empty-cell"><Package size={24} style={{ verticalAlign: "middle" }} /> Nenhum produto cadastrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(open || editItem) && (
        <div className="modal-backdrop">
          <form className="form-modal" onSubmit={submit}>
            <div className="modal-title"><div><p className="eyebrow">{editItem ? "EDITAR PEÇA" : "NOVA PEÇA"}</p><h2>{editItem ? "Editar produto" : "Cadastrar produto"}</h2></div><button type="button" className="icon-button" onClick={closeModal}><X size={18} /></button></div>
            <div className="barcode-note"><Boxes size={14} /> Código interno: <span>{editItem ? editItem.code : genCode(nextCode)}</span></div>
            <label>Nome do produto<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Descrição<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <div className="form-row">
              <label>Preço (R$)<input required type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
              <label>Estoque<input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label>
            </div>
            <button type="submit" className="primary-button full-button">{editItem ? "Salvar alterações" : "Salvar produto"}</button>
          </form>
        </div>
      )}

      {sellItem && (
        <SaleModal presetItem={sellItem} onClose={() => setSellItem(null)} onConfirm={(sale) => { onSell(sale); setSellItem(null); }} />
      )}
    </div>
  );
}

function ServicesPage({ services, onAdd, onUpdate, onRemove, onSell }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [sellItem, setSellItem] = useState(null);
  const [form, setForm] = useState(emptyServiceForm);
  const filtered = services.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  const startEdit = (s) => {
    setForm({ name: s.name, description: s.description, price: String(s.price) });
    setEditItem(s);
  };
  const closeModal = () => { setOpen(false); setEditItem(null); setForm(emptyServiceForm); };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;
    if (editItem) { onUpdate(editItem.id, form); } else { onAdd(form); }
    closeModal();
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
            <div className="service-actions">
              <button className="icon-button" title="Vender" onClick={() => setSellItem({ type: "servico", id: s.id, name: s.name, price: s.price })}><ShoppingCart size={15} /></button>
              <button className="icon-button" title="Editar" onClick={() => startEdit(s)}><Pencil size={15} /></button>
              <button className="icon-button danger" title="Excluir" onClick={() => onRemove(s.id)}><Trash2 size={15} /></button>
            </div>
            <p className="service-price">{money.format(s.price)}</p>
            <h2>{s.name}</h2>
            <p className="desc">{s.description || "Sem descrição cadastrada."}</p>
          </article>
        )) : (
          <div className="empty-services"><Wrench size={26} />Nenhum serviço cadastrado ainda.</div>
        )}
      </div>

      {(open || editItem) && (
        <div className="modal-backdrop">
          <form className="form-modal" onSubmit={submit}>
            <div className="modal-title"><div><p className="eyebrow">{editItem ? "EDITAR MÃO DE OBRA" : "NOVA MÃO DE OBRA"}</p><h2>{editItem ? "Editar serviço" : "Cadastrar serviço"}</h2></div><button type="button" className="icon-button" onClick={closeModal}><X size={18} /></button></div>
            <label>Nome do serviço<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Descrição<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label>Preço (R$)<input required type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
            <button type="submit" className="primary-button full-button">{editItem ? "Salvar alterações" : "Salvar serviço"}</button>
          </form>
        </div>
      )}

      {sellItem && (
        <SaleModal presetItem={sellItem} onClose={() => setSellItem(null)} onConfirm={(sale) => { onSell(sale); setSellItem(null); }} />
      )}
    </div>
  );
}

function VendasPage({ sales, products, services, onSell, onRemove }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [viewReceipt, setViewReceipt] = useState(null);
  const allItems = [
    ...products.map((p) => ({ type: "produto", id: p.id, name: p.name, price: p.price, stock: p.stock })),
    ...services.map((s) => ({ type: "servico", id: s.id, name: s.name, price: s.price })),
  ];
  const filtered = sales.filter((s) => s.itemName.toLowerCase().includes(query.toLowerCase()));
  const total = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div>
      <div className="page-heading">
        <div><p className="eyebrow">CAIXA</p><h1>Vendas</h1><p className="subheading">Faturamento total: <strong>{money.format(total)}</strong></p></div>
        <button className="primary-button" onClick={() => setOpen(true)}><Plus size={17} /> Registrar venda</button>
      </div>
      <div className="table-toolbar">
        <div className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por item" /></div>
        <p>{filtered.length} venda(s)</p>
      </div>
      <div className="data-table-wrap">
        <table>
          <thead><tr><th>Item</th><th>Tipo</th><th>Qtd.</th><th>Pagamento</th><th>Total</th><th></th></tr></thead>
          <tbody>
            {filtered.length ? filtered.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.itemName}</strong><small>{new Date(s.date).toLocaleString("pt-BR")}</small></td>
                <td>{s.type === "produto" ? "Produto" : "Serviço"}</td>
                <td>{s.quantity}</td>
                <td><span className="payment-chip small">{s.payment}</span></td>
                <td>{money.format(s.total)}</td>
                <td className="row-actions">
                  <button className="icon-button" title="Ver recibo" onClick={() => setViewReceipt(s)}><Receipt size={15} /></button>
                  <button className="icon-button danger" title="Estornar" onClick={() => onRemove(s.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="empty-cell"><ShoppingCart size={24} style={{ verticalAlign: "middle" }} /> Nenhuma venda registrada ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <SaleModal allItems={allItems} onClose={() => setOpen(false)} onConfirm={(sale) => { onSell(sale); setOpen(false); }} />
      )}

      {viewReceipt && <ReceiptModal sale={viewReceipt} onClose={() => setViewReceipt(null)} />}
    </div>
  );
}
