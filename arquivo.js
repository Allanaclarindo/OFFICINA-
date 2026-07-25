import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid, Package, Wrench, Plus, Search, Trash2, X,
  Boxes, Receipt, TrendingUp, AlertTriangle, Menu,
} from "lucide-react";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const PRODUCTS_KEY = "oficina-produtos";
const SERVICES_KEY = "oficina-servicos";

const emptyProductForm = { name: "", description: "", price: "", stock: "" };
const emptyServiceForm = { name: "", description: "", price: "" };

function genCode(nextCode) {
  return `OF-${String(nextCode).padStart(5, "0")}`;
}

export default function OficinaSystem() {
  const [view, setView] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [nextCode, setNextCode] = useState(1);
  const [services, setServices] = useState([]);
  const [ready, setReady] = useState(false);
  const [storeError, setStoreError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const p = await window.storage.get(PRODUCTS_KEY, false);
        if (p) {
          const parsed = JSON.parse(p.value);
          setProducts(parsed.items || []);
          setNextCode(parsed.nextCode || 1);
        }
      } catch (e) { /* no data yet */ }
      try {
        const s = await window.storage.get(SERVICES_KEY, false);
        if (s) setServices(JSON.parse(s.value));
      } catch (e) { /* no data yet */ }
      setReady(true);
    })();
  }, []);

  const persistProducts = async (items, nc) => {
    try {
      await window.storage.set(PRODUCTS_KEY, JSON.stringify({ items, nextCode: nc }), false);
    } catch { setStoreError("Não foi possível salvar os produtos."); }
  };
  const persistServices = async (items) => {
    try {
      await window.storage.set(SERVICES_KEY, JSON.stringify(items), false);
    } catch { setStoreError("Não foi possível salvar os serviços."); }
  };

  const addProduct = (form) => {
    const code = genCode(nextCode);
    const item = {
      id: crypto.randomUUID(), code,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
    };
    const items = [item, ...products];
    setProducts(items); setNextCode(nextCode + 1);
    persistProducts(items, nextCode + 1);
  };
  const removeProduct = (id) => {
    const items = products.filter((p) => p.id !== id);
    setProducts(items); persistProducts(items, nextCode);
  };

  const addService = (form) => {
    const item = { id: crypto.randomUUID(), name: form.name.trim(), description: form.description.trim(), price: Number(form.price) || 0 };
    const items = [item, ...services];
    setServices(items); persistServices(items);
  };
  const removeService = (id) => {
    const items = services.filter((s) => s.id !== id);
    setServices(items); persistServices(items);
  };

  const stats = useMemo(() => {
    const stockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStock = products.filter((p) => p.stock <= 3).length;
    const avgServicePrice = services.length ? services.reduce((s, x) => s + x.price, 0) / services.length : 0;
    return { stockValue, lowStock, avgServicePrice, totalProducts: products.length, totalServices: services.length };
  }, [products, services]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f3]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');
        .display-font { font-family: 'Cabinet Grotesk', sans-serif; }
        .barcode-chip { background: repeating-linear-gradient(90deg,#111 0 2px,#fff 2px 3px); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px);} to {opacity:1; transform:translateY(0);} }
        .fade-up { animation: fadeUp .35s ease both; }
      `}</style>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex w-60 shrink-0 min-h-screen flex-col fixed inset-y-0 left-0 border-r border-[#222] bg-[#101010] px-4 py-7">
          <div className="flex items-center gap-2 px-2 pb-10">
            <Wrench size={20} className="text-[#ff5722]" />
            <span className="display-font text-lg font-black">Oficina<span className="text-[#ff5722]">OS</span></span>
          </div>
          <nav className="grid gap-1.5">
            <NavButton icon={<LayoutGrid size={17} />} label="Painel" active={view === "dashboard"} onClick={() => setView("dashboard")} />
            <NavButton icon={<Package size={17} />} label="Produtos" active={view === "produtos"} onClick={() => setView("produtos")} />
            <NavButton icon={<Wrench size={17} />} label="Serviços" active={view === "servicos"} onClick={() => setView("servicos")} />
          </nav>
          <div className="mt-auto pt-4 border-t border-[#222] flex items-center gap-2 text-[11px] text-[#8b8b8b]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#55d68c] inline-block" />
            Uso interno da equipe
          </div>
        </aside>

        {/* Mobile top bar */}
        <div className="md:hidden fixed top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4 bg-[#101010] border-b border-[#222]">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-[#ff5722]" />
            <span className="display-font font-black">Oficina<span className="text-[#ff5722]">OS</span></span>
          </div>
          <button onClick={() => setMobileNavOpen(true)} className="text-[#ccc]"><Menu size={22} /></button>
        </div>
        {mobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-black/80 flex flex-col p-6" onClick={() => setMobileNavOpen(false)}>
            <div className="flex justify-end mb-8"><X size={24} /></div>
            <nav className="grid gap-2 text-lg">
              <NavButton icon={<LayoutGrid size={18} />} label="Painel" active={view === "dashboard"} onClick={() => { setView("dashboard"); setMobileNavOpen(false); }} />
              <NavButton icon={<Package size={18} />} label="Produtos" active={view === "produtos"} onClick={() => { setView("produtos"); setMobileNavOpen(false); }} />
              <NavButton icon={<Wrench size={18} />} label="Serviços" active={view === "servicos"} onClick={() => { setView("servicos"); setMobileNavOpen(false); }} />
            </nav>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 md:ml-60 pt-20 md:pt-0">
          <div className="max-w-6xl mx-auto px-6 md:px-14 py-10 md:py-14">
            {storeError && <p className="text-[#ff827c] text-xs mb-5">{storeError}</p>}
            {!ready ? (
              <p className="text-[#8d8d8d] text-sm">Carregando...</p>
            ) : view === "dashboard" ? (
              <Dashboard stats={stats} setView={setView} />
            ) : view === "produtos" ? (
              <ProductsPage products={products} onAdd={addProduct} onRemove={removeProduct} nextCode={nextCode} />
            ) : (
              <ServicesPage services={services} onAdd={addService} onRemove={removeService} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors w-full text-left ${
        active ? "bg-[#1b1b1b] text-white shadow-[inset_2px_0_0_#ff5722]" : "text-[#9b9b9b] hover:bg-[#161616] hover:text-white"
      }`}
    >
      {icon}{label}
    </button>
  );
}

