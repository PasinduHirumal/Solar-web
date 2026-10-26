import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import * as LucideIcons from "lucide-react";
import {
  icons, Search, ChevronDown, Check, X, Sparkles, SearchX, CircleHelp, CircleQuestionMark, HelpCircle,
} from "lucide-react";

/**
 * All valid, canonical PascalCase icon names from the installed lucide-react package.
 * Dynamically extracted and alphabetically sorted.
 */
const ALL_LUCIDE_ICONS = Object.keys(icons).sort((a, b) =>
  a.localeCompare(b)
);

/**
 * Safely resolves an icon string into a valid Lucide React component.
 * Supports both canonical names and backward-compatible aliases.
 */
function resolveLucideIcon(iconName) {
  if (!iconName || typeof iconName !== "string") return null;
  const trimmed = iconName.trim();
  return icons[trimmed] || LucideIcons[trimmed] || null;
}

// Fallback icon component for missing/invalid icon names
const FallbackIcon =
  CircleHelp || CircleQuestionMark || HelpCircle || Sparkles;

/**
 * Reusable static component for rendering Lucide icons safely by name.
 */
function LucideIconRenderer({ name, size = 20, className = "", ...props }) {
  const IconComp = resolveLucideIcon(name) || FallbackIcon;
  if (!IconComp) return null;
  return React.createElement(IconComp, { size, className, ...props });
}

