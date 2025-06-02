'use client';

import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
  FC
} from 'react';

export type ButtonVariants =
  | 'secondary'
  | 'success'
  | 'primary'
  | 'outline'
  | 'warning'
  | 'danger'
  | 'invert'
  | 'light'
  | 'dark';

interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
  variant?: ButtonVariants;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  outline?: boolean;
  icon?: ReactNode;
  title?: string;
}

const Button: FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  size = 'md',
  children,
  disabled,
  onClick,
  outline,
  title,
  icon
}) => {
  return (
    <button
      className={`rounded-lg px-2  py-2 font-medium transition-all ${
        disabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90'
      } ${
        className || 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
      }`}
      onClick={onClick && onClick}
      disabled={disabled}
    >
      {title && <span>{title}</span>}
      {icon ? icon : null}
    </button>
  );
};

export default Button;
