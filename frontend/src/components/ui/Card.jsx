export default function Card({ className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm border border-slate-200 ${className}`}
      {...props}
    />
  );
}