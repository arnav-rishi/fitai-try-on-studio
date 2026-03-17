import { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((v) => setScrolled(v > 40));
  }, [scrollY]);

  const handleScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-charcoal/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-5 px-6 md:px-8">
        {/* Logo */}
        <div className="font-display text-xl font-semibold tracking-tight text-cream cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Fit<span className="text-terracotta">AI</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "How it works", id: "how-it-works" },
            { label: "Pricing", id: "pricing" },
            { label: "Integrate", id: "embed" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleScroll(item.id)}
              className="font-body text-sm text-muted-foreground hover:text-cream transition-colors duration-200 tracking-wide"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => handleScroll("final-cta")}
          className="font-body text-sm bg-terracotta text-cream px-5 py-2.5 border border-terracotta hover:bg-transparent hover:text-terracotta transition-all duration-200 tracking-wide"
          style={{ borderRadius: "2px" }}
        >
          Get started free
        </button>
      </div>
    </motion.nav>
  );
};

export default Nav;
