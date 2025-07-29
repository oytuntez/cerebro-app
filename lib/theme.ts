export const theme = {
  colors: {
    // Brand colors - Ocean-inspired blues
    primary: "blue-500", // Main CTA color - ocean blue
    primaryHover: "blue-600",
    background: "[#F8FAFC]", // Light blue-gray background
    
    // Text colors
    text: {
      primary: "slate-800",
      secondary: "slate-600", 
      muted: "slate-500"
    },
    
    // UI colors
    border: "slate-200",
    card: "white",
    
    // State colors
    hover: "blue-50",
    accent: "sky-200" // Light blue accent
  },
  
  // You can extend this with other theme values like
  spacing: {
    page: {
      x: "px-4 md:px-6",
      y: "py-20"
    }
  }
} as const

// Utility function to get color with opacity
export function withOpacity(color: string, opacity: number) {
  return `${color}/${opacity}`
}

