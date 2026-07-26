import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid, Package, Wrench, Plus, Search, Trash2, X,
  Boxes, Receipt, TrendingUp, AlertTriangle, Menu, ShoppingCart, Banknote, CreditCard, QrCode, Pencil,
  Users, Car,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./App.css";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const emptyProductForm = { name: "", description: "", price: "", stock: "" };
const emptyServiceForm = { name: "", description: "", price: "" };
const emptyClienteForm = { nome: "", telefone: "" };
const emptyVeiculoForm = { placa: "", marca: "", modelo: "", ano: "" };
const PAYMENT_METHODS = ["Dinheiro", "Cartão", "Pix"];
const paymentIcon = { "Dinheiro": Banknote, "Cartão": CreditCard, "Pix": QrCode };

function genCode(n) {
  return `OF-${String(n).padStart(5, "0")}`;
}

const mapProduto = (r) => ({ id: r.id, code: r.code, name: r.name, description: r.description || "", price: Number(r.price), stock: r.stock });
const mapServico = (r) => ({ id: r.id, name: r.name, description: r.description || "", price: Number(r.price) });
const mapCliente = (r) => ({ id: r.id, nome: r.nome, telefone: r.telefone || "" });
const mapVeiculo = (r) => ({ id: r.id, clienteId: r.cliente_id, placa: r.placa || "", marca: r.marca || "", modelo: r.modelo || "", ano: r.ano || "" });
const mapVenda = (r) => ({
  id: r.id, type: r.type, itemId: r.item_id, itemName: r.item_name, unitPrice: Number(r.unit_price),
  quantity: r.quantity, total: Number(r.total), payment: r.payment, clienteId: r.cliente_id, veiculoId: r.veiculo_id, date: r.created_at,
});