// Curated categories configuration
const RAW_CATEGORIES = {
  "Education & Academic": [
    "GraduationCap",
    "BookOpen",
    "Book",
    "Bookmark",
    "Library",
    "School",
    "Building",
    "Building2",
    "Landmark",
    "FileText",
    "FileCheck",
    "FileCode",
    "PenTool",
    "Pencil",
    "Languages",
    "Brain",
    "Lightbulb",
    "Compass",
    "Scroll",
    "Award",
    "Medal",
    "Trophy",
    "Glasses",
    "Notebook",
    "Paperclip",
  ],
  "Awards & Quality": [
    "Award",
    "Medal",
    "Trophy",
    "Crown",
    "Shield",
    "ShieldCheck",
    "BadgeCheck",
    "Star",
    "Sparkles",
    "CheckCircle",
    "CheckCircle2",
    "Zap",
    "Flame",
    "Target",
    "Rocket",
    "Heart",
    "Smile",
    "ThumbsUp",
    "Gem",
    "Verified",
  ],
  "Global & Partner": [
    "Globe",
    "Globe2",
    "Earth",
    "Handshake",
    "Users",
    "UserCheck",
    "UserPlus",
    "Briefcase",
    "MapPin",
    "Navigation",
    "Plane",
    "Network",
    "Layers",
    "Share2",
    "Flag",
    "Compass",
    "Send",
  ],
  "Business & Finance": [
    "Briefcase",
    "TrendingUp",
    "TrendingDown",
    "BarChart3",
    "PieChart",
    "LineChart",
    "ChartArea",
    "ChartBar",
    "ChartColumn",
    "ChartLine",
    "ChartPie",
    "Presentation",
    "Coins",
    "Wallet",
    "CreditCard",
    "Banknote",
    "Landmark",
    "DollarSign",
    "Receipt",
    "PiggyBank",
    "Calculator",
  ],
  Technology: [
    "Laptop",
    "Monitor",
    "Smartphone",
    "Tablet",
    "Cpu",
    "Database",
    "Server",
    "HardDrive",
    "Code",
    "Code2",
    "Terminal",
    "Wifi",
    "Cloud",
    "Bot",
    "CircuitBoard",
    "Binary",
    "QrCode",
    "Radio",
    "Tv",
  ],
  "Users & People": [
    "User",
    "Users",
    "UserCheck",
    "UserPlus",
    "UserMinus",
    "UserX",
    "CircleUser",
    "Contact",
    "Contact2",
    "Smile",
    "HeartHandshake",
    "Accessibility",
    "HandMetal",
    "Eye",
  ],
  Communication: [
    "MessageSquare",
    "MessageCircle",
    "Mail",
    "MailOpen",
    "Inbox",
    "Send",
    "Phone",
    "PhoneCall",
    "PhoneIncoming",
    "PhoneOutgoing",
    "Bell",
    "BellRing",
    "Megaphone",
    "Radio",
    "Share2",
    "Share",
    "AtSign",
    "Headphones",
  ],
  Media: [
    "Camera",
    "Video",
    "Image",
    "Images",
    "Film",
    "Music",
    "Play",
    "Pause",
    "Volume2",
    "VolumeX",
    "Mic",
    "Radio",
    "Cast",
    "Clapperboard",
  ],
  "Navigation & Maps": [
    "MapPin",
    "Navigation",
    "Compass",
    "Map",
    "Locate",
    "LocateFixed",
    "Route",
    "Signpost",
    "Milestone",
    "Plane",
    "Car",
    "Bus",
    "Train",
    "Ship",
  ],
  "Files & Documents": [
    "File",
    "FileText",
    "FileCheck",
    "FileCode",
    "FilePlus",
    "FileSpreadsheet",
    "Folder",
    "FolderOpen",
    "FolderPlus",
    "FolderCheck",
    "Files",
    "FileArchive",
    "Clipboard",
    "ClipboardCheck",
    "BookText",
  ],
  "Calendar & Time": [
    "Calendar",
    "CalendarDays",
    "CalendarCheck",
    "CalendarPlus",
    "Clock",
    "Clock1",
    "Clock4",
    "Clock8",
    "Clock12",
    "Timer",
    "Hourglass",
    "History",
    "AlarmClock",
  ],
  Security: [
    "Lock",
    "Unlock",
    "Key",
    "KeyRound",
    "Shield",
    "ShieldCheck",
    "ShieldAlert",
    "ShieldOff",
    "Fingerprint",
    "EyeOff",
    "FileLock",
    "FolderLock",
  ],
  "Status & Alerts": [
    "Check",
    "CheckCheck",
    "CheckCircle",
    "CheckCircle2",
    "CircleAlert",
    "AlertTriangle",
    "AlertCircle",
    "Info",
    "HelpCircle",
    "CircleHelp",
    "CircleQuestionMark",
    "X",
    "CircleX",
    "Ban",
    "Sparkles",
  ],
  "Charts & Analytics": [
    "BarChart",
    "BarChart2",
    "BarChart3",
    "BarChart4",
    "LineChart",
    "PieChart",
    "AreaChart",
    "TrendingUp",
    "TrendingDown",
    "Activity",
    "Gauge",
    "Sliders",
    "Target",
  ],
  Arrows: [
    "ArrowRight",
    "ArrowLeft",
    "ArrowUp",
    "ArrowDown",
    "ArrowUpRight",
    "ArrowDownRight",
    "ArrowUpLeft",
    "ArrowDownLeft",
    "ChevronRight",
    "ChevronLeft",
    "ChevronUp",
    "ChevronDown",
    "ChevronsRight",
    "ChevronsLeft",
    "MoveRight",
    "RefreshCw",
    "RotateCcw",
  ],
  "Layout & Design": [
    "LayoutGrid",
    "LayoutList",
    "LayoutDashboard",
    "Layers",
    "Columns",
    "Rows",
    "Palette",
    "Paintbrush",
    "Maximize2",
    "Minimize2",
    "Grid",
  ],
};

// Filter categories so only valid installed icons remain
const ICON_CATEGORIES = Object.entries(RAW_CATEGORIES).reduce(
  (acc, [category, iconList]) => {
    const validIcons = iconList.filter((name) => Boolean(resolveLucideIcon(name)));
    if (validIcons.length > 0) {
      acc[category] = validIcons;
    }
    return acc;
  },
  {}
);

