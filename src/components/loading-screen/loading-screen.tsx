"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  /**
   * The message to display below the spinner
   */
  message?: string
  /**
   * Whether to show the loading screen
   */
  isLoading?: boolean
  /**
   * The color of the spinner and text
   */
  color?: "default" | "primary" | "secondary" | "accent"
  /**
   * The size of the spinner
   */
  size?: "sm" | "md" | "lg"
  /**
   * Whether to show a backdrop behind the loading screen
   */
  backdrop?: boolean
  /**
   * Optional callback when the backdrop is clicked
   */
  onBackdropClick?: () => void
}

const sizeMap = {
  sm: "size-6",
  md: "size-10",
  lg: "size-16",
}

const colorMap = {
  default: "text-gray-800 dark:text-gray-200",
  primary: "text-blue-600 dark:text-blue-400",
  secondary: "text-purple-600 dark:text-purple-400",
  accent: "text-emerald-600 dark:text-emerald-400",
}

export function LoadingScreen({
  message = "Loading...",
  isLoading = true,
  color = "primary",
  size = "md",
  backdrop = true,
  onBackdropClick,
}: LoadingScreenProps) {
  const [show, setShow] = useState(false)

  // Delay showing the loading screen to avoid flashes for quick operations
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShow(true), 300)
      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [isLoading])

  if (!isLoading && !show) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        backdrop ? "bg-black/25 backdrop-blur-sm" : ""
      }`}
      onClick={backdrop && onBackdropClick ? onBackdropClick : undefined}
    >
      <div className="flex flex-col items-center justify-center p-6 rounded-lg" onClick={(e) => e.stopPropagation()}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className={`${sizeMap[size]} ${colorMap[color]}`}
        >
          <Loader2 className="w-full h-full" />
        </motion.div>

        {message && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mt-4 text-center font-medium ${colorMap[color]}`}
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}