export default function App() {
  const [view, setView] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [products, setProducts] = useState([]);
  const [nextCode, setNextCode] = useState(1);
  const [services, setServices] = useState([]);
  const [sales, setSales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [receiptSale, setReceiptSale] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, s, v, c, ve] = await Promise.all([
        supabase.from("produtos").select("*").order("created_at", { ascending: false }),
        supabase.from("servicos").select("*").order("created_at", { ascending: false }),
        supabase.from("vendas").select("*").order("created_at", { ascending: false }),
        supabase.from("clientes").select("*").order("created_at", { ascending: false }),
        supabase.from("veiculos").select("*").order("created_at", { ascending: false }),
      ]);
      if (p.error || s.error || v.error || c.error || ve.error) {
        setErrorMsg("Não foi possível carregar os dados do Supabase. Confira a conexão.");
      } else {
        const prods = p.data.map(mapProduto);
        setProducts(prods);
        setNextCode(prods.length + 1);
        setServices(s.data.map(mapServico));
        setSales(v.data.map(mapVenda));
        setClientes(c.data.map(mapCliente));
        setVeiculos(ve.data.map(mapVeiculo));
      }
      setLoading(false);
    })();
  }, []);

  const addProduct = async (form) => {
    const code = genCode(nextCode);
    const { data, error } = await supabase.from("produtos").insert({
      code, name: form.name.trim(), description: form.description.trim(), price: Number(form.price) || 0, stock: Number(form.stock) || 0,
    }).select().single();
    if (error) { setErrorMsg("Erro ao salvar produto."); return; }
    setProducts([mapProduto(data), ...products]);
    setNextCode(nextCode + 1);
  };
  const updateProduct = async (id, form) => {
    const payload = { name: form.name.trim(), description: form.description.trim(), price: Number(form.price) || 0, stock: Number(form.stock) || 0 };
    const { error } = await supabase.from("produtos").update(payload).eq("id", id);
    if (error) { setErrorMsg("Erro ao atualizar produto."); return; }
    setProducts(products.map((p) => p.id === id ? { ...p, ...payload } : p));
  };
  const removeProduct = async (id) => {
    const { error } = await supabase.from("produtos").delete().eq("id", id);
    if (error) { setErrorMsg("Erro ao excluir produto."); return; }
    setProducts(products.filter((p) => p.id !== id));
  };

  const addService = async (form) => {
    const payload = { name: form.name.trim(), description: form.description.trim(), price: Number(form.price) || 0 };
    const { data, error } = await supabase.from("servicos").insert(payload).select().single();
    if (error) { setErrorMsg("Erro ao salvar serviço."); return; }
    setServices([mapServico(data), ...services]);
  };
  const updateService = async (id, form) => {
    const payload = { name: form.name.trim(), description: form.description.trim(), price: Number(form.price) || 0 };
    const { error } = await supabase.from("servicos").update(payload).eq("id", id);
    if (error) { setErrorMsg("Erro ao atualizar serviço."); return; }
    setServices(services.map((s) => s.id === id ? { ...s, ...payload } : s));
  };
  const removeService = async (id) => {
    const { error } = await supabase.from("servicos").delete().eq("id", id);
    if (error) { setErrorMsg("Erro ao excluir serviço."); return; }
    setServices(services.filter((s) => s.id !== id));
  };

  const addCliente = async (form) => {
    const payload = { nome: form.nome.trim(), telefone: form.telefone.trim() };
    const { data, error } = await supabase.from("clientes").insert(payload).select().single();
    if (error) { setErrorMsg("Erro ao salvar cliente."); return; }
    setClientes([mapCliente(data), ...clientes]);
  };
  const updateCliente = async (id, form) => {
    const payload = { nome: form.nome.trim(), telefone: form.telefone.trim() };
    const { error } = await supabase.from("clientes").update(payload).eq("id", id);
    if (error) { setErrorMsg("Erro ao atualizar cliente."); return; }
    setClientes(clientes.map((c) => c.id === id ? { ...c, ...payload } : c));
  };
  const removeCliente = async (id) => {
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) { setErrorMsg("Não foi possível excluir: esse cliente tem veículos ou vendas vinculadas."); return; }
    setClientes(clientes.filter((c) => c.id !== id));
    setVeiculos(veiculos.filter((v) => v.clienteId !== id));
  };

  const addVeiculo = async (clienteId, form) => {
    const payload = { cliente_id: clienteId, placa: form.placa.trim().toUpperCase(), marca: form.marca.trim(), modelo: form.modelo.trim(), ano: form.ano.trim() };
    const { data, error } = await supabase.from("veiculos").insert(payload).select().single();
    if (error) { setErrorMsg("Erro ao salvar veículo."); return; }
    setVeiculos([mapVeiculo(data), ...veiculos]);
  };
  const updateVeiculo = async (id, form) => {
    const payload = { placa: form.placa.trim().toUpperCase(), marca: form.marca.trim(), modelo: form.modelo.trim(), ano: form.ano.trim() };
    const { error } = await supabase.from("veiculos").update(payload).eq("id", id);
    if (error) { setErrorMsg("Erro ao atualizar veículo."); return; }
    setVeiculos(veiculos.map((v) => v.id === id ? { ...v, ...payload, placa: payload.placa } : v));
  };
  const removeVeiculo = async (id) => {
    const { error } = await supabase.from("veiculos").delete().eq("id", id);
    if (error) { setErrorMsg("Não foi possível excluir: esse veículo tem vendas vinculadas."); return; }
    setVeiculos(veiculos.filter((v) => v.id !== id));
  };

  const registerSale = async ({ type, itemId, itemName, unitPrice, quantity, payment, clienteId, veiculoId }) => {
    const payload = {
      type, item_id: itemId, item_name: itemName, unit_price: unitPrice, quantity,
      total: unitPrice * quantity, payment, cliente_id: clienteId || null, veiculo_id: veiculoId || null,
    };
    const { data, error } = await supabase.from("vendas").insert(payload).select().single();
    if (error) { setErrorMsg("Erro ao registrar venda."); return; }
    const sale = mapVenda(data);
    setSales([sale, ...sales]);
    if (type === "produto") {
      const prod = products.find((p) => p.id === itemId);
      const newStock = Math.max(0, (prod?.stock || 0) - quantity);
      await supabase.from("produtos").update({ stock: newStock }).eq("id", itemId);
      setProducts(products.map((p) => p.id === itemId ? { ...p, stock: newStock } : p));
    }
    setReceiptSale(sale);
  };

  const removeSale = async (id) => {
    const sale = sales.find((s) => s.id === id);
    const { error } = await supabase.from("vendas").delete().eq("id", id);
    if (error) { setErrorMsg("Erro ao estornar venda."); return; }
    if (sale && sale.type === "produto") {
      const prod = products.find((p) => p.id === sale.itemId);
      if (prod) {
        const newStock = prod.stock + sale.quantity;
        await supabase.from("produtos").update({ stock: newStock }).eq("id", sale.itemId);
        setProducts(products.map((p) => p.id === sale.itemId ? { ...p, stock: newStock } : p));
      }
    }
    setSales(sales.filter((s) => s.id !== id));
  };

  const stats = useMemo(() => {
    const stockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStock = products.filter((p) => p.stock <= 3).length;
    const revenueTotal = sales.reduce((s, x) => s + x.total, 0);
    const revenueByPayment = PAYMENT_METHODS.reduce((acc, m) => {
      acc[m] = sales.filter((s) => s.payment === m).reduce((sum, s) => sum + s.total, 0);
      return acc;
    }, {});
    return { stockValue, lowStock, totalProducts: products.length, totalServices: services.length, totalClientes: clientes.length, revenueTotal, revenueByPayment };
  }, [products, services, sales, clientes]);

  const go = (v) => { setView(v); setMobileNavOpen(false); };

  const navItems = [
    { key: "dashboard", label: "Painel", icon: LayoutGrid },
    { key: "clientes", label: "Clientes", icon: Users },
    { key: "produtos", label: "Produtos", icon: Package },
    { key: "servicos", label: "Serviços", icon: Wrench },
    { key: "vendas", label: "Vendas", icon: ShoppingCart },
  ];

  if (loading) {
    return <div className="app-shell"><div className="main-area"><div className="page"><p className="subheading">Carregando dados...</p></div></div></div>;
  }

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
          {errorMsg && <p className="form-error" style={{ marginBottom: 18 }}>{errorMsg}</p>}
          {view === "dashboard" && <Dashboard stats={stats} setView={setView} sales={sales} />}
          {view === "clientes" && <ClientesPage clientes={clientes} veiculos={veiculos} onAdd={addCliente} onUpdate={updateCliente} onRemove={removeCliente} onAddVeiculo={addVeiculo} onUpdateVeiculo={updateVeiculo} onRemoveVeiculo={removeVeiculo} />}
          {view === "produtos" && <ProductsPage products={products} onAdd={addProduct} onUpdate={updateProduct} onRemove={removeProduct} nextCode={nextCode} onSell={registerSale} clientes={clientes} veiculos={veiculos} />}
          {view === "servicos" && <ServicesPage services={services} onAdd={addService} onUpdate={updateService} onRemove={removeService} onSell={registerSale} clientes={clientes} veiculos={veiculos} />}
          {view === "vendas" && <VendasPage sales={sales} products={products} services={services} clientes={clientes} veiculos={veiculos} onSell={registerSale} onRemove={removeSale} />}
        </div>
      </main>

      {receiptSale && <ReceiptModal sale={receiptSale} clientes={clientes} veiculos={veiculos} onClose={() => setReceiptSale(null)} />}
    </div>
  );
}