function Dashboard({ stats, setView }) {
  return (
    <div className="fade-up">
      <p className="text-[#ff5722] text-[10px] font-semibold tracking-widest mb-2">VISÃO GERAL</p>
      <h1 className="display-font font-black text-4xl md:text-5xl mb-10">Painel da oficina</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Metric icon={<Boxes size={18} />} tone="orange" label="Produtos cadastrados" value={stats.totalProducts} />
        <Metric icon={<Wrench size={18} />} tone="blue" label="Serviços cadastrados" value={stats.totalServices} />
        <Metric icon={<TrendingUp size={18} />} tone="green" label="Valor em estoque" value={money.format(stats.stockValue)} />
        <Metric icon={<AlertTriangle size={18} />} tone="yellow" label="Itens com estoque baixo" value={stats.lowStock} />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-3 mt-3">
        <div className="min-h-[220px] bg-[#161311] border border-[#3d251b] p-8 relative overflow-hidden">
          <p className="text-[#ff5722] text-[10px] font-semibold tracking-widest mb-3">PRÓXIMO PASSO</p>
          <h2 className="display-font font-bold text-2xl md:text-3xl max-w-md mb-3">Mantenha o estoque e os serviços sempre atualizados</h2>
          <p className="text-[#aaa] text-sm max-w-md leading-relaxed mb-5">Cada peça cadastrada recebe um código interno automático, pronto para etiqueta. Serviços ficam com nome, descrição e preço, sem burocracia.</p>
          <button onClick={() => setView("produtos")} className="inline-flex items-center gap-2 bg-[#ff5722] hover:bg-[#ff6e42] px-4 h-10 rounded text-sm font-semibold">
            <Plus size={16} /> Cadastrar produto
          </button>
        </div>
        <div className="bg-[#111] border border-[#252525] p-7">
          <p className="text-[#8d8d8d] text-xs mb-1">Preço médio por serviço</p>
          <p className="display-font font-black text-3xl mb-6">{money.format(stats.avgServicePrice)}</p>
          <a onClick={() => setView("servicos")} className="flex items-center gap-3 pt-4 border-t border-[#222] text-[#ddd] hover:text-[#ff7043] cursor-pointer text-sm">
            <Receipt size={17} /> Ver todos os serviços
          </a>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, tone, label, value }) {
  const tones = {
    orange: "text-[#ff7043] bg-[#3b1c13]", blue: "text-[#7cb4ff] bg-[#15263c]",
    green: "text-[#59d59a] bg-[#143426]", yellow: "text-[#f5c562] bg-[#3a3016]",
  };
  return (
    <div className="border border-[#252525] bg-[#111] p-5 min-h-[150px] flex flex-col">
      <div className={`w-9 h-9 rounded grid place-items-center mb-auto ${tones[tone]}`}>{icon}</div>
      <p className="text-[#969696] text-xs mt-4 mb-1">{label}</p>
      <strong className="display-font font-extrabold text-2xl">{value}</strong>
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
    <div className="fade-up">
      <Header eyebrow="ESTOQUE" title="Produtos" subtitle="Peças e itens com código interno gerado automaticamente." onNew={() => setOpen(true)} newLabel="Novo produto" />

      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5 h-11 max-w-sm flex-1 border border-[#292929] bg-[#111] px-3">
          <Search size={17} className="text-[#858585]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto" className="bg-transparent outline-none text-sm w-full text-[#eee]" />
        </div>
        <p className="text-[#8d8d8d] text-xs shrink-0">{filtered.length} produto(s)</p>
      </div>

      <div className="overflow-x-auto border border-[#252525] bg-[#111]">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="bg-[#151515] text-[#858585] text-[10px] tracking-widest uppercase">
              <th className="text-left font-semibold px-5 py-4">Código</th>
              <th className="text-left font-semibold px-5 py-4">Produto</th>
              <th className="text-left font-semibold px-5 py-4">Preço</th>
              <th className="text-left font-semibold px-5 py-4">Estoque</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map((p) => (
              <tr key={p.id} className="border-t border-[#222]">
                <td className="px-5 py-4"><span className="barcode-chip inline-block px-1.5 py-1 text-black text-[10px] font-mono">{p.code}</span></td>
                <td className="px-5 py-4"><strong className="block text-[#f5f5f5] mb-0.5">{p.name}</strong><small className="text-[#898989] text-xs">{p.description || "Sem descrição"}</small></td>
                <td className="px-5 py-4 text-sm">{money.format(p.price)}</td>
                <td className="px-5 py-4"><span className={`text-xs px-2 py-1 border ${p.stock <= 3 ? "border-[#5b2724] text-[#ff8b83] bg-[#2a1514]" : "border-[#303030] bg-[#1b1b1b]"}`}>{p.stock} un.</span></td>
                <td className="px-5 py-4 text-right"><button onClick={() => onRemove(p.id)} className="w-8 h-8 border border-[#2d2d2d] bg-[#181818] text-[#aaa] hover:text-[#ff6b61] hover:bg-[#2a1514] hover:border-[#5b2724] grid place-items-center rounded"><Trash2 size={15} /></button></td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="text-center py-16 text-[#868686]"><Package size={26} className="inline mr-2 align-middle" />Nenhum produto cadastrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="Cadastrar produto" eyebrow="NOVA PEÇA" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="grid gap-4">
            <p className="flex items-center gap-2 text-[11px] text-[#929292] border border-[#2a2a2a] bg-[#101010] px-3 py-2.5">
              <Boxes size={14} /> Código interno gerado automaticamente: <span className="font-mono text-[#ddd]">{genCode(nextCode)}</span>
            </p>
            <Field label="Nome do produto"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field-input" /></Field>
            <Field label="Descrição"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field-input min-h-[70px]" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço (R$)"><input required type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="field-input" /></Field>
              <Field label="Estoque"><input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="field-input" /></Field>
            </div>
            <button type="submit" className="w-full h-11 bg-[#ff5722] hover:bg-[#ff6e42] rounded text-sm font-semibold mt-2">Salvar produto</button>
          </form>
        </Modal>
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
    <div className="fade-up">
      <Header eyebrow="MÃO DE OBRA" title="Serviços" subtitle="Nome, descrição e preço — sem burocracia extra." onNew={() => setOpen(true)} newLabel="Novo serviço" />

      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5 h-11 max-w-sm flex-1 border border-[#292929] bg-[#111] px-3">
          <Search size={17} className="text-[#858585]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar serviço" className="bg-transparent outline-none text-sm w-full text-[#eee]" />
        </div>
        <p className="text-[#8d8d8d] text-xs shrink-0">{filtered.length} serviço(s)</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length ? filtered.map((s) => (
          <article key={s.id} className="min-h-[210px] p-6 border border-[#252525] bg-[#111] relative hover:border-[#68402c] hover:-translate-y-0.5 transition-all">
            <Wrench size={18} className="text-[#ff7043]" />
            <button onClick={() => onRemove(s.id)} className="absolute right-4 top-4 w-8 h-8 border border-[#2d2d2d] bg-[#181818] text-[#aaa] hover:text-[#ff6b61] hover:bg-[#2a1514] hover:border-[#5b2724] grid place-items-center rounded"><Trash2 size={15} /></button>
            <p className="text-[#ff7043] font-semibold text-sm mt-7 mb-1.5">{money.format(s.price)}</p>
            <h2 className="display-font font-bold text-xl mb-2">{s.name}</h2>
            <p className="text-[#999] text-xs leading-relaxed">{s.description || "Sem descrição cadastrada."}</p>
          </article>
        )) : (
          <div className="sm:col-span-2 lg:col-span-3 border border-dashed border-[#333] min-h-[190px] grid place-content-center justify-items-center gap-2 text-[#858585] text-sm">
            <Wrench size={26} />Nenhum serviço cadastrado ainda.
          </div>
        )}
      </div>

      {open && (
        <Modal title="Cadastrar serviço" eyebrow="NOVA MÃO DE OBRA" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="grid gap-4">
            <Field label="Nome do serviço"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field-input" /></Field>
            <Field label="Descrição"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field-input min-h-[70px]" /></Field>
            <Field label="Preço (R$)"><input required type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="field-input" /></Field>
            <button type="submit" className="w-full h-11 bg-[#ff5722] hover:bg-[#ff6e42] rounded text-sm font-semibold mt-2">Salvar serviço</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Header({ eyebrow, title, subtitle, onNew, newLabel }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-9">
      <div>
        <p className="text-[#ff5722] text-[10px] font-semibold tracking-widest mb-2">{eyebrow}</p>
        <h1 className="display-font font-black text-4xl md:text-5xl leading-none mb-2.5">{title}</h1>
        <p className="text-[#949494] text-sm">{subtitle}</p>
      </div>
      <button onClick={onNew} className="inline-flex items-center justify-center gap-2 h-11 px-4 bg-[#ff5722] hover:bg-[#ff6e42] rounded text-sm font-semibold w-full md:w-auto">
        <Plus size={17} /> {newLabel}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-xs text-[#b5b5b5]">
      {label}
      {children}
    </label>
  );
}

function Modal({ title, eyebrow, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center p-6 bg-black/75">
      <div className="w-full max-w-md p-6 bg-[#141414] border border-[#333] shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[#ff5722] text-[10px] font-semibold tracking-widest mb-2">{eyebrow}</p>
            <h2 className="display-font font-bold text-2xl">{title}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 border border-[#2d2d2d] bg-[#181818] text-[#aaa] hover:text-white grid place-items-center rounded"><X size={18} /></button>
        </div>
        {children}
      </div>
      <style>{`.field-input{ color:#f6f6f6; background:#0d0d0d; border:1px solid #303030; padding:10px 12px; outline:none; border-radius:2px; font-size:14px; } .field-input:focus{ border-color:#ff5722; }`}</style>
    </div>
  );
}
