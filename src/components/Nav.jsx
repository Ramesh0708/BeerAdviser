import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

const links = [
  { href: "#advisor", label: "Find Beer" },
  { href: "#mood", label: "Mood Lab" },
  { href: "#quiz", label: "Taste DNA" },
  { href: "#catalog", label: "Cellar" },
  { href: "#vault", label: "Vault" },
];

export default function Nav({ vaultCount }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 18 });
  const sy = useSpring(y, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const onMove = (e) => {
      x.set((e.clientX / window.innerWidth - 0.5) * 12);
      y.set((e.clientY / window.innerHeight - 0.5) * 8);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return (
    <motion.nav className="nav" style={{ x: sx, y: sy }}>
      <a href="#top" className="brand">
        <img src="./icon.png" alt="" width="28" height="28" />
        Beer Adviser
        <span>2026</span>
      </a>
      <div className="nav-links">
        {links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
            {l.href === "#vault" && vaultCount > 0 && <i>{vaultCount}</i>}
          </a>
        ))}
      </div>
      <a className="btn tiny" href="./beeradviser.apk" download>
        Get the APK
      </a>
    </motion.nav>
  );
}