// Intelligent synonym map to aid discovery
const SYNONYM_MAP = {
  education: ["graduationcap", "school", "book", "library", "brain", "lightbulb", "pencil", "scroll", "bookmark"],
  academic: ["graduationcap", "school", "book", "library", "scroll", "award"],
  world: ["globe", "globe2", "earth", "map", "mappin", "navigation", "plane"],
  global: ["globe", "globe2", "earth", "plane", "network"],
  money: ["coins", "wallet", "creditcard", "banknote", "landmark", "dollar", "receipt", "piggybank"],
  finance: ["briefcase", "trendingup", "barchart", "piechart", "coins", "wallet", "landmark", "calculator"],
  person: ["user", "users", "circleuser", "contact", "smile"],
  people: ["users", "userplus", "userminus", "contact", "hearthandshake"],
  time: ["clock", "calendar", "timer", "hourglass", "history", "alarmclock"],
  date: ["calendar", "calendardays", "calendarcheck", "clock"],
  mail: ["mail", "mailopen", "inbox", "send", "messagesquare"],
  email: ["mail", "mailopen", "inbox", "send", "atmark", "atsign"],
  security: ["lock", "shield", "shieldcheck", "key", "fingerprint", "eyeoff"],
  lock: ["lock", "unlock", "key", "keyround", "shield"],
  settings: ["settings", "sliders", "wrench", "cog"],
  tool: ["wrench", "pen", "pencil", "settings", "hammer"],
  trash: ["trash", "trash2", "delete", "remove"],
  delete: ["trash", "trash2", "x", "circlex", "ban"],
  edit: ["pencil", "pentool", "fileedit", "edit", "edit2", "edit3"],
};

const INITIAL_BATCH_SIZE = 96;
const LOAD_MORE_INCREMENT = 72;

