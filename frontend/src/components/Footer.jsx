import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import { FaFacebook, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";
import logoCircle from "../assets/logo/logo_circle.jpg";
import { contactDetails, brandPartnersData } from "../data/dataset";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const phone1 = contactDetails.phones[0]?.display || "+94 76 033 2537";
  const rawPhone1 = contactDetails.phones[0]?.number || "+94760332537";
  const phone2 = contactDetails.phones[1]?.display || "+94 71 333 2537";
  const rawPhone2 = contactDetails.phones[1]?.number || "+94713332537";
  const address = contactDetails.address.street;
  const whatsappNumber = contactDetails.whatsapp.clean;
  const email = contactDetails.emails[1]?.address || "shree.engsolar@gmail.com";
  const facebookUrl = contactDetails.social.facebook;

  // Clean Real Navigation Routes Only
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <footer className="bg-[#0F172B] text-slate-300 border-t border-slate-800 transition-colors duration-300 font-sans relative">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8 pb-8 sm:pb-10">
          {/* Brand Info */}
          <div className="space-y-4 sm:space-y-5 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 group w-max">
              <img
                src={logoCircle}
                alt="Shree Energy Logo"
                className="h-10 sm:h-11 w-10 sm:w-11 rounded-xl object-contain bg-white/10 p-0.5 border border-white/10 shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white leading-none">
                  SHREE <span className="text-[#008BD7]">ENERGY</span>
                </span>
                <span className="text-[10px] font-bold text-[#63B723] uppercase tracking-wider mt-0.5">
                  (Pvt) Ltd • Sri Lanka
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-light">
              Leading solar energy solutions provider in Sri Lanka, dedicated to delivering reliable, efficient, and cost-effective renewable energy systems for homes and businesses.
            </p>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#63B723] bg-[#63B723]/10 border border-[#63B723]/30 px-3 py-1.5 rounded-xl w-fit">
              <ShieldCheck size={15} />
              <span>Certified Engineers & Tier-1 Systems</span>
            </div>

            {/* Social media icons */}
            <div className="flex gap-2.5 pt-1">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-[#008BD7] hover:text-white flex items-center justify-center text-slate-300 transition-all duration-300 border border-slate-700/60"
              >
                <FaFacebook size={16} />
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-[#63B723] hover:text-white flex items-center justify-center text-slate-300 transition-all duration-300 border border-slate-700/60"
              >
                <FaWhatsapp size={16} />
              </a>
              <a
                href={contactDetails.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-pink-600 hover:text-white flex items-center justify-center text-slate-300 transition-all duration-300 border border-slate-700/60"
              >
                <FaInstagram size={16} />
              </a>
              <a
                href={contactDetails.social.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-red-600 hover:text-white flex items-center justify-center text-slate-300 transition-all duration-300 border border-slate-700/60"
              >
                <FaYoutube size={16} />
              </a>
            </div>
          </div>

          {/* Useful Links - Clean True Navigation Only */}
          <div className="sm:col-span-1">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4 sm:mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#008BD7]"></span>
              Useful Links
            </h4>
            <ul className="space-y-2.5 sm:space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-[#008BD7] transition-colors flex items-center gap-2 text-xs sm:text-sm group"
                  >
                    <ArrowRight size={12} className="text-slate-600 group-hover:text-[#008BD7] group-hover:translate-x-1 transition-all" />
                    <span className="whitespace-nowrap">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Authorized Brands / Products */}
          <div className="sm:col-span-1">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4 sm:mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#63B723]"></span>
              Brand Partners
            </h4>
            <ul className="space-y-2.5 sm:space-y-3">
              {brandPartnersData.map((brand) => (
                <li key={brand.name}>
                  <Link
                    to="/#partners"
                    className="text-slate-400 hover:text-white transition-colors block text-xs sm:text-sm group"
                  >
                    <span className="font-semibold text-slate-200 group-hover:text-[#008BD7] transition-colors whitespace-nowrap">
                      {brand.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {brand.desc}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-4 sm:mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#008BD7]"></span>
              Visit & Contact
            </h4>
            <ul className="space-y-3.5 text-xs sm:text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-[#008BD7] mt-0.5 shrink-0" size={16} />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visit Us</span>
                  <span className="text-slate-300 text-xs sm:text-sm">{address}</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="text-[#63B723] mt-0.5 shrink-0" size={16} />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hotline</span>
                  <a href={`tel:${rawPhone1}`} className="text-slate-200 hover:text-[#008BD7] transition-colors block font-bold text-xs sm:text-sm whitespace-nowrap">
                    {phone1}
                  </a>
                  <a href={`tel:${rawPhone2}`} className="text-slate-400 hover:text-[#008BD7] transition-colors block text-[11px] sm:text-xs whitespace-nowrap">
                    {phone2}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="text-[#008BD7] mt-0.5 shrink-0" size={16} />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Need Help?</span>
                  <a href={`mailto:${email}`} className="text-slate-300 hover:text-[#008BD7] transition-colors text-xs break-all block">
                    {email}
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Highly Responsive Bottom Bar - with extra bottom padding for floating ScrollToTop */}
        <div className="border-t border-slate-800/80 pt-6 sm:pt-8 pb-20 sm:pb-8 md:pb-6 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-5 text-xs text-slate-400">
          {/* Copyright Line */}
          <div className="text-center md:text-left leading-relaxed">
            <span>Copyright &copy; {currentYear} <strong className="text-white font-semibold whitespace-nowrap">Shree Energy</strong></span>
            <span className="hidden sm:inline text-slate-600 mx-2">|</span>
            <span className="block sm:inline mt-1 sm:mt-0 text-slate-400">
              Powered by <strong className="text-[#008BD7] font-semibold whitespace-nowrap">NetIT Technology</strong>
            </span>
          </div>

          {/* Links & Tagline with explicit whitespace-nowrap so words never break awkwardly */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5 gap-y-2 text-center">
            <Link to="/about" className="text-slate-300 hover:text-white transition-colors whitespace-nowrap text-xs font-medium">
              About Us
            </Link>
            <span className="text-slate-600 select-none">•</span>
            <Link to="/contact" className="text-slate-300 hover:text-white transition-colors whitespace-nowrap text-xs font-medium">
              Contact Us
            </Link>
            <span className="text-slate-600 select-none hidden sm:inline">•</span>
            <span className="text-[#63B723] font-semibold whitespace-nowrap text-xs px-2.5 py-0.5 rounded-full bg-[#63B723]/10 border border-[#63B723]/20">
              Reliable • Sustainable • Affordable
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
