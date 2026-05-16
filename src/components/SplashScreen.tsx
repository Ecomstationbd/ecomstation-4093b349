import { useEffect, useState } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import defaultLogo from "@/assets/ecomstation-logo.png";

export function SplashScreen() {
  const settings = useSiteSettings();
  const [hide, setHide] = useState(false);
  const [unmount, setUnmount] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHide(true), 1100);
    const t2 = setTimeout(() => setUnmount(true), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (unmount) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-hero bg-background transition-opacity duration-500 ${hide ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      aria-hidden={hide}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl bg-gradient-primary blur-2xl opacity-60 animate-glow-pulse" />
        <img
          src={settings.logo_url || defaultLogo}
          alt={settings.brand_name || "Ecomstation"}
          className="relative h-24 w-24 rounded-3xl shadow-elegant object-cover animate-float"
        />
      </div>
      <div className="mt-6 text-2xl font-bold gradient-text tracking-tight">
        {settings.brand_name || "Ecomstation"}
      </div>
      <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-1/2 bg-gradient-primary animate-[slide_1.1s_ease-in-out_infinite]" />
      </div>
      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </div>
  );
}
