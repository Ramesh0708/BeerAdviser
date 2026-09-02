import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="foot">
      <div>
        <h3>Beer Adviser 2026</h3>
        <p>
          Rebuilt from the original <code>com.hfad.beeradviser</code> APK — splash screen,
          FindBeerActivity, and BeerExpert — with a 2026 coat of foam.
        </p>
      </div>
      <div className="foot-links">
        <a href="./beeradviser.apk" download>
          Download original APK
        </a>
        <a href="#advisor">Find Beer</a>
        <a href="#quiz">Taste DNA</a>
      </div>
      <motion.p className="legal" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
        Drink responsibly. 18+ only. Brand names belong to their breweries — this is a fan
        recreation of a tutorial app, not an official store.
      </motion.p>
    </footer>
  );
}
