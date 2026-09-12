import React, { useState, useEffect, useCallback } from "react";
import {
  Cake, CakeSlice, Candy, Cookie, Croissant, Plus, Minus, Pencil, Trash2,
  Lock, LogOut, X, Check, Phone, Instagram, MapPin, Clock,
  ShoppingBag, Settings, Package, Bike, Store, Receipt, Mail, KeyRound
} from "lucide-react";
import { supabase } from "./lib/supabase.js";

const CATEGORIES = ["Bolos", "Tortas", "Doces finos", "Cupcakes"];

const CATEGORY_ICON = {
  "Bolos": Cake,
  "Tortas": CakeSlice,
  "Doces finos": Candy,
  "Cupcakes": Cookie,
};

const ACCENTS = {
  vinho: { bg: "#7A2E3A", soft: "#F3E1E4" },
  dourado: { bg: "#B9812E", soft: "#F6ECD8" },
  rosa: { bg: "#B4536E", soft: "#F6E2E8" },
  verde: { bg: "#5C6E4A", soft: "#E9EDE1" },
};

const PAYMENT_OPTIONS = [
  { key: "dinheiro", label: "Dinheiro", feeKey: null },
  { key: "pix", label: "Pix", feeKey: "fee_pix" },
  { key: "debito", label: "Cartão de débito", feeKey: "fee_debito" },
  { key: "credito", label: "Cartão de crédito", feeKey: "fee_credito" },
];

function formatPrice(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function digitsOnly(str) {
  return (str || "").replace(/\D/g, "");
}

function formatDateInput(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getMinOrderDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return formatDateInput(d);
}

function isSunday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay() === 0;
}

function orderPrefix(name) {
  const letters = (name || "").replace(/[^A-Za-zÀ-ÿ]/g, "").toUpperCase();
  return letters.slice(0, 2) || "PD";
}

function formatOrderNumber(name, n) {
  return `${orderPrefix(name)}-${String(n).padStart(4, "0")}`;
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// ---------- Dados: produtos, configurações e sessão via Supabase ----------

function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, loadingSession: loading };
}

function useProducts(session) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: true });
    if (!error) setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh, session]);

  return { products, loadingProducts: loading, refreshProducts: refresh };
}

function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
    if (!error) setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { settings, loadingSettings: loading, refreshSettings: refresh };
}

function useOrders(session) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!session) { setOrders([]); return; }
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (!error) setOrders(data || []);
    setLoading(false);
  }, [session]);

  useEffect(() => { refresh(); }, [refresh]);

  return { orders, loadingOrders: loading, refreshOrders: refresh };
}

// ---------- Componentes visuais ----------

function Logo({ name, size = 34 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%", background: "#7A2E3A",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Cake size={size * 0.55} color="#F0C6CE" strokeWidth={1.6} />
      </div>
      <span style={{
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 21, fontStyle: "italic",
        color: "#2B2320", letterSpacing: "-0.01em",
      }}>
        {name}
      </span>
    </div>
  );
}