export default function IconPicker({
  value,
  onChange,
  label = "Icon",
  disabled = false,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);

  const searchInputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const currentValue = value || "Award";

  const handleOpenModal = () => {
    if (disabled) return;
    setSearch("");
    setActiveCategory("All");
    setVisibleCount(INITIAL_BATCH_SIZE);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearch("");
  };

  // Keyboard shortcut listener (Escape to close, "/" to focus search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;
      if (e.key === "Escape") {
        setIsModalOpen(false);
      } else if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isModalOpen]);

  // Infinite scroll listener for scroll container
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 120) {
      setVisibleCount((prev) => prev + LOAD_MORE_INCREMENT);
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setVisibleCount(INITIAL_BATCH_SIZE);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleCategoryChange = (catName) => {
    setActiveCategory(catName);
    setVisibleCount(INITIAL_BATCH_SIZE);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Filtered icons based on search query, active category, and synonym matching
  const filteredIcons = useMemo(() => {
    const baseList =
      activeCategory === "All"
        ? ALL_LUCIDE_ICONS
        : ICON_CATEGORIES[activeCategory] || ALL_LUCIDE_ICONS;

    const trimmedSearch = search.trim().toLowerCase();
    if (!trimmedSearch) return baseList;

    // Check if search query matches any synonyms
    const synonymMatches = SYNONYM_MAP[trimmedSearch] || [];

    return baseList.filter((iconName) => {
      const lower = iconName.toLowerCase();
      if (lower.includes(trimmedSearch)) return true;
      return synonymMatches.some((syn) => lower.includes(syn));
    });
  }, [search, activeCategory]);

  // Sliced icons for incremental DOM rendering (prevents mounting 1,700+ elements at once)
  const visibleIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleCount);
  }, [filteredIcons, visibleCount]);

  const handleSelectIcon = (iconName) => {
    if (disabled) return;
    onChange(iconName);
    handleCloseModal();
  };

  const handleClearSearch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSearch("");
    setVisibleCount(INITIAL_BATCH_SIZE);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    searchInputRef.current?.focus();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_INCREMENT);
  };

  return (
    <div className="space-y-1.5 font-sans">
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Trigger Selector Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpenModal}
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
        aria-label={`Current icon is ${currentValue}. Click to open icon picker`}
        className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-red-400 dark:hover:border-red-600 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group shadow-2xs"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <LucideIconRenderer name={currentValue} size={18} aria-hidden="true" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate">
              {currentValue}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block truncate">
              Browse {ALL_LUCIDE_ICONS.length}+ Lucide icons
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[11px] font-bold shrink-0">
          <span>Choose Icon</span>
          <ChevronDown
            size={14}
            className="text-slate-400 group-hover:text-red-600 transition-colors"
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Dedicated Icon Picker Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="icon-picker-title"
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl sm:max-w-3xl h-[580px] sm:h-[620px] max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                  <Sparkles size={18} aria-hidden="true" />
                </div>
                <div>
                  <h3
                    id="icon-picker-title"
                    className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white"
                  >
                    Select Lucide Icon
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Browse all {ALL_LUCIDE_ICONS.length} Lucide icons or search by name
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close icon picker"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Search and Filter Controls */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search size={15} aria-hidden="true" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={`Search ${ALL_LUCIDE_ICONS.length}+ icons (e.g. Award, Book, Globe, Star, Users)...`}
                  aria-label="Search icons"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9.5 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Clear search query"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills (Normal smooth X-axis scroll) */}
              <div
                role="tablist"
                aria-label="Icon categories"
                onWheel={(e) => {
                  if (e.deltaY !== 0) {
                    e.currentTarget.scrollLeft += e.deltaY;
                  }
                }}
                className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]"
              >
                {/* "All" Tab */}
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === "All"}
                  onClick={() => handleCategoryChange("All")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${activeCategory === "All"
                      ? "bg-red-600 text-white shadow-xs font-extrabold"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                >
                  All ({ALL_LUCIDE_ICONS.length})
                </button>

                {/* Curated Categories */}
                {Object.entries(ICON_CATEGORIES).map(([catName, iconList]) => {
                  const isSelected = activeCategory === catName;
                  return (
                    <button
                      key={catName}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => handleCategoryChange(catName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${isSelected
                          ? "bg-red-600 text-white shadow-xs font-extrabold"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                    >
                      {catName} ({iconList.length})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Icon Grid / Empty State */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 [scrollbar-width:thin]"
            >
              {/* Dynamic Status Counter */}
              {filteredIcons.length > 0 && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium px-1 mb-3">
                  <span>
                    {search
                      ? `Found ${filteredIcons.length} icon${filteredIcons.length === 1 ? "" : "s"}`
                      : `${activeCategory} Icons`}
                  </span>
                  <span>
                    Showing {visibleIcons.length} of {filteredIcons.length}
                  </span>
                </div>
              )}

              {filteredIcons.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center mb-3 shadow-xs">
                    <SearchX size={28} className="text-slate-400 dark:text-slate-500" aria-hidden="true" />
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                    Search results not found
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
                    No icons found matching{" "}
                    <span className="font-bold text-red-600 dark:text-red-400">
                      "{search}"
                    </span>
                    {activeCategory !== "All" && (
                      <>
                        {" "}
                        in category{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          "{activeCategory}"
                        </span>
                      </>
                    )}
                    . Try searching with another keyword or clear the search.
                  </p>
                  <div className="flex items-center gap-2">
                    {search && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="px-3.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/40 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-950/70 transition cursor-pointer"
                      >
                        Clear search
                      </button>
                    )}
                    {activeCategory !== "All" && (
                      <button
                        type="button"
                        onClick={() => handleCategoryChange("All")}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        Show all categories
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5">
                    {visibleIcons.map((iconName) => {
                      const isSelected = currentValue === iconName;

                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => handleSelectIcon(iconName)}
                          title={iconName}
                          aria-label={`Select ${iconName} icon`}
                          aria-pressed={isSelected}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-colors cursor-pointer group relative ${isSelected
                              ? "bg-red-50 dark:bg-red-950/50 border-red-500 text-red-600 dark:text-red-400 font-extrabold shadow-xs ring-2 ring-red-500/20"
                              : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-red-400 dark:hover:border-red-700 hover:bg-white dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 hover:shadow-xs"
                            }`}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <LucideIconRenderer name={iconName} size={24} aria-hidden="true" />
                          </div>
                          <span className="text-[10px] mt-1 truncate min-w-0 w-full text-center block font-semibold">
                            {iconName}
                          </span>

                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                              <Check size={9} strokeWidth={3} aria-hidden="true" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Load More Button if more icons available */}
                  {visibleCount < filteredIcons.length && (
                    <div className="pt-2 pb-4 text-center">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
                      >
                        Load More Icons ({filteredIcons.length - visibleCount} remaining)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <span>Selected:</span>
                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <LucideIconRenderer name={currentValue} size={14} className="text-red-600 dark:text-red-400" aria-hidden="true" />
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{currentValue}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer shadow-2xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
