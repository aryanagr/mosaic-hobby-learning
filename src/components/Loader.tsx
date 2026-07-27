interface LoaderProps {
  label?: string;
  size?: "small" | "medium" | "large";
}

export function Loader({ label, size = "medium" }: LoaderProps) {
  return (
    <span className={`loader-wrap ${size}`} role={label ? "status" : undefined}>
      <i className="loader-spinner" aria-hidden="true" />
      {label && <span>{label}</span>}
    </span>
  );
}
