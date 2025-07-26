import { ElementType, ComponentPropsWithoutRef } from 'react'

interface StarBorderProps<T extends ElementType> {
  as?: T
  color?: string
  speed?: string
  className?: string
  children: React.ReactNode
}

export function StarBorder<T extends ElementType = "button">({
  as,
  className = "",
  color,
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || "button"
  const defaultColor = color || "rgb(99, 102, 241)" // indigo-500

  return (
    <Component 
      className={`relative inline-block py-[1px] overflow-hidden rounded-2xl ${className}`} 
      {...props}
    >
      {/* Bottom moving gradient */}
      <div
        className="absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0 opacity-30"
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      
      {/* Top moving gradient */}
      <div
        className="absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0 opacity-30"
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      
      {/* Content container */}
      <div className="relative z-10 border border-gray-200/40 text-center rounded-2xl bg-gradient-to-b from-white/90 to-gray-50/90 backdrop-blur-sm">
        {children}
      </div>
    </Component>
  )
}