function Header({ settings, onNav, cartCount, onCartClick }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 20, background: "#FBF6F0",
      borderBottom: "1px solid #E8DDD1", padding: "16px 6vw",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <Logo name={settings.name} />
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <nav style={{ display: "flex", gap: 26 }} className="hide-mobile">
          {["Cardápio", "Nossa história", "Encomendas"].map((label) => (
            <button key={label} onClick={() => onNav(label)} style={navLinkStyle}>
              {label}
            </button>
          ))}
        </nav>
        <button onClick={onCartClick} aria-label="Ver carrinho" style={{
          position: "relative", background: "none", border: "1px solid #E8DDD1",
          borderRadius: 8, padding: 9, cursor: "pointer", display: "flex",
        }}>
          <ShoppingBag size={19} color="#2B2320" strokeWidth={1.7} />
          {cartCount > 0 && (
            <span style={{
              position: "absolute", top: -6, right: -6, background: "#7A2E3A", color: "#FBF6F0",
              fontSize: 11, fontFamily: "'Public Sans', sans-serif", borderRadius: 999,
              minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px", fontWeight: 600,
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

const navLinkStyle = {
  background: "none", border: "none", cursor: "pointer",
  fontFamily: "'Public Sans', sans-serif", fontSize: 15, color: "#4A3F38",
  padding: 0,
};

function Hero({ onCta }) {
  return (
    <section style={{ padding: "72px 6vw 64px", display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 380px", minWidth: 280 }}>
        <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 15, color: "#B9812E", margin: "0 0 14px", fontWeight: 600 }}>
          Feito à mão, todos os dias
        </p>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: "clamp(34px, 5vw, 54px)",
          lineHeight: 1.08, color: "#2B2320", margin: "0 0 22px", maxWidth: 520,
        }}>
          Doces que a Liz faria questão de servir na própria mesa
        </h1>
        <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 17, lineHeight: 1.65, color: "#5B5049", maxWidth: 460, margin: "0 0 32px" }}>
          Bolos, tortas e doces finos preparados em pequenas quantidades, com
          ingredientes de verdade e sem pressa. Monte seu pedido, escolha
          retirada ou entrega, e finalize direto pelo WhatsApp.
        </p>
        <button onClick={onCta} style={{
          fontFamily: "'Public Sans', sans-serif", fontSize: 16, fontWeight: 600,
          background: "#7A2E3A", color: "#FBF6F0", border: "none",
          padding: "14px 30px", borderRadius: 4, cursor: "pointer",
        }}>
          Ver cardápio
        </button>
      </div>
      <div style={{ flex: "1 1 300px", minWidth: 260, display: "flex", justifyContent: "center" }}>
        <CakeIllustration />
      </div>
    </section>
  );
}

function CakeIllustration() {
  return (
    <svg width="300" height="300" viewBox="0 0 300 300" aria-hidden="true">
      <ellipse cx="150" cy="252" rx="108" ry="14" fill="#F0E4D6" />
      <rect x="60" y="180" width="180" height="62" rx="6" fill="#F6ECD8" stroke="#E8DDD1" />
      <rect x="78" y="126" width="144" height="58" rx="6" fill="#F3E1E4" stroke="#E8DDD1" />
      <rect x="96" y="76" width="108" height="54" rx="6" fill="#7A2E3A" />
      <path d="M96 90 Q150 78 204 90" stroke="#F0C6CE" strokeWidth="4" fill="none" />
      <path d="M78 140 Q150 126 222 140" stroke="#B9812E" strokeWidth="4" fill="none" />
      <path d="M60 194 Q150 178 240 194" stroke="#B4536E" strokeWidth="4" fill="none" />
      <circle cx="150" cy="68" r="5" fill="#B9812E" />
      <rect x="147" y="40" width="6" height="30" rx="3" fill="#5B5049" />
      <path d="M150 40 Q158 26 150 14 Q142 26 150 40 Z" fill="#E8A23A" />
      {[105, 135, 165, 195].map((x, i) => (
        <circle key={i} cx={x} cy="102" r="5" fill={i % 2 ? "#B4536E" : "#B9812E"} />
      ))}
    </svg>
  );
}

function MenuSection({ products, activeCategory, setActiveCategory, id, onAdd, cartMap }) {
  const visible = products.filter((p) => p.published && (activeCategory === "Todos" || p.category === activeCategory));
  return (
    <section id={id} style={{ padding: "48px 6vw 72px" }}>
      <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 32, color: "#2B2320", margin: "0 0 8px" }}>Cardápio</h2>
      <p style={{ fontFamily: "'Public Sans', sans-serif", color: "#5B5049", margin: "0 0 32px", maxWidth: 480 }}>
        Tudo feito por encomenda, com pelo menos 48h de antecedência. Adicione ao carrinho e finalize pelo WhatsApp.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
        {["Todos", ...CATEGORIES].map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            fontFamily: "'Public Sans', sans-serif", fontSize: 14, padding: "9px 18px", borderRadius: 999, cursor: "pointer",
            border: cat === activeCategory ? "1px solid #7A2E3A" : "1px solid #E8DDD1",
            background: cat === activeCategory ? "#7A2E3A" : "transparent",
            color: cat === activeCategory ? "#FBF6F0" : "#4A3F38",
          }}>
            {cat}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p style={{ fontFamily: "'Public Sans', sans-serif", color: "#8A7E74" }}>Nenhum produto nessa categoria no momento.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
          {visible.map((p) => {
            const Icon = CATEGORY_ICON[p.category] || Croissant;
            const accent = ACCENTS[p.accent] || ACCENTS.vinho;
            const qtyInCart = cartMap[p.id] || 0;
            return (
              <div key={p.id} style={{ border: "1px solid #E8DDD1", borderRadius: 10, padding: 22, display: "flex", flexDirection: "column", gap: 12, background: "#fff" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: accent.soft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={22} color={accent.bg} strokeWidth={1.6} />
                </div>
                <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 19, color: "#2B2320", margin: 0 }}>{p.name}</h3>
                <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 14, color: "#5B5049", margin: 0, lineHeight: 1.55, flex: 1 }}>{p.description}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 17, fontWeight: 600, color: "#2B2320", margin: 0 }}>{formatPrice(p.price)}</p>
                  <button onClick={() => onAdd(p)} style={{
                    background: "#7A2E3A", color: "#FBF6F0", border: "none", borderRadius: 6, padding: "8px 14px",
                    fontFamily: "'Public Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Plus size={14} /> {qtyInCart > 0 ? `Adicionado (${qtyInCart})` : "Adicionar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AboutSection({ id }) {
  return (
    <section id={id} style={{ padding: "48px 6vw 72px", background: "#F6ECE0" }}>
      <div style={{ display: "flex", gap: 48, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 320px", minWidth: 260 }}>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 30, color: "#2B2320", margin: "0 0 18px" }}>Nossa história</h2>
          <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: "#5B5049", maxWidth: 480, margin: "0 0 16px" }}>
            A confeitaria começou na cozinha de casa, testando receitas de família
            aos fins de semana. Hoje viramos um pequeno ateliê, mas o jeito de
            fazer continua o mesmo: pouca quantidade, ingredientes bons e tempo
            para fazer direito.
          </p>
          <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: "#5B5049", maxWidth: 480 }}>
            Cada encomenda é feita na hora, não existe estoque parado no congelador.
          </p>
        </div>
        <div style={{ flex: "1 1 260px", minWidth: 220, display: "flex", justifyContent: "center" }}>
          <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
            <circle cx="110" cy="110" r="100" fill="#F3E1E4" />
            <circle cx="110" cy="92" r="34" fill="#7A2E3A" />
            <path d="M60 190 Q110 130 160 190 Z" fill="#7A2E3A" />
          </svg>
        </div>
      </div>
    </section>
  );
}