function ReceiptModal({ sale, clientes, veiculos, onClose }) {
  const cliente = clientes.find((c) => c.id === sale.clienteId);
  const veiculo = veiculos.find((v) => v.id === sale.veiculoId);
  return (
    <div className="modal-backdrop no-print-hide">
      <div className="receipt-modal">
        <div className="receipt-print-area">
          <p className="receipt-brand">Oficina<span>OS</span></p>
          <p className="receipt-sub">Recibo de venda (comprovante não fiscal)</p>
          <div className="receipt-divider" />
          <p className="receipt-line"><span>Data</span><span>{new Date(sale.date).toLocaleString("pt-BR")}</span></p>
          {cliente && <p className="receipt-line"><span>Cliente</span><span>{cliente.nome}</span></p>}
          {veiculo && <p className="receipt-line"><span>Veículo</span><span>{veiculo.placa} — {veiculo.marca} {veiculo.modelo}</span></p>}
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

function SaleModal({ presetItem, allItems, clientes, veiculos, onClose, onConfirm }) {
  const [itemId, setItemId] = useState(presetItem ? `${presetItem.type}:${presetItem.id}` : "");
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState("Dinheiro");
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [error, setError] = useState("");

  const item = presetItem || (allItems || []).find((i) => `${i.type}:${i.id}` === itemId);
  const total = item ? item.price * quantity : 0;
  const veiculosDoCliente = veiculos.filter((v) => v.clienteId === clienteId);

  const submit = (e) => {
    e.preventDefault();
    if (!item) { setError("Selecione um item."); return; }
    if (item.type === "produto" && quantity > item.stock) { setError(`Estoque insuficiente (disponível: ${item.stock}).`); return; }
    onConfirm({ type: item.type, itemId: item.id, itemName: item.name, unitPrice: item.price, quantity, payment, clienteId: clienteId || null, veiculoId: veiculoId || null });
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
          <label>Cliente (opcional)
            <select value={clienteId} onChange={(e) => { setClienteId(e.target.value); setVeiculoId(""); }}>
              <option value="">Sem cliente</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label>Veículo (opcional)
            <select value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)} disabled={!clienteId}>
              <option value="">Sem veículo</option>
              {veiculosDoCliente.map((v) => <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo}</option>)}
            </select>
          </label>
        </div>

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

function ClientesPage({ clientes, veiculos, onAdd, onUpdate, onRemove, onAddVeiculo, onUpdateVeiculo, onRemoveVeiculo }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyClienteForm);
  const [veiculoModal, setVeiculoModal] = useState(null);
  const [veiculoForm, setVeiculoForm] = useState(emptyVeiculoForm);

  const filtered = clientes.filter((c) => c.nome.toLowerCase().includes(query.toLowerCase()));

  const startEdit = (c) => { setForm({ nome: c.nome, telefone: c.telefone }); setEditItem(c); };
  const closeModal = () => { setOpen(false); setEditItem(null); setForm(emptyClienteForm); };
  const submit = (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return;
    if (editItem) { onUpdate(editItem.id, form); } else { onAdd(form); }
    closeModal();
  };

  const openVeiculoModal = (clienteId, editV) => {
    setVeiculoForm(editV ? { placa: editV.placa, marca: editV.marca, modelo: editV.modelo, ano: editV.ano } : emptyVeiculoForm);
    setVeiculoModal({ clienteId, editItem: editV || null });
  };
  const submitVeiculo = (e) => {
    e.preventDefault();
    if (!veiculoForm.placa.trim()) return;
    if (veiculoModal.editItem) { onUpdateVeiculo(veiculoModal.editItem.id, veiculoForm); } else { onAddVeiculo(veiculoModal.clienteId, veiculoForm); }
    setVeiculoModal(null);
  };

  return (
    <div>
      <div className="page-heading">
        <div><p className="eyebrow">BASE DE CLIENTES</p><h1>Clientes</h1><p className="subheading">Clientes e veículos, com histórico ligado às vendas.</p></div>
        <button className="primary-button" onClick={() => setOpen(true)}><Plus size={17} /> Novo cliente</button>
      </div>
      <div className="table-toolbar">
        <div className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente" /></div>
        <p>{filtered.length} cliente(s)</p>
      </div>

      <div className="clientes-list">
        {filtered.length ? filtered.map((c) => {
          const carros = veiculos.filter((v) => v.clienteId === c.id);
          return (
            <div className="cliente-card" key={c.id}>
              <div className="cliente-header">
                <div><strong>{c.nome}</strong><small>{c.telefone || "Sem telefone"}</small></div>
                <div className="row-actions">
                  <button className="icon-button" title="Editar" onClick={() => startEdit(c)}><Pencil size={15} /></button>
                  <button className="icon-button danger" title="Excluir" onClick={() => onRemove(c.id)}><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="veiculos-list">
                {carros.map((v) => (
                  <div className="veiculo-chip" key={v.id}>
                    <Car size={14} />
                    <span>{v.placa} — {v.marca} {v.modelo} {v.ano && `(${v.ano})`}</span>
                    <button className="icon-button" title="Editar veículo" onClick={() => openVeiculoModal(c.id, v)}><Pencil size={13} /></button>
                    <button className="icon-button danger" title="Excluir veículo" onClick={() => onRemoveVeiculo(v.id)}><Trash2 size={13} /></button>
                  </div>
                ))}
                <button className="add-veiculo-btn" onClick={() => openVeiculoModal(c.id, null)}><Plus size={14} /> Adicionar veículo</button>
              </div>
            </div>
          );
        }) : (
          <div className="empty-services"><Users size={26} />Nenhum cliente cadastrado ainda.</div>
        )}
      </div>

      {(open || editItem) && (
        <div className="modal-backdrop">
          <form className="form-modal" onSubmit={submit}>
            <div className="modal-title"><div><p className="eyebrow">{editItem ? "EDITAR CLIENTE" : "NOVO CLIENTE"}</p><h2>{editItem ? "Editar cliente" : "Cadastrar cliente"}</h2></div><button type="button" className="icon-button" onClick={closeModal}><X size={18} /></button></div>
            <label>Nome<input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></label>
            <label>Telefone<input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></label>
            <button type="submit" className="primary-button full-button">{editItem ? "Salvar alterações" : "Salvar cliente"}</button>
          </form>
        </div>
      )}

      {veiculoModal && (
        <div className="modal-backdrop">
          <form className="form-modal" onSubmit={submitVeiculo}>
            <div className="modal-title"><div><p className="eyebrow">{veiculoModal.editItem ? "EDITAR VEÍCULO" : "NOVO VEÍCULO"}</p><h2>{veiculoModal.editItem ? "Editar veículo" : "Cadastrar veículo"}</h2></div><button type="button" className="icon-button" onClick={() => setVeiculoModal(null)}><X size={18} /></button></div>
            <label>Placa<input required value={veiculoForm.placa} onChange={(e) => setVeiculoForm({ ...veiculoForm, placa: e.target.value })} /></label>
            <div className="form-row">
              <label>Marca<input value={veiculoForm.marca} onChange={(e) => setVeiculoForm({ ...veiculoForm, marca: e.target.value })} /></label>
              <label>Modelo<input value={veiculoForm.modelo} onChange={(e) => setVeiculoForm({ ...veiculoForm, modelo: e.target.value })} /></label>
            </div>
            <label>Ano<input value={veiculoForm.ano} onChange={(e) => setVeiculoForm({ ...veiculoForm, ano: e.target.value })} /></label>
            <button type="submit" className="primary-button full-button">{veiculoModal.editItem ? "Salvar alterações" : "Salvar veículo"}</button>
          </form>
        </div>
      )}
    </div>
  );
}

