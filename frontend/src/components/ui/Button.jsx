export default function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-teal-400",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus:ring-teal-400",
    danger: "bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-400",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}