import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroFashion from "@/assets/hero-fashion.jpg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: "easeOut" } as Transition,
});

const TryOnCard = () => {
  const [personImg, setPersonImg] = useState<string | null>(null);
  const [garmentImg, setGarmentImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);
  const personRef = useRef<HTMLInputElement>(null);
  const garmentRef = useRef<HTMLInputElement>(null);

  const handleUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setter(url);
    }
  };

  const handleGenerate = () => {
    if (!personImg || !garmentImg) return;
    setLoading(true);
    setResult(false);
    setTimeout(() => {
      setLoading(false);
      setResult(true);
    }, 2500);
  };

  return (
    <div
      className="bg-surface border border-border p-6 flex flex-col gap-5"
      style={{ borderRadius: "2px" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={14} className="text-terracotta" />
        <span className="font-body text-xs text-muted-foreground tracking-widest uppercase">
          Live Demo
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Person upload */}
        <div>
          <p className="font-body text-xs text-muted-foreground mb-2 tracking-wide">
            Customer photo
          </p>
          <div
            onClick={() => personRef.current?.click()}
            className={`border border-dashed border-border hover:border-terracotta transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center h-32 overflow-hidden ${
              personImg ? "p-0" : "p-4 gap-2"
            }`}
            style={{ borderRadius: "2px" }}
          >
            {personImg ? (
              <img src={personImg} className="w-full h-full object-cover" alt="person" />
            ) : (
              <>
                <Upload size={18} className="text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground text-center">
                  Upload photo
                </span>
              </>
            )}
          </div>
          <input
            ref={personRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e, setPersonImg)}
          />
        </div>

        {/* Garment upload */}
        <div>
          <p className="font-body text-xs text-muted-foreground mb-2 tracking-wide">
            Garment image
          </p>
          <div
            onClick={() => garmentRef.current?.click()}
            className={`border border-dashed border-border hover:border-terracotta transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center h-32 overflow-hidden ${
              garmentImg ? "p-0" : "p-4 gap-2"
            }`}
            style={{ borderRadius: "2px" }}
          >
            {garmentImg ? (
              <img src={garmentImg} className="w-full h-full object-cover" alt="garment" />
            ) : (
              <>
                <Upload size={18} className="text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground text-center">
                  Upload garment
                </span>
              </>
            )}
          </div>
          <input
            ref={garmentRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e, setGarmentImg)}
          />
        </div>
      </div>

      {/* Result area */}
      <div
        className={`border border-border h-36 flex items-center justify-center overflow-hidden transition-all duration-300 ${
          loading || result ? "bg-surface" : "bg-muted/30"
        }`}
        style={{ borderRadius: "2px" }}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
            <span className="font-body text-xs text-muted-foreground">
              Generating try-on…
            </span>
          </div>
        ) : result ? (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <Sparkles size={20} className="text-terracotta" />
            <span className="font-body text-xs text-cream">
              Try-on result ready ✓
            </span>
            <span className="font-body text-xs text-muted-foreground">
              Customers see themselves in your garment, instantly.
            </span>
          </div>
        ) : (
          <span className="font-body text-xs text-muted-foreground text-center px-4">
            Result will appear here
          </span>
        )}
      </div>

      <button
        onClick={handleGenerate}
        disabled={!personImg || !garmentImg || loading}
        className={`w-full font-body text-sm py-3 flex items-center justify-center gap-2 transition-all duration-200 tracking-wide ${
          personImg && garmentImg && !loading
            ? "bg-terracotta text-cream hover:bg-terracotta-dim"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
        style={{ borderRadius: "2px" }}
      >
        Generate try-on
        <ArrowRight size={14} />
      </button>
    </div>
  );
};

const Hero = () => {
  const stats = [
    { value: "40%", label: "fewer returns" },
    { value: "2×", label: "add-to-cart rate" },
    { value: "5 min", label: "to go live" },
  ];

  return (
    <section className="min-h-screen pt-24 pb-16 flex flex-col justify-center">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column */}
          <div className="flex flex-col gap-8">
            <motion.div {...fadeUp(0.1)}>
              <span className="font-body text-xs tracking-widest text-terracotta uppercase border border-terracotta/30 px-3 py-1.5 inline-block">
                Virtual try-on for Indian D2C brands
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.2)}
              className="font-display text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.05] text-cream"
            >
              Let customers{" "}
              <em className="italic text-terracotta not-italic font-display" style={{ fontStyle: "italic" }}>
                try
              </em>{" "}
              before they buy
            </motion.h1>

            <motion.p {...fadeUp(0.35)} className="font-body text-base lg:text-lg text-muted-foreground leading-relaxed max-w-md">
              India's D2C clothing brands lose crores every year to return-driven logistics. FitAI plugs directly into your store and shows customers how garments look on their body — before checkout.
            </motion.p>

            <motion.div {...fadeUp(0.45)} className="flex flex-col sm:flex-row gap-3">
              <button
                className="font-body text-sm bg-terracotta text-cream px-7 py-3.5 hover:bg-terracotta-dim transition-all duration-200 tracking-wide flex items-center gap-2"
                style={{ borderRadius: "2px" }}
                onClick={() => document.getElementById("final-cta")?.scrollIntoView({ behavior: "smooth" })}
              >
                Start for free <ArrowRight size={14} />
              </button>
              <button
                className="font-body text-sm border border-border text-cream px-7 py-3.5 hover:border-terracotta/60 hover:text-terracotta transition-all duration-200 tracking-wide"
                style={{ borderRadius: "2px" }}
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                See how it works
              </button>
            </motion.div>
          </div>

          {/* Right column — Demo card */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <TryOnCard />
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          {...fadeUp(0.6)}
          className="mt-20 pt-10 border-t border-border grid grid-cols-3 gap-6"
        >
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="font-display text-3xl lg:text-4xl text-cream font-semibold">
                {s.value}
              </span>
              <span className="font-body text-sm text-muted-foreground tracking-wide">
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
