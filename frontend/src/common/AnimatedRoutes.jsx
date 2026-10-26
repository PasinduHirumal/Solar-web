import { Routes } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2, ease: "easeIn" },
    },
};

export default function AnimatedRoutes({ location, children }) {
    // Use a static key for admin and auth routes so the layout/components don't unmount and flash on sub-navigation
    const isAdmin = location.pathname.startsWith('/admin');
    const isAuth = location.pathname === '/login' || location.pathname === '/register';
    const animationKey = isAdmin ? 'admin-layout' : isAuth ? 'auth-layout' : location.pathname;

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={animationKey}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <Routes location={location}>{children}</Routes>
            </motion.div>
        </AnimatePresence>
    );
}
