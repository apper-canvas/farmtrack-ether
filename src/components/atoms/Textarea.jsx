import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Textarea = forwardRef(({ 
  className, 
  error,
  rows = 3,
  ...props 
}, ref) => {
  const baseClasses = "flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-vertical transition-all duration-200";
  
  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";

  return (
    <textarea
      className={cn(
        baseClasses,
        errorClasses,
        className
      )}
      rows={rows}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;