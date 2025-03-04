
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  highlight?: boolean;
  isNew?: boolean;
}

export function CustomCard({ children, className, highlight, isNew, ...props }: CustomCardProps) {
  return (
    <div
      className={cn(
        "glass-morphism card-hover rounded-xl p-4 transition-all",
        highlight && "border-primary/50 bg-primary/5",
        isNew && "animate-scale-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
