import { motion } from "framer-motion";
import ContactInfo from "./components/ContactInfo";
import ContactForm from "./components/ContactForm";
import ContactHero from "./components/ContactHero";

export default function Contact() {
  return (
    <div className="w-full bg-white transition-colors duration-300">
      <ContactHero />
      {/* Content Section */}
      <section className="pb-24 pt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1 space-y-8"
            >
              <ContactInfo />
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}