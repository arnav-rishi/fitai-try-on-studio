import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Copy, Check, LogOut, Loader2, Plus, RefreshCw, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";

interface Brand {
  id: string;
  name: string;
  api_key: string;
  allowed_domains: string[];
  widget_theme: any;
  is_active: boolean;
  created_at: string;
}

interface BrandStats {
  count: number;
  lastActive: string | null;
}

type CdnStatus = "checking" | "online" | "offline";

export default function Admin() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<Record<string, BrandStats>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState("");
  const [creating, setCreating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cdnStatus, setCdnStatus] = useState<CdnStatus>("checking");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/brand-auth"); return; }

      // Check admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const admin = roles?.some((r: any) => r.role === "admin");
      if (!admin) {
        navigate("/");
        return;
      }
      setIsAdmin(true);

      // Fetch all brands
      const { data } = await supabase.from("brands").select("*").order("created_at", { ascending: false });
      setBrands((data as unknown as Brand[]) || []);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.from("brands").insert({
        name: newBrandName.trim(),
        user_id: session.user.id,
      }).select().single();

      if (error) throw error;
      setBrands([data as unknown as Brand, ...brands]);
      setNewBrandName("");
    } catch (err: any) {
      alert("Failed to create brand: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRegenerateKey = async (brandId: string) => {
    if (!window.confirm("Regenerate API key? The old key will stop working immediately.")) return;
    setRegeneratingId(brandId);
    try {
      const res = await supabase.functions.invoke("brand-api-key", {
        body: { brand_id: brandId },
      });
      if (res.error) throw res.error;
      const newKey = res.data?.api_key;
      if (newKey) {
        setBrands(brands.map(b => b.id === brandId ? { ...b, api_key: newKey } : b));
      }
    } catch {
      alert("Failed to regenerate key");
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleToggleActive = async (brand: Brand) => {
    const { error } = await supabase
      .from("brands")
      .update({ is_active: !brand.is_active } as any)
      .eq("id", brand.id);
    if (!error) {
      setBrands(brands.map(b => b.id === brand.id ? { ...b, is_active: !b.is_active } : b));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAdmin) return null;

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "vcjshbykllrhuodzaguf";
  const widgetUrl = `https://${projectId}.supabase.co/storage/v1/object/public/widget/widget.js`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={14} /> Home
          </Link>
          <div className="font-display text-lg font-semibold">
            Fit<span className="text-terracotta">AI</span> Admin
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-3xl">
        <div className="mb-8">
          <p className="font-body text-xs tracking-widest text-primary uppercase mb-2">Admin Panel</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Brand Management</h1>
        </div>

        {/* Create New Brand */}
        <section className="bg-card border border-border p-5 md:p-6 mb-8" style={{ borderRadius: "4px" }}>
          <h2 className="font-body text-xs tracking-widest text-muted-foreground uppercase mb-3">
            Onboard New Brand
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="flex-1 bg-secondary border border-border px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              style={{ borderRadius: "2px" }}
              placeholder="Brand name (e.g. Bewakoof, Snitch)"
              onKeyDown={(e) => e.key === "Enter" && handleCreateBrand()}
            />
            <button
              onClick={handleCreateBrand}
              disabled={creating || !newBrandName.trim()}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-body text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              style={{ borderRadius: "2px" }}
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create
            </button>
          </div>
        </section>

        {/* Brand List */}
        <section>
          <h2 className="font-body text-xs tracking-widest text-muted-foreground uppercase mb-4">
            All Brands ({brands.length})
          </h2>

          {brands.length === 0 ? (
            <div className="bg-card border border-border p-8 text-center" style={{ borderRadius: "4px" }}>
              <p className="font-body text-sm text-muted-foreground">No brands onboarded yet. Create one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className={`bg-card border ${brand.is_active ? "border-border" : "border-destructive/30 opacity-70"} transition-all`}
                  style={{ borderRadius: "4px" }}
                >
                  {/* Header Row */}
                  <div
                    className="flex items-center justify-between p-4 md:p-5 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === brand.id ? null : brand.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${brand.is_active ? "bg-green-500" : "bg-destructive"}`}
                        title={brand.is_active ? "Active" : "Inactive"}
                      />
                      <div>
                        <h3 className="font-body text-sm font-medium text-foreground">{brand.name}</h3>
                        <p className="font-body text-xs text-muted-foreground">
                          Created {new Date(brand.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {expandedId === brand.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {/* Expanded Details */}
                  {expandedId === brand.id && (
                    <div className="border-t border-border p-4 md:p-5 space-y-4">
                      {/* API Key */}
                      <div>
                        <label className="font-body text-xs tracking-widest text-muted-foreground uppercase mb-1.5 block">
                          API Key
                        </label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-secondary px-3 py-2 font-mono text-xs text-foreground overflow-x-auto" style={{ borderRadius: "2px" }}>
                            {brand.api_key}
                          </code>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(brand.api_key, brand.id); }}
                            className="p-2 border border-border hover:border-foreground/40 transition-colors"
                            style={{ borderRadius: "2px" }}
                            title="Copy"
                          >
                            {copied === brand.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRegenerateKey(brand.id); }}
                            disabled={regeneratingId === brand.id}
                            className="p-2 border border-border hover:border-destructive/60 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                            style={{ borderRadius: "2px" }}
                            title="Regenerate"
                          >
                            <RefreshCw size={14} className={regeneratingId === brand.id ? "animate-spin" : ""} />
                          </button>
                        </div>
                      </div>

                      {/* Embed Code Snippet */}
                      <div>
                        <label className="font-body text-xs tracking-widest text-muted-foreground uppercase mb-1.5 block">
                          Embed Code (send to client)
                        </label>
                        <div className="relative">
                          <pre className="bg-secondary p-3 font-mono text-[11px] text-foreground overflow-x-auto" style={{ borderRadius: "2px" }}>
{`<!-- Add this script once, before </body> on every page (or in your global template) -->
<script
  src="${widgetUrl}"
  data-brand-id="${brand.api_key}"
  async></script>

<!-- Then tag any product image with data-fitai-garment -->
<!-- Example: <img src="product.jpg" data-fitai-garment data-fitai-category="tops" /> -->
<!-- The widget auto-discovers all tagged images on the page -->`}
                          </pre>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(
                                `<script\n  src="${widgetUrl}"\n  data-brand-id="${brand.api_key}"\n  async></script>`,
                                brand.id + "-embed"
                              );
                            }}
                            className="absolute top-1.5 right-1.5 p-1.5 bg-card/80 border border-border hover:border-foreground/40 transition-colors"
                            style={{ borderRadius: "2px" }}
                          >
                            {copied === brand.id + "-embed" ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleActive(brand); }}
                          className={`px-4 py-2 font-body text-xs border transition-colors ${
                            brand.is_active
                              ? "border-destructive/40 text-destructive hover:bg-destructive/10"
                              : "border-primary/40 text-primary hover:bg-primary/10"
                          }`}
                          style={{ borderRadius: "2px" }}
                        >
                          {brand.is_active ? "Deactivate" : "Reactivate"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