function ContactSection({ id, settings }) {
  return (
    <section id={id} style={{ padding: "56px 6vw 72px" }}>
      <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 30, color: "#2B2320", margin: "0 0 12px" }}>Encomendas</h2>
      <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 16, color: "#5B5049", margin: "0 0 32px", maxWidth: 480 }}>
        Monte seu pedido no cardápio, escolha retirada ou entrega, e finalize pelo WhatsApp.
        Pedidos precisam de pelo menos 48h de antecedência.
      </p>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        <ContactItem icon={Phone} label={settings.phone} />
        <ContactItem icon={Instagram} label={"@" + settings.instagram} />
        <ContactItem icon={MapPin} label={settings.address} />
        <ContactItem icon={Clock} label="Ter a sáb, 10h às 18h" />
      </div>
    </section>
  );
}

function ContactItem({ icon: Icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Icon size={19} color="#B9812E" strokeWidth={1.7} />
      <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 15, color: "#4A3F38" }}>{label}</span>
    </div>
  );
}

function Footer({ settings, onAdminClick }) {
  return (
    <footer style={{ padding: "24px 6vw", borderTop: "1px solid #E8DDD1", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
      <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 13, color: "#8A7E74" }}>{settings.name}, feita com carinho.</span>
      <button onClick={onAdminClick} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#8A7E74", fontFamily: "'Public Sans', sans-serif", fontSize: 13 }}>
        <Lock size={13} strokeWidth={1.7} /> Área do administrador
      </button>
    </footer>
  );
}

function field(label, node) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "'Public Sans', sans-serif", fontSize: 13, color: "#5B5049" }}>
      {label}
      {node}
    </label>
  );
}

const inputStyle = {
  padding: "10px 12px", borderRadius: 6, border: "1px solid #E8DDD1",
  fontFamily: "'Public Sans', sans-serif", fontSize: 14, boxSizing: "border-box", width: "100%",
};

const qtyBtnStyle = {
  width: 24, height: 24, borderRadius: 6, border: "1px solid #E8DDD1", background: "none",
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
};

const iconBtnStyle = {
  background: "none", border: "1px solid #E8DDD1", borderRadius: 6, padding: 8,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
};

