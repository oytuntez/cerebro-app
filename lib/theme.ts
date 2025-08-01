export const theme = {
  colors: {
    // Brand colors - Ocean-inspired palette
    primary: "[#006D77]", // Caribbean Current - Main CTA color
    primaryHover: "[#005A63]", // Darker shade for hover
    secondary: "[#83C5BE]", // Tiffany Blue
    background: "[#EDF6F9]", // Alice Blue - Light background
    
    // Text colors
    text: {
      primary: "[#006D77]", // Caribbean Current for primary text
      secondary: "[#005A63]", // Darker shade for secondary text
      muted: "[#4A8B86]" // Muted teal
    },
    
    // UI colors
    border: "[#B5D7D3]", // Light tiffany blue for borders
    card: "white",
    
    // State colors
    hover: "[#F5FAFB]", // Very light alice blue
    accent: "[#FFDDD2]", // Pale Dogwood - Light accent
    destructive: "[#E29578]" // Atomic Tangerine - for warnings/errors
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

