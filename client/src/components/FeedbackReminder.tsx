import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Star, Send, Frown, Meh, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackReminderProps {
  onClose: () => void;
  userEmail?: string;
  userName?: string;
  orderId?: string;
}

export function FeedbackReminder({ onClose, userEmail, userName, orderId }: FeedbackReminderProps) {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [satisfactionLevel, setSatisfactionLevel] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    console.log("Submit clicked, message:", message.trim());
    if (!message.trim()) {
      console.log("Message is empty, returning early");
      return;
    }
    
    setIsSubmitting(true);
    console.log("Submitting feedback...");
    try {
      const payload = {
        userEmail,
        userName,
        orderId,
        message: message.trim(),
        satisfactionLevel,
      };
      console.log("Payload:", payload);
      
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        console.log("Success! Setting submitted to true");
        setSubmitted(true);
        setTimeout(() => {
          // Redirect to admin feedback page
          window.location.href = '/admin/feedback';
        }, 2000);
      } else {
        console.error("API returned error:", responseData);
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
    }
    setIsSubmitting(false);
  };

  const satisfactionOptions = [
    { value: "unsatisfied", icon: Frown, color: "text-red-400", label: "Memnun Değilim" },
    { value: "neutral", icon: Meh, color: "text-yellow-400", label: "Normal" },
    { value: "satisfied", icon: Smile, color: "text-green-400", label: "Memnunum" },
  ];

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed top-20 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl shadow-2xl z-50 max-w-sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-lg mb-2">Teşekkürler!</h3>
          <p className="text-sm opacity-90">
            Geri bildiriminiz başarıyla gönderildi.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-20 right-4 bg-gradient-to-br from-blue-500 to-purple-500 text-white p-6 rounded-2xl shadow-2xl z-50 max-w-sm"
      >
        {!showForm ? (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Geri Bildirim</h3>
                  <p className="text-sm opacity-80">Deneyiminizi paylaşın</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-sm mb-4 opacity-90">
              Siparişiniz tamamlandı! Geri bildiriminizi paylaşmayı unutmayın.
            </p>
            
            <Button
              onClick={() => setShowForm(true)}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-none"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Geri Bildirim Ver
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Hızlı Geri Bildirim</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Geri bildiriminizi yazın:
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Deneyiminizi bizimle paylaşın..."
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Memnuniyet düzeyiniz:
                </label>
                <div className="flex space-x-2">
                  {satisfactionOptions.map((option) => {
                    const IconComponent = option.icon;
                    console.log("Rendering satisfaction option:", option.value, option.label);
                    return (
                      <Button
                        key={option.value}
                        variant="ghost"
                        onClick={() => {
                          console.log("Satisfaction level clicked:", option.value);
                          setSatisfactionLevel(option.value);
                        }}
                        className={`flex-1 p-3 border border-white/20 rounded-xl hover:bg-white/20 ${
                          satisfactionLevel === option.value 
                            ? 'bg-white/30 border-white/50' 
                            : ''
                        }`}
                        title={option.label}
                      >
                        <IconComponent className={`w-6 h-6 ${option.color}`} />
                      </Button>
                    );
                  })}
                </div>
                {satisfactionLevel && (
                  <p className="text-xs text-white/80 mt-2">
                    Seçilen: {satisfactionOptions.find(opt => opt.value === satisfactionLevel)?.label}
                  </p>
                )}
              </div>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Gönder button clicked!");
                  handleSubmit();
                }}
                disabled={!message.trim() || isSubmitting}
                className="w-full bg-white/20 hover:bg-white/30 text-white border-none disabled:opacity-50"
                type="button"
              >
                {isSubmitting ? (
                  "Gönderiliyor..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Gönder
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}