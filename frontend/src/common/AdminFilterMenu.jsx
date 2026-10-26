import React, { useEffect } from "react";
import { X, Filter } from "lucide-react";

export default function AdminFilterMenu({ isOpen, onClose, title = "Filter Users", children }) {
    // ESC key close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    // Prevent background scrolling when filter menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            {/* BACKDROP */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            />

            {/* SIDEBAR */}
            <div
                className={`fixed top-0 right-0 h-full w-70 sm:w-[300px] bg-white dark:bg-gray-900 z-[9999] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 shrink-0">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-500" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {title}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition cursor-pointer flex items-center justify-center"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* CONTENT (fully rendered by children, including the layout and footer buttons) */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </>
    );
}