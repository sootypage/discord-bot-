export function Container({ children }) {
  return <div className="mx-auto w-full max-w-6xl px-4">{children}</div>;
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/55 p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, desc }) {
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-zinc-200">{title}</div>
      {desc ? <div className="mt-1 text-xs text-zinc-400">{desc}</div> : null}
    </div>
  );
}

export function Button({ children, href, onClick, variant = "primary", type = "button" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99]";
  const styles =
    variant === "primary"
      ? "bg-indigo-500 hover:bg-indigo-400 text-white"
      : variant === "ghost"
      ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
      : variant === "danger"
      ? "bg-rose-600 hover:bg-rose-500 text-white"
      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100";

  if (href) {
    return (
      <a className={`${base} ${styles}`} href={href}>
        {children}
      </a>
    );
  }
  return (
    <button className={`${base} ${styles}`} onClick={onClick} type={type}>
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, placeholder, hint }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-zinc-300">{label}</span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-indigo-500"
      />
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}

export function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-200">
      {children}
    </span>
  );
}

export function Divider() {
  return <div className="my-4 h-px bg-zinc-800" />;
}