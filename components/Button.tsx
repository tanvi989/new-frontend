import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center px-6 py-3 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

  const variants = {
    primary:
      "bg-charcoal text-white border-2 border-charcoal shadow-brutal hover:bg-black",
    secondary:
      "bg-burnt-orange text-white border-2 border-charcoal shadow-brutal hover:bg-opacity-90",
    outline:
      "bg-transparent border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
