import { motion } from "framer-motion";
import headerBg from "../../../assets/header-bg.jpg"

export default function ContactHero() {
    return (
        <section className="relative overflow-hidden h-[70vh] flex items-center justify-center pt-20 bg-white transition-colors duration-300">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-90 pointer-events-none"
                style={{ backgroundImage: `url(${headerBg})` }}
            ></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10 w-full flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center inline-block p-8 md:p-12 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-w-3xl"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                        Get in <span className="text-blue-600">Touch</span>
                    </h1>
                    <p className="text-xl text-slate-800 mx-auto">
                        Have a question about our courses? Want to enroll via WhatsApp? We'd love to hear from you.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};