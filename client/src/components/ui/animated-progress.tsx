import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Step {
  id: string;
  label: string;
  status: "pending" | "active" | "completed";
}

interface AnimatedProgressProps {
  steps: Step[];
  className?: string;
}

export function AnimatedProgress({ steps, className }: AnimatedProgressProps) {
  const completedSteps = steps.filter(step => step.status === "completed").length;
  const activeStepIndex = steps.findIndex(step => step.status === "active");
  
  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full transform -translate-y-1/2 z-0" />
        
        {/* Progress Line */}
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transform -translate-y-1/2 z-10"
          initial={{ width: "0%" }}
          animate={{ 
            width: activeStepIndex >= 0 
              ? `${((completedSteps + 0.5) / steps.length) * 100}%`
              : `${(completedSteps / steps.length) * 100}%`
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        
        {/* Steps */}
        {steps.map((step, index) => (
          <div key={step.id} className="relative z-20 flex flex-col items-center">
            {/* Step Circle */}
            <motion.div
              className={cn(
                "w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-300",
                step.status === "completed" && "bg-green-500 border-green-500",
                step.status === "active" && "bg-blue-500 border-blue-500 animate-pulse",
                step.status === "pending" && "bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
              )}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: step.status === "active" ? 1.1 : 1,
                rotateY: step.status === "completed" ? 360 : 0
              }}
              transition={{ duration: 0.5 }}
            >
              {step.status === "completed" && (
                <motion.svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              )}
              {step.status === "active" && (
                <motion.div
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              {step.status === "pending" && (
                <div className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full" />
              )}
            </motion.div>
            
            {/* Step Label */}
            <motion.p
              className={cn(
                "mt-3 text-sm font-medium transition-colors",
                step.status === "completed" && "text-green-600 dark:text-green-400",
                step.status === "active" && "text-blue-600 dark:text-blue-400",
                step.status === "pending" && "text-gray-500 dark:text-gray-400"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {step.label}
            </motion.p>
          </div>
        ))}
      </div>
    </div>
  );
}