function ProductsPage({ products, onAdd, onUpdate, onRemove, nextCode, onSell, clientes, veiculos }) {
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
        <SaleModal presetItem={sellItem} clientes={clientes} veiculos={veiculos} onClose={() => setSellItem(null)} onConfirm={(sale) => { onSell(sale); setSellItem(null); }} />
      )}
    </div>
  );
}

function ServicesPage({ services, onAdd, onUpdate, onRemove, onSell, clientes, veiculos }) {
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
        <SaleModal presetItem={sellItem} clientes={clientes} veiculos={veiculos} onClose={() => setSellItem(null)} onConfirm={(sale) => { onSell(sale); setSellItem(null); }} />
      )}
    </div>
  );
}

function VendasPage({ sales, products, services, clientes, veiculos, onSell, onRemove }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [viewReceipt, setViewReceipt] = useState(null);
  const allItems = [
    ...products.map((p) => ({ type: "produto", id: p.id, name: p.name, price: p.price, stock: p.stock })),
    ...services.map((s) => ({ type: "servico", id: s.id, name: s.name, price: s.price })),
  ];
  const filtered = sales.filter((s) => s.itemName.toLowerCase().includes(query.toLowerCase()));
  const total = sales.reduce((sum, s) => sum + s.total, 0);
  const clienteNome = (id) => clientes.find((c) => c.id === id)?.nome;

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
          <thead><tr><th>Item</th><th>Cliente</th><th>Qtd.</th><th>Pagamento</th><th>Total</th><th></th></tr></thead>
          <tbody>
            {filtered.length ? filtered.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.itemName}</strong><small>{new Date(s.date).toLocaleString("pt-BR")}</small></td>
                <td>{clienteNome(s.clienteId) || "—"}</td>
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
        <SaleModal allItems={allItems} clientes={clientes} veiculos={veiculos} onClose={() => setOpen(false)} onConfirm={(sale) => { onSell(sale); setOpen(false); }} />
      )}

      {viewReceipt && <ReceiptModal sale={viewReceipt} clientes={clientes} veiculos={veiculos} onClose={() => setViewReceipt(null)} />}
    </div>
  );
}
