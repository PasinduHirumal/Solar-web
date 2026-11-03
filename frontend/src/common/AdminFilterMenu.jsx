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
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[9998] transition-all duration-300 ${
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                }`}
            />

            {/* DRAWER SIDEBAR */}
            <div
                className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-white z-[9999] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-l border-slate-200/90 ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white sticky top-0 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
                            <Filter className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 leading-none">
                                {title}
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-1">Refine and sort dataset</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer flex items-center justify-center"
                        title="Close filters"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {children}
                </div>
            </div>
        </>
    );
}