function CartDrawer({ open, onClose, cart, updateQty, removeItem, settings, clearCart, onCreateOrder }) {
  const [step, setStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState("retirada");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [payment, setPayment] = useState("dinheiro");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const minOrderDate = getMinOrderDate();

  const handleDateChange = (raw) => {
    if (!raw) { setDesiredDate(""); setDateError(""); return; }
    if (raw < minOrderDate) { setDesiredDate(""); setDateError("Pedidos precisam de pelo menos 48h de antecedência."); return; }
    if (isSunday(raw)) { setDesiredDate(""); setDateError("Não atendemos aos domingos. Escolha outro dia."); return; }
    setDateError("");
    setDesiredDate(raw);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const feePercent = payment === "dinheiro" ? 0 : (settings[PAYMENT_OPTIONS.find((o) => o.key === payment).feeKey] || 0);
  const feeAmount = subtotal * (feePercent / 100);
  const deliveryFee = deliveryType === "entrega" ? settings.delivery_fee : 0;
  const total = subtotal + feeAmount + deliveryFee;
  const paymentLabel = PAYMENT_OPTIONS.find((o) => o.key === payment).label;

  const close = () => { onClose(); setStep(1); setError(""); setSent(false); };
  const goToCheckout = () => {
    if (cart.length === 0) { setError("Seu carrinho está vazio."); return; }
    setError("");
    setStep(2);
  };

  const buildMessage = (orderNum) => {
    const lines = [];
    lines.push(`Olá, ${settings.name}! Gostaria de fazer o pedido ${formatOrderNumber(settings.name, orderNum)}:`);
    lines.push("");
    cart.forEach((item) => lines.push(`- ${item.qty}x ${item.name} — ${formatPrice(item.price * item.qty)}`));
    lines.push("");
    if (deliveryType === "entrega") {
      lines.push(`Tipo: entrega`);
      lines.push(`Endereço de entrega: ${deliveryAddress}`);
      lines.push(`Frete estimado: ${formatPrice(settings.delivery_fee)} (${settings.delivery_note})`);
    } else {
      lines.push(`Tipo: retirada no local (${settings.address})`);
    }
    lines.push("");
    lines.push(`Subtotal: ${formatPrice(subtotal)}`);
    lines.push(feePercent > 0
      ? `Forma de pagamento: ${paymentLabel} (taxa de ${feePercent}%: ${formatPrice(feeAmount)})`
      : `Forma de pagamento: ${paymentLabel}`);
    if (payment === "pix" && settings.pix_key && settings.pix_key.trim()) {
      lines.push(`Chave Pix para pagamento: ${settings.pix_key}`);
    }
    if (deliveryType === "entrega") lines.push(`Frete: ${formatPrice(deliveryFee)}`);
    lines.push(`Total: ${formatPrice(total)}`);
    lines.push("");
    lines.push(`Nome: ${customerName}`);
    lines.push(`Telefone: ${customerPhone}`);
    lines.push(`Data desejada: ${desiredDate}`);
    if (notes.trim()) lines.push(`Observações: ${notes}`);
    return lines.join("\n");
  };

  const send = async () => {
    if (!customerName.trim()) { setError("Informe seu nome."); return; }
    if (!customerPhone.trim()) { setError("Informe seu telefone para contato."); return; }
    if (!desiredDate) { setError("Escolha a data desejada para o pedido."); return; }
    if (deliveryType === "entrega" && !deliveryAddress.trim()) { setError("Informe o endereço de entrega."); return; }
    setError("");
    setSending(true);
    const preOpenedWindow = window.open("", "_blank");
    try {
      const orderPayload = {
        items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        subtotal, fee_percent: feePercent, fee_amount: feeAmount,
        delivery_type: deliveryType, delivery_address: deliveryType === "entrega" ? deliveryAddress : null,
        delivery_fee: deliveryFee, payment_method: payment, total,
        customer_name: customerName, customer_phone: customerPhone,
        desired_date: desiredDate, notes: notes.trim() || null,
      };
      const orderNum = await onCreateOrder(orderPayload);
      const number = "55" + digitsOnly(settings.whatsapp);
      const url = `https://wa.me/${number}?text=${encodeURIComponent(buildMessage(orderNum))}`;
      if (preOpenedWindow) preOpenedWindow.location.href = url;
      else window.open(url, "_blank", "noopener,noreferrer");
      setOrderNumber(orderNum);
      setSent(true);
      clearCart();
    } catch (e) {
      if (preOpenedWindow) preOpenedWindow.close();
      setError("Não foi possível registrar o pedido agora. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(43,35,32,0.4)", zIndex: 40, display: "flex", justifyContent: "flex-end" }} onClick={close}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "min(420px, 100%)", height: "100%", background: "#FBF6F0", overflowY: "auto",
        padding: "28px 26px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 18,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, margin: 0, color: "#2B2320" }}>
            {sent ? "Pedido enviado" : step === 1 ? "Seu carrinho" : "Finalizar pedido"}
          </h2>
          <button onClick={close} aria-label="Fechar carrinho" style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} color="#4A3F38" />
          </button>
        </div>

        {sent ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, color: "#7A2E3A", margin: 0 }}>
              Pedido {formatOrderNumber(settings.name, orderNumber)}
            </p>
            <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 15, color: "#5B5049", lineHeight: 1.6, margin: 0 }}>
              Abrimos o WhatsApp com os detalhes do seu pedido. É só conferir e enviar a mensagem por lá para confirmar com a gente. Guarde o número do pedido.
            </p>
            <button onClick={close} style={{ background: "#7A2E3A", color: "#FBF6F0", border: "none", padding: "12px", borderRadius: 6, fontFamily: "'Public Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Fechar
            </button>
          </div>
        ) : step === 1 ? (
          <>
            {cart.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0", color: "#8A7E74" }}>
                <ShoppingBag size={30} strokeWidth={1.5} />
                <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 14, margin: 0 }}>Seu carrinho está vazio.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #E8DDD1", paddingBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, margin: 0, color: "#2B2320" }}>{item.name}</p>
                      <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 13, color: "#8A7E74", margin: "2px 0 0" }}>{formatPrice(item.price)} cada</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Diminuir quantidade" style={qtyBtnStyle}><Minus size={13} /></button>
                      <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 14, minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Aumentar quantidade" style={qtyBtnStyle}><Plus size={13} /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} aria-label="Remover item" style={{ background: "none", border: "none", cursor: "pointer" }}>
                      <Trash2 size={16} color="#8A7E74" />
                    </button>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Public Sans', sans-serif", fontSize: 16, fontWeight: 600, color: "#2B2320", paddingTop: 6 }}>
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
              </div>
            )}
            {error && <p style={{ color: "#A33", fontSize: 13, fontFamily: "'Public Sans', sans-serif", margin: 0 }}>{error}</p>}
            <button onClick={goToCheckout} style={{ background: "#7A2E3A", color: "#FBF6F0", border: "none", padding: "13px", borderRadius: 6, fontFamily: "'Public Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Continuar
            </button>
          </>
        ) : (
          <>
            <div>
              <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 13, color: "#5B5049", margin: "0 0 10px", fontWeight: 600 }}>Retirada ou entrega</p>
              <div style={{ display: "flex", gap: 10 }}>
                <label style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, border: "1px solid " + (deliveryType === "retirada" ? "#7A2E3A" : "#E8DDD1"), borderRadius: 8, padding: "12px 10px", cursor: "pointer" }}>
                  <input type="radio" name="deliveryType" checked={deliveryType === "retirada"} onChange={() => setDeliveryType("retirada")} style={{ display: "none" }} />
                  <Store size={18} color="#2B2320" />
                  <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 13, color: "#2B2320" }}>Retirada</span>
                </label>
                {settings.delivery_enabled && (
                  <label style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, border: "1px solid " + (deliveryType === "entrega" ? "#7A2E3A" : "#E8DDD1"), borderRadius: 8, padding: "12px 10px", cursor: "pointer" }}>
                    <input type="radio" name="deliveryType" checked={deliveryType === "entrega"} onChange={() => setDeliveryType("entrega")} style={{ display: "none" }} />
                    <Bike size={18} color="#2B2320" />
                    <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 13, color: "#2B2320" }}>Entrega</span>
                  </label>
                )}
              </div>
              {deliveryType === "retirada" ? (
                <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 12, color: "#8A7E74", margin: "8px 0 0" }}>Retirada em {settings.address}.</p>
              ) : (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {field("Endereço de entrega", <input style={inputStyle} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Rua, número, bairro" />)}
                  <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 12, color: "#8A7E74", margin: 0 }}>
                    Frete estimado: {formatPrice(settings.delivery_fee)}. {settings.delivery_note}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 13, color: "#5B5049", margin: "0 0 10px", fontWeight: 600 }}>Forma de pagamento</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PAYMENT_OPTIONS.map((opt) => {
                  const fee = opt.feeKey ? settings[opt.feeKey] : 0;
                  return (
                    <label key={opt.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, border: "1px solid " + (payment === opt.key ? "#7A2E3A" : "#E8DDD1"), borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontFamily: "'Public Sans', sans-serif" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input type="radio" name="payment" checked={payment === opt.key} onChange={() => setPayment(opt.key)} />
                        <span style={{ fontSize: 14, color: "#2B2320" }}>{opt.label}</span>
                      </span>
                      <span style={{ fontSize: 12, color: "#8A7E74" }}>{fee > 0 ? `+${fee}% de taxa` : "sem taxa"}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {field("Nome", <input style={inputStyle} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Seu nome" />)}
              {field("Telefone para contato", <input style={inputStyle} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="(21) 90000-0000" />)}
              {field("Data desejada", (
                <>
                  <input type="date" style={inputStyle} value={desiredDate} min={minOrderDate} onChange={(e) => handleDateChange(e.target.value)} />
                  <span style={{ fontSize: 12, color: "#8A7E74" }}>Mínimo de 48h de antecedência. Não atendemos aos domingos.</span>
                  {dateError && <span style={{ fontSize: 12, color: "#A33" }}>{dateError}</span>}
                </>
              ))}
              {field("Observações (opcional)", <textarea style={{ ...inputStyle, minHeight: 56, resize: "vertical" }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alguma preferência ou detalhe do pedido" />)}
            </div>

            <div style={{ borderTop: "1px solid #E8DDD1", paddingTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Public Sans', sans-serif", fontSize: 14, color: "#5B5049" }}>
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              {feePercent > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Public Sans', sans-serif", fontSize: 14, color: "#5B5049" }}>
                  <span>Taxa ({feePercent}%)</span><span>{formatPrice(feeAmount)}</span>
                </div>
              )}
              {deliveryType === "entrega" && (
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Public Sans', sans-serif", fontSize: 14, color: "#5B5049" }}>
                  <span>Frete estimado</span><span>{formatPrice(deliveryFee)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Public Sans', sans-serif", fontSize: 17, fontWeight: 600, color: "#2B2320", marginTop: 4 }}>
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>

            {error && <p style={{ color: "#A33", fontSize: 13, fontFamily: "'Public Sans', sans-serif", margin: 0 }}>{error}</p>}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ background: "none", border: "1px solid #E8DDD1", padding: "12px 16px", borderRadius: 6, fontFamily: "'Public Sans', sans-serif", fontSize: 14, cursor: "pointer", color: "#4A3F38" }}>
                Voltar
              </button>
              <button onClick={send} disabled={sending} style={{
                flex: 1, background: sending ? "#8FA07E" : "#5C6E4A", color: "#fff", border: "none", padding: "12px", borderRadius: 6,
                fontFamily: "'Public Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: sending ? "not-allowed" : "pointer",
              }}>
                {sending ? "Gerando pedido…" : "Enviar pedido pelo WhatsApp"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LoginGate({ onSuccess, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) { setErr("Preencha e-mail e senha."); return; }
    setErr("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setErr("E-mail ou senha incorretos.");
    } else {
      onSuccess();
    }
  };

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 6vw" }}>
      <div style={{ width: "100%", maxWidth: 360, border: "1px solid #E8DDD1", borderRadius: 10, padding: 32, background: "#fff", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Lock size={20} color="#7A2E3A" strokeWidth={1.7} />
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, margin: 0, color: "#2B2320" }}>Painel administrativo</h2>
        </div>
        <div style={{ position: "relative" }}>
          <Mail size={16} color="#8A7E74" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErr(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="E-mail"
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        <div style={{ position: "relative" }}>
          <KeyRound size={16} color="#8A7E74" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErr(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Senha"
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        {err && <p style={{ color: "#A33", fontSize: 13, margin: 0, fontFamily: "'Public Sans', sans-serif" }}>{err}</p>}
        <button type="button" onClick={submit} disabled={loading} style={{
          background: loading ? "#C9BDB4" : "#7A2E3A", color: "#FBF6F0", border: "none", padding: "12px", borderRadius: 6,
          fontFamily: "'Public Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
        }}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", color: "#8A7E74", fontFamily: "'Public Sans', sans-serif", fontSize: 13, cursor: "pointer" }}>
          Voltar para a loja
        </button>
      </div>
    </div>
  );
}

const emptyForm = { name: "", description: "", price: "", category: CATEGORIES[0], accent: "vinho", published: true };

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim()) { setError("Dê um nome ao produto."); return; }
    if (!form.description.trim()) { setError("Escreva uma descrição curta."); return; }
    const priceNum = parseFloat(String(form.price).replace(",", "."));
    if (isNaN(priceNum) || priceNum <= 0) { setError("Informe um preço válido."); return; }
    setError("");
    setSaving(true);
    try {
      await onSave({ ...form, price: priceNum });
    } catch (e) {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ border: "1px solid #E8DDD1", borderRadius: 10, padding: 24, background: "#fff", display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
      <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 19, margin: 0, color: "#2B2320" }}>{initial ? "Editar produto" : "Novo produto"}</h3>
      {field("Nome", <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bolo de cenoura com brigadeiro" />)}
      {field("Descrição", <textarea style={{ ...inputStyle, minHeight: 64, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Conte o que torna esse doce especial" />)}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {field("Preço (R$)", <input style={inputStyle} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="120" inputMode="decimal" />)}
        {field("Categoria", (
          <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        ))}
        {field("Cor do rótulo", (
          <select style={inputStyle} value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })}>
            {Object.keys(ACCENTS).map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        ))}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Public Sans', sans-serif", fontSize: 14, color: "#4A3F38" }}>
        <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
        Publicado no cardápio
      </label>
      {error && <p style={{ color: "#A33", fontSize: 13, margin: 0, fontFamily: "'Public Sans', sans-serif" }}>{error}</p>}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={submit} disabled={saving} style={{
          background: "#7A2E3A", color: "#FBF6F0", border: "none", padding: "10px 20px", borderRadius: 6,
          fontFamily: "'Public Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Check size={15} /> {saving ? "Salvando…" : "Salvar"}
        </button>
        <button type="button" onClick={onCancel} style={{ background: "none", border: "1px solid #E8DDD1", padding: "10px 20px", borderRadius: 6, fontFamily: "'Public Sans', sans-serif", fontSize: 14, cursor: "pointer", color: "#4A3F38" }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function ProductsTab({ products, refreshProducts }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const startNew = () => { setEditing(null); setShowForm(true); };
  const startEdit = (p) => { setEditing(p); setShowForm(true); };

  const save = async (product) => {
    if (editing) {
      await supabase.from("products").update(product).eq("id", editing.id);
    } else {
      await supabase.from("products").insert(product);
    }
    await refreshProducts();
    setShowForm(false);
    setEditing(null);
  };

  const remove = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    await refreshProducts();
    setConfirmDelete(null);
  };

  const togglePublished = async (p) => {
    await supabase.from("products").update({ published: !p.published }).eq("id", p.id);
    await refreshProducts();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        {!showForm && (
          <button onClick={startNew} style={{
            background: "#7A2E3A", color: "#FBF6F0", border: "none", padding: "10px 18px", borderRadius: 6,
            fontFamily: "'Public Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Plus size={16} /> Novo produto
          </button>
        )}
      </div>

      {showForm && <ProductForm initial={editing} onSave={save} onCancel={() => { setShowForm(false); setEditing(null); }} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {products.length === 0 && <p style={{ fontFamily: "'Public Sans', sans-serif", color: "#8A7E74" }}>Nenhum produto cadastrado ainda. Crie o primeiro acima.</p>}
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #E8DDD1", borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, background: "#fff", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, margin: 0, color: "#2B2320" }}>{p.name}</p>
              <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 13, color: "#8A7E74", margin: "2px 0 0" }}>{p.category} · {formatPrice(p.price)}</p>
            </div>
            <button onClick={() => togglePublished(p)} style={{
              fontFamily: "'Public Sans', sans-serif", fontSize: 12, padding: "6px 12px", borderRadius: 999,
              border: "1px solid " + (p.published ? "#5C6E4A" : "#E8DDD1"), color: p.published ? "#5C6E4A" : "#8A7E74", background: "none", cursor: "pointer",
            }}>
              {p.published ? "Publicado" : "Rascunho"}
            </button>
            <button onClick={() => startEdit(p)} aria-label="Editar" style={iconBtnStyle}><Pencil size={16} color="#4A3F38" strokeWidth={1.7} /></button>
            {confirmDelete === p.id ? (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 12, color: "#8A7E74" }}>Excluir?</span>
                <button onClick={() => remove(p.id)} style={{ ...iconBtnStyle, borderColor: "#A33" }} aria-label="Confirmar exclusão"><Check size={16} color="#A33" /></button>
                <button onClick={() => setConfirmDelete(null)} style={iconBtnStyle} aria-label="Cancelar exclusão"><X size={16} color="#4A3F38" /></button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(p.id)} aria-label="Excluir" style={iconBtnStyle}><Trash2 size={16} color="#4A3F38" strokeWidth={1.7} /></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ settings, refreshSettings }) {
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim()) { setError("Dê um nome à confeitaria."); return; }
    if (!form.address.trim()) { setError("Informe o endereço."); return; }
    if (digitsOnly(form.whatsapp).length < 10) { setError("Informe um número de WhatsApp válido, com DDD."); return; }
    setError("");
    setSaving(true);
    const payload = {
      ...form,
      fee_debito: parseFloat(String(form.fee_debito).replace(",", ".")) || 0,
      fee_credito: parseFloat(String(form.fee_credito).replace(",", ".")) || 0,
      fee_pix: parseFloat(String(form.fee_pix).replace(",", ".")) || 0,
      delivery_fee: parseFloat(String(form.delivery_fee).replace(",", ".")) || 0,
    };
    const { error: dbError } = await supabase.from("settings").update(payload).eq("id", 1);
    setSaving(false);
    if (dbError) { setError("Não foi possível salvar. Tente novamente."); return; }
    await refreshSettings();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ border: "1px solid #E8DDD1", borderRadius: 10, padding: 24, background: "#fff", display: "flex", flexDirection: "column", gap: 16, maxWidth: 540 }}>
      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, margin: 0, color: "#2B2320" }}>Dados da loja</p>
      {field("Nome da confeitaria", <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />)}
      {field("Endereço", <input style={inputStyle} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />)}
      {field("Telefone (exibido no site)", <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(21) 99383-5942" />)}
      {field("Número do WhatsApp (com DDD, só números)", <input style={inputStyle} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="21993835942" />)}
      {field("Instagram (sem @)", <input style={inputStyle} value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="doce.lizdoces" />)}

      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, margin: "8px 0 0", color: "#2B2320" }}>Pagamento</p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {field("Taxa débito (%)", <input style={inputStyle} value={form.fee_debito} onChange={(e) => setForm({ ...form, fee_debito: e.target.value })} inputMode="decimal" />)}
        {field("Taxa crédito (%)", <input style={inputStyle} value={form.fee_credito} onChange={(e) => setForm({ ...form, fee_credito: e.target.value })} inputMode="decimal" />)}
        {field("Taxa Pix (%)", <input style={inputStyle} value={form.fee_pix} onChange={(e) => setForm({ ...form, fee_pix: e.target.value })} inputMode="decimal" />)}
      </div>
      {field("Chave Pix (exibida na mensagem do pedido)", <input style={inputStyle} value={form.pix_key} onChange={(e) => setForm({ ...form, pix_key: e.target.value })} placeholder="e-mail, telefone ou chave aleatória" />)}

      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, margin: "8px 0 0", color: "#2B2320" }}>Entrega</p>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Public Sans', sans-serif", fontSize: 14, color: "#4A3F38" }}>
        <input type="checkbox" checked={form.delivery_enabled} onChange={(e) => setForm({ ...form, delivery_enabled: e.target.checked })} />
        Oferecer entrega (além de retirada)
      </label>
      {form.delivery_enabled && (
        <>
          {field("Valor estimado do frete (R$)", <input style={inputStyle} value={form.delivery_fee} onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })} inputMode="decimal" />)}
          {field("Observação sobre o frete", <textarea style={{ ...inputStyle, minHeight: 56, resize: "vertical" }} value={form.delivery_note} onChange={(e) => setForm({ ...form, delivery_note: e.target.value })} />)}
          <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 12, color: "#8A7E74", margin: 0, lineHeight: 1.5 }}>
            Esse valor é uma estimativa fixa. Cotação automática com Uber Entregas ou 99 Entregas
            exige uma conta empresarial nessas plataformas e uma integração de API à parte.
          </p>
        </>
      )}

      {error && <p style={{ color: "#A33", fontSize: 13, margin: 0, fontFamily: "'Public Sans', sans-serif" }}>{error}</p>}
      {saved && <p style={{ color: "#5C6E4A", fontSize: 13, margin: 0, fontFamily: "'Public Sans', sans-serif" }}>Configurações salvas.</p>}
      <button type="button" onClick={submit} disabled={saving} style={{
        background: "#7A2E3A", color: "#FBF6F0", border: "none", padding: "11px", borderRadius: 6,
        fontFamily: "'Public Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", gap: 6, justifyContent: "center", width: 160,
      }}>
        <Check size={15} /> {saving ? "Salvando…" : "Salvar"}
      </button>
    </div>
  );
}

function OrdersTab({ orders, loadingOrders, settings }) {
  const [expanded, setExpanded] = useState(null);

  if (loadingOrders) {
    return <p style={{ fontFamily: "'Public Sans', sans-serif", color: "#8A7E74" }}>Carregando pedidos…</p>;
  }

  if (orders.length === 0) {
    return <p style={{ fontFamily: "'Public Sans', sans-serif", color: "#8A7E74" }}>Nenhum pedido registrado ainda.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {orders.map((o) => (
        <div key={o.id} style={{ border: "1px solid #E8DDD1", borderRadius: 8, background: "#fff" }}>
          <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} style={{
            width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left",
            padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
          }}>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, color: "#7A2E3A", minWidth: 90 }}>
              {formatOrderNumber(settings.name, o.id)}
            </span>
            <span style={{ flex: 1, minWidth: 140, fontFamily: "'Public Sans', sans-serif", fontSize: 14, color: "#2B2320" }}>{o.customer_name}</span>
            <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 13, color: "#8A7E74" }}>{formatDateTime(o.created_at)}</span>
            <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#2B2320" }}>{formatPrice(o.total)}</span>
          </button>
          {expanded === o.id && (
            <div style={{ padding: "0 18px 16px", display: "flex", flexDirection: "column", gap: 6, fontFamily: "'Public Sans', sans-serif", fontSize: 13, color: "#5B5049" }}>
              <div>
                {o.items.map((item, i) => (
                  <div key={i}>{item.qty}x {item.name} — {formatPrice(item.price * item.qty)}</div>
                ))}
              </div>
              <div>Tipo: {o.delivery_type === "entrega" ? `Entrega — ${o.delivery_address}` : "Retirada"}</div>
              <div>Pagamento: {PAYMENT_OPTIONS.find((p) => p.key === o.payment_method)?.label || o.payment_method}</div>
              <div>Telefone: {o.customer_phone}</div>
              <div>Data desejada: {o.desired_date}</div>
              {o.notes && <div>Observações: {o.notes}</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AdminDashboard({ products, refreshProducts, settings, refreshSettings, orders, loadingOrders, onExit }) {
  const [tab, setTab] = useState("produtos");

  const tabBtn = (key, label, Icon) => (
    <button onClick={() => setTab(key)} style={{
      display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 999,
      border: tab === key ? "1px solid #7A2E3A" : "1px solid #E8DDD1",
      background: tab === key ? "#7A2E3A" : "transparent",
      color: tab === key ? "#FBF6F0" : "#4A3F38",
      fontFamily: "'Public Sans', sans-serif", fontSize: 14, cursor: "pointer",
    }}>
      <Icon size={15} /> {label}
    </button>
  );

  return (
    <div style={{ padding: "40px 6vw 72px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, margin: 0, color: "#2B2320" }}>Painel da confeitaria</h2>
        <button onClick={onExit} style={{
          background: "none", border: "1px solid #E8DDD1", padding: "10px 16px", borderRadius: 6,
          fontFamily: "'Public Sans', sans-serif", fontSize: 14, cursor: "pointer", color: "#4A3F38",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <LogOut size={15} /> Sair
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {tabBtn("produtos", "Produtos", Package)}
        {tabBtn("pedidos", "Pedidos", Receipt)}
        {tabBtn("config", "Configurações", Settings)}
      </div>

      {tab === "produtos" && <ProductsTab products={products} refreshProducts={refreshProducts} />}
      {tab === "pedidos" && <OrdersTab orders={orders} loadingOrders={loadingOrders} settings={settings} />}
      {tab === "config" && <SettingsTab settings={settings} refreshSettings={refreshSettings} />}
    </div>
  );
}

export default function App() {
  const { session, loadingSession } = useSession();
  const { products, loadingProducts, refreshProducts } = useProducts(session);
  const { settings, loadingSettings, refreshSettings } = useSettings();
  const { orders, loadingOrders, refreshOrders } = useOrders(session);

  const [view, setView] = useState("loja");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const loading = loadingSession || loadingProducts || loadingSettings;

  const createOrder = async (payload) => {
    const { data, error } = await supabase.from("orders").insert(payload).select("id").single();
    if (error) throw error;
    await refreshOrders();
    return data.id;
  };

  const scrollTo = (label) => {
    const map = { "Cardápio": "cardapio", "Nossa história": "sobre", "Encomendas": "contato" };
    const el = document.getElementById(map[label]);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) { setCart((prev) => prev.filter((i) => i.id !== id)); return; }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  const cartMap = cart.reduce((acc, item) => { acc[item.id] = item.qty; return acc; }, {});
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const goToAdmin = () => setView("admin");
  const exitAdmin = async () => { await supabase.auth.signOut(); setView("loja"); };

  return (
    <div style={{ background: "#FBF6F0", minHeight: "100vh", fontFamily: "'Public Sans', sans-serif" }}>
      {view === "loja" && settings && (
        <Header settings={settings} onNav={scrollTo} cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      )}

      {loading || !settings ? (
        <div style={{ padding: "80px 6vw", fontFamily: "'Public Sans', sans-serif", color: "#8A7E74" }}>Preparando o cardápio…</div>
      ) : view === "loja" ? (
        <>
          <Hero onCta={() => scrollTo("Cardápio")} />
          <MenuSection products={products} activeCategory={activeCategory} setActiveCategory={setActiveCategory} id="cardapio" onAdd={addToCart} cartMap={cartMap} />
          <AboutSection id="sobre" />
          <ContactSection id="contato" settings={settings} />
          <Footer settings={settings} onAdminClick={goToAdmin} />
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} updateQty={updateQty} removeItem={removeItem} settings={settings} clearCart={clearCart} onCreateOrder={createOrder} />
        </>
      ) : !session ? (
        <LoginGate onSuccess={() => setView("admin")} onBack={() => setView("loja")} />
      ) : (
        <AdminDashboard
          products={products}
          refreshProducts={refreshProducts}
          settings={settings}
          refreshSettings={refreshSettings}
          orders={orders}
          loadingOrders={loadingOrders}
          onExit={exitAdmin}
        />
      )}
    </div>
  );
}
