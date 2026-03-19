import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Smartphone, Zap, Shield, UserPlus, Loader2, Wifi } from "lucide-react";
import { VerificationBadge } from "@/components/VerificationBadge";

interface ResellerProfile {
  id: string;
  nome: string | null;
  store_name: string | null;
  store_logo_url: string | null;
  store_primary_color: string | null;
  active: boolean;
}

interface PricingItem {
  operadora_id: string;
  operadora_nome: string;
  valor_recarga: number;
  regra_valor: number;
  tipo_regra: string;
}

interface GroupedPricing {
  operadora: string;
  items: { valor: number; preco: number }[];
}

function computePrice(valor: number, regra_valor: number, tipo_regra: string): number {
  if (tipo_regra === "percentual") {
    return +(valor - valor * (regra_valor / 100)).toFixed(2);
  }
  return +(valor - regra_valor).toFixed(2);
}

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<ResellerProfile | null>(null);
  const [pricing, setPricing] = useState<GroupedPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) { setError("Link inválido."); setLoading(false); return; }

    async function load() {
      try {
        // Load profile
        const { data: storeData } = await supabase.rpc("get_public_store_by_slug" as any, { _slug: slug });
        const store = Array.isArray(storeData) ? storeData[0] : null;
        if (!store || !store.active) {
          setError("Perfil não encontrado.");
          setLoading(false);
          return;
        }
        setProfile(store as ResellerProfile);

        // Load pricing
        const { data: pricingData } = await supabase.rpc("get_public_reseller_pricing" as any, { _slug: slug });
        const items: PricingItem[] = Array.isArray(pricingData) ? pricingData : [];

        // Group by operadora
        const grouped = new Map<string, { valor: number; preco: number }[]>();
        items.forEach((item) => {
          const price = computePrice(item.valor_recarga, item.regra_valor, item.tipo_regra);
          if (price <= 0) return;
          if (!grouped.has(item.operadora_nome)) grouped.set(item.operadora_nome, []);
          grouped.get(item.operadora_nome)!.push({ valor: item.valor_recarga, preco: price });
        });

        const result: GroupedPricing[] = [];
        grouped.forEach((items, operadora) => {
          result.push({ operadora, items: items.sort((a, b) => a.valor - b.valor) });
        });
        result.sort((a, b) => a.operadora.localeCompare(b.operadora));
        setPricing(result);
      } catch {
        setError("Erro ao carregar perfil.");
      }
      setLoading(false);
    }

    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <Wifi className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">{error || "Perfil não encontrado."}</p>
          <Link to="/" className="text-primary underline text-sm">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  const storeName = profile.store_name || profile.nome || "Recargas";
  const primaryColor = profile.store_primary_color || "hsl(var(--primary))";
  const referralSlug = slug;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div
        className="relative py-10 px-4 text-center"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">Recargas Online</h1>
        <p className="text-white/80 text-sm mt-1">Rápido, seguro e instantâneo.</p>
      </div>

      {/* Profile Card */}
      <div className="max-w-xl mx-auto -mt-10 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-xl p-6 text-center border border-border"
        >
          {profile.store_logo_url ? (
            <img
              src={profile.store_logo_url}
              alt={storeName}
              className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-background shadow-lg"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {(storeName[0] || "R").toUpperCase()}
            </div>
          )}
          <div className="mt-3 flex items-center justify-center gap-1">
            <h2 className="text-lg font-bold text-foreground">{storeName}</h2>
            <VerificationBadge badge={profile.store_logo_url ? "verified" : null} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground">@{slug}</p>
          <Link
            to={`/loja/${slug}`}
            className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <UserPlus className="h-4 w-4" />
            Criar Conta Grátis
          </Link>
        </motion.div>
      </div>

      {/* Pricing */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {pricing.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">Nenhum preço configurado ainda.</p>
        ) : (
          <div className="space-y-8">
            {pricing.map((group) => (
              <motion.div
                key={group.operadora}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">{group.operadora}</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {group.items.map((item) => (
                    <div
                      key={`${group.operadora}-${item.valor}`}
                      className="rounded-xl border border-border bg-card p-4 text-center hover:border-primary/50 transition-colors"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Recarga</p>
                      <p className="text-xl font-bold text-foreground mt-1">
                        R$ {item.valor.toFixed(0)}
                      </p>
                      <p className="text-xs font-semibold mt-1" style={{ color: primaryColor }}>
                        Pagar R$ {item.preco.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-muted/30 py-12 px-4">
        <h2 className="text-xl font-bold text-center text-foreground mb-2">Como funciona?</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Recarregue seu celular em instantes seguindo 3 passos.
        </p>
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: UserPlus, title: "1. Crie sua Conta", desc: `Cadastre-se gratuitamente usando o código do vendedor ${slug}.` },
            { icon: Smartphone, title: "2. Escolha o Valor", desc: "Selecione sua operadora e o valor desejado para a recarga." },
            { icon: Zap, title: "3. Pague e Receba", desc: "Pague via PIX e receba o saldo no seu celular instantaneamente." },
          ].map((step, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border">
        <p>© {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
