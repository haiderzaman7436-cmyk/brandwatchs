import { Outlet, Link } from "react-router-dom";
import CustomerNav from "./CustomerNav";
import { Package, Instagram, Facebook, Youtube, Mail, Phone, MapPin, ArrowRight, Music2, Truck, RotateCcw, ShieldCheck, Banknote } from "lucide-react";

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/your_handle", label: "Instagram" },
  { icon: Music2, href: "https://www.tiktok.com/@your_handle", label: "TikTok" },
  { icon: Facebook, href: "https://www.facebook.com/share/18ggRFZ8PU", label: "Facebook" },
];

const Footer = () => (
  <footer className="bg-brand-primary text-white border-t border-zinc-900">
    {/* Feature strip */}
    <div className="bg-brand-primary text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: <Truck className="h-8 w-8" />, title: "Fast Delivery", desc: "Nationwide Shipping" },
          { icon: <RotateCcw className="h-8 w-8" />, title: "7 Day Returns", desc: "Hassle-free returns" },
          { icon: <ShieldCheck className="h-8 w-8" />, title: "100% Authentic", desc: "Genuine products only" },
          { icon: <Banknote className="h-8 w-8" />, title: "Cash on Delivery", desc: "Pay when you receive" },
        ].map((f) => (
          <div key={f.title} className="flex flex-col items-center text-center gap-3">
            <span className="text-brand-accent opacity-90">{f.icon}</span>
            <div>
              <p className="text-sm font-bold text-brand-text tracking-widest uppercase">{f.title}</p>
              <p className="text-xs text-brand-secondary mt-1">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
      {/* Brand */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="Brand Logo" className="h-14 w-auto object-contain mix-blend-multiply" />
        </div>
        <p className="text-sm text-brand-secondary leading-relaxed">
          Pakistan's premium online store. Curated collections of luxury watches, fashion, jewellery and more.
        </p>
        <div className="flex items-center gap-4 pt-2">
          {socialLinks.map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"
              aria-label={social.label}
              className="w-10 h-10 rounded-none border border-zinc-800 flex items-center justify-center text-brand-secondary hover:border-amber-500 hover:text-brand-accent hover:bg-brand-background0/10 transition-all">
              <social.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-6">
        <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest">Quick Links</h4>
        <ul className="space-y-3">
          {[
            { label: "Home", to: "/shop" },
            { label: "All Products", to: "/shop/products" },
            { label: "My Orders", to: "/shop/orders" },
            { label: "Wishlist", to: "/shop/wishlist" },
            { label: "My Profile", to: "/shop/profile" },
          ].map((link) => (
            <li key={link.to}>
              <Link to={link.to}
                className="text-sm text-brand-secondary hover:text-brand-accent transition-colors flex items-center gap-2 group">
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Policies */}
      <div className="space-y-6">
        <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest">Information</h4>
        <ul className="space-y-3">
          {[
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Terms of Service", to: "/terms" },
            { label: "Return Policy", to: "/shop/products" },
            { label: "Shipping Info", to: "/shop/products" },
            { label: "FAQ", to: "/shop/products" },
          ].map((link) => (
            <li key={link.label}>
              <Link to={link.to}
                className="text-sm text-brand-secondary hover:text-brand-accent transition-colors flex items-center gap-2 group">
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div className="space-y-6">
        <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest">Contact Us</h4>
        <ul className="space-y-4">
          <li className="flex items-center gap-4 text-sm text-brand-secondary group">
            <div className="w-10 h-10 bg-brand-primary text-white border border-zinc-800 rounded-none flex items-center justify-center shrink-0 group-hover:border-amber-500 transition-colors">
              <Mail className="h-4 w-4 text-zinc-300 group-hover:text-brand-accent transition-colors" />
            </div>
            support@brandwatches.com
          </li>
          <li className="flex items-center gap-4 text-sm text-brand-secondary group">
            <div className="w-10 h-10 bg-brand-primary text-white border border-zinc-800 rounded-none flex items-center justify-center shrink-0 group-hover:border-amber-500 transition-colors">
              <Phone className="h-4 w-4 text-zinc-300 group-hover:text-brand-accent transition-colors" />
            </div>
            03447448769
          </li>
          <li className="flex items-start gap-4 text-sm text-brand-secondary group">
            <div className="w-10 h-10 bg-brand-primary text-white border border-zinc-800 rounded-none flex items-center justify-center shrink-0 group-hover:border-amber-500 transition-colors">
              <MapPin className="h-4 w-4 text-zinc-300 group-hover:text-brand-accent transition-colors" />
            </div>
            Shop LC 93 A ,Civic Center Gujranwala
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-zinc-900 bg-brand-primary text-white py-6">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs tracking-widest uppercase text-brand-secondary">
        <span>© {new Date().getFullYear()} Brand Watches. All rights reserved.</span>
        <span>Premium E-Commerce</span>
      </div>
    </div>
  </footer>
);

const CustomerLayout = () => (
  <div className="min-h-screen bg-brand-background flex flex-col">
    <CustomerNav />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default CustomerLayout;