export const theme = {
  colors: {
    // Brand colors
    primary: "yellow-400", // Main CTA color
    primaryHover: "yellow-500",
    background: "[#FDF8F3]", // Cream background
    
    // Text colors
    text: {
      primary: "gray-900",
      secondary: "gray-600",
      muted: "gray-500"
    },
    
    // UI colors
    border: "gray-200",
    card: "white",
    
    // State colors
    hover: "gray-100"
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

