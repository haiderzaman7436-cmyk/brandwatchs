import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { ConfirmationResult } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import loginImage from "../images/login_left-panel_1 (2).jpg";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Package, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_EMAIL = "admin@brandwatches.com";
const REMEMBER_KEY = "brandwatches_remember_email";
const REMEMBER_EMAIL_KEY = "brandwatches_email";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signup, loginWithGoogle, sendPhoneOtp, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"email" | "phone">("email");

  useEffect(() => {
    const remember = localStorage.getItem(REMEMBER_KEY);
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (remember === "true" && savedEmail) {
      setRememberMe(true);
      setEmail(savedEmail);
    }
  }, []);

  const canSubmitEmail = useMemo(() => {
    return email.trim().length > 0 && password.trim().length >= 6;
  }, [email, password]);

  const goNext = (userEmail?: string | null) => {
    const checkEmail = (userEmail ?? email).toLowerCase();
    const isAdmin = checkEmail === ADMIN_EMAIL;
    navigate(isAdmin ? "/admin/dashboard" : "/shop");
  };

  const persistRememberMe = (nextEmail: string) => {
    localStorage.setItem(REMEMBER_KEY, String(rememberMe));
    if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, nextEmail);
    else localStorage.removeItem(REMEMBER_EMAIL_KEY);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitEmail) return;

    setLoading(true);
    try {
      if (isSignup) await signup(email.trim(), password);
      else await login(email.trim(), password);

      persistRememberMe(email.trim());
      goNext(email.trim());
    } catch (err: any) {
      toast({ title: "Authentication Failed", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user?.email) persistRememberMe(user.email);
      goNext(user?.email ?? null);
    } catch (err: any) {
      toast({ title: "Google sign-in failed", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const p = phone.trim();
    if (!p.startsWith("+") || p.length < 8) {
      toast({ title: "Invalid format", description: "Use international format like +92XXXXXXXXXX", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const conf = await sendPhoneOtp(p, "recaptcha-container");
      setConfirmation(conf);
      setOtpSent(true);
      toast({ title: "OTP sent", description: "Check your SMS for the code." });
    } catch (err: any) {
      toast({ title: "Failed", description: err?.message ?? "Try again in a moment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmation) return;
    if (!otp.trim()) { toast({ title: "Required", description: "Please enter the code.", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const res = await confirmation.confirm(otp.trim());
      goNext(res.user.email ?? null);
    } catch (err: any) {
      toast({ title: "Invalid OTP", description: err?.message ?? "Check the code and try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-6xl flex bg-brand-cards shadow-2xl border border-brand-border overflow-hidden min-h-[700px]">
        
        {/* Left Brand Panel (Luxury E-commerce Focus) */}
        <div className="hidden lg:flex w-1/2 relative bg-brand-primary text-white flex-col justify-between p-12">
          {/* Moody background image */}
          <div className="absolute inset-0 z-0">
            <img src={loginImage} alt="Luxury Watches" className="w-full h-full object-cover opacity-40 grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          </div>

          <div className="relative z-10">
            <Link to="/shop" className="flex items-center gap-3 w-max group">
              <div className="w-12 h-12 bg-brand-cards flex items-center justify-center rounded-none group-hover:bg-brand-background0 transition-colors">
                <Package className="h-6 w-6 text-brand-text group-hover:text-brand-text transition-colors" />
              </div>
              <span className="font-bold text-2xl text-brand-text tracking-widest uppercase">Brand Watches</span>
            </Link>
          </div>

          <div className="relative z-10 mt-16 max-w-md">
            <h2 className="text-4xl font-bold text-brand-text mb-6 leading-tight tracking-tight">Unlock Premium Access.</h2>
            <p className="text-brand-secondary text-sm leading-relaxed mb-10 font-light">
              Join the inner circle. Creating an account gives you exclusive access to limited collections, faster checkout, and personalized recommendations.
            </p>
            
            <ul className="space-y-4">
              {[
                "Express checkout on future orders",
                "Real-time order tracking",
                "Exclusive access to limited editions",
                "Personalized style recommendations"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-brand-accent shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative z-10 text-xs text-zinc-600 uppercase tracking-widest mt-16">
            © {new Date().getFullYear()} Brand Watches
          </div>
        </div>

        {/* Right Auth Panel */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-brand-text tracking-tight mb-2">
                {isSignup ? "Create Account" : "Sign In"}
              </h1>
              <p className="text-brand-secondary text-sm">
                {isSignup ? "Enter your details to register." : "Welcome back. Enter your credentials to access your account."}
              </p>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full h-12 mb-6 border border-brand-border bg-brand-cards hover:bg-brand-background text-brand-text font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.69 1.22 9.18 3.61l6.84-6.84C35.93 2.36 30.34 0 24 0 14.64 0 6.6 5.48 2.69 13.44l7.98 6.19C12.53 13.1 17.77 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.63-.15-3.19-.43-4.7H24v9.1h12.7c-.55 2.97-2.23 5.49-4.74 7.18l7.37 5.72C43.99 37.78 46.5 31.73 46.5 24.5z"/>
                <path fill="#FBBC05" d="M10.67 28.63a14.48 14.48 0 010-9.26l-7.98-6.19A24 24 0 000 24c0 3.98.95 7.73 2.69 11.18l7.98-6.55z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.14 15.91-5.82l-7.37-5.72c-2.05 1.38-4.68 2.19-8.54 2.19-6.23 0-11.47-3.6-13.33-8.13l-7.98 6.55C6.6 42.52 14.64 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-zinc-200 flex-1" />
              <span className="text-xs text-brand-secondary uppercase tracking-widest font-medium">Or email / phone</span>
              <div className="h-px bg-zinc-200 flex-1" />
            </div>

            {/* Custom Tabs */}
            <div className="flex border-b border-brand-border mb-8">
              <button
                onClick={() => setTab("email")}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-all ${tab === "email" ? "text-brand-text border-b-2 border-amber-500" : "text-brand-secondary hover:text-brand-text"}`}
              >
                Email
              </button>
              <button
                onClick={() => setTab("phone")}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-all ${tab === "phone" ? "text-brand-text border-b-2 border-amber-500" : "text-brand-secondary hover:text-brand-text"}`}
              >
                Phone
              </button>
            </div>

            <AnimatePresence mode="wait">
              {tab === "email" ? (
                <motion.form key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleEmailSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full h-12 px-4 border border-brand-border bg-brand-background focus:bg-brand-cards focus:border-brand-border focus:outline-none transition-colors text-sm rounded-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-brand-text uppercase tracking-wider">Password</label>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!email.trim()) return toast({ title: "Enter email first", variant: "destructive" });
                          try { await resetPassword(email.trim()); toast({ title: "Reset email sent" }); } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
                        }}
                        className="text-xs text-brand-secondary hover:text-brand-accent transition-colors"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full h-12 px-4 border border-brand-border bg-brand-background focus:bg-brand-cards focus:border-brand-border focus:outline-none transition-colors text-sm rounded-none"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-text transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${rememberMe ? 'bg-brand-background0 border-amber-500' : 'border-zinc-300 group-hover:border-amber-500'}`}>
                        {rememberMe && <CheckCircle2 className="h-3 w-3 text-brand-text" />}
                      </div>
                      <span className="text-xs text-zinc-600 group-hover:text-brand-text transition-colors">Remember me</span>
                    </label>

                    <button type="button" onClick={() => setIsSignup(!isSignup)} className="text-xs font-bold text-brand-text hover:text-brand-accent uppercase tracking-wider transition-colors">
                      {isSignup ? "Log In Instead" : "Create Account"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !canSubmitEmail}
                    className="w-full h-14 mt-4 bg-brand-primary text-white font-bold uppercase tracking-widest text-xs hover:bg-brand-background0 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : isSignup ? "Create Account" : "Sign In"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </motion.form>
              ) : (
                <motion.div key="phone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+923001234567"
                      className="w-full h-12 px-4 border border-brand-border bg-brand-background focus:bg-brand-cards focus:border-brand-border focus:outline-none transition-colors text-sm rounded-none"
                    />
                  </div>

                  <div id="recaptcha-container" />

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-full h-14 bg-brand-primary text-white font-bold uppercase tracking-widest text-xs hover:bg-brand-background0 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Send Verification Code"}
                    </button>
                  ) : (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                      <div>
                        <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">OTP Code</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="w-full h-12 px-4 border border-brand-border bg-brand-background focus:bg-brand-cards focus:border-brand-border focus:outline-none transition-colors text-sm text-center tracking-widest rounded-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={loading}
                        className="w-full h-14 bg-brand-primary text-white font-bold uppercase tracking-widest text-xs hover:bg-brand-background0 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? "Verifying..." : "Verify & Sign In"}
                        {!loading && <ArrowRight className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={() => { setOtp(""); setOtpSent(false); setConfirmation(null); }} className="w-full text-xs text-brand-secondary hover:text-brand-accent transition-colors uppercase tracking-wider">
                        Use a different number
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-12 text-center text-xs text-brand-secondary">
              By proceeding, you agree to our <Link to="/terms" className="text-zinc-600 hover:text-brand-text underline underline-offset-4">Terms</Link> and <Link to="/privacy" className="text-zinc-600 hover:text-brand-text underline underline-offset-4">Privacy Policy</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;