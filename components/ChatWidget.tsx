import React, { useState, useRef, useEffect } from "react";

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { type: "incoming", text: "Hi.\nHave any questions? Ask away!" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    setChatHistory([...chatHistory, { type: "outgoing", text: message }]);
    setMessage("");

    // Simulate auto-reply
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          type: "incoming",
          text: "Thanks for reaching out! We'll be with you shortly.",
        },
      ]);
    }, 1500);
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isOpen]);

  return (
    <div className="fixed bottom-0 right-0 sm:right-4 md:right-8 z-[100] font-sans flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-full sm:w-[320px] md:w-[360px] h-[450px] md:h-[500px] bg-[#F4F4F4] rounded-xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300 border border-gray-200 ring-1 ring-black/5">
          {/* Header */}
          <div className="bg-[#38364B] p-5 rounded-t-xl flex flex-col justify-center relative shrink-0 h-[80px]">
            <h3 className="text-white text-[17px] font-medium">
              Send us a message
            </h3>
            <button
              onClick={toggleChat}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Decorative gradient/glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col bg-[#F0F2F5] relative overflow-hidden">
            {/* Branding */}
            <div className="px-4 py-2 text-right w-full bg-[#F0F2F5] z-10">
              <span className="text-[11px] text-gray-400 font-normal flex items-center justify-end gap-1">
                Business Messenger by
                <span className="font-bold text-[#38364B] flex items-center">
                  <span className="text-[#8BC540] mr-0.5">jivo</span>chat
                </span>
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.type === "outgoing" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 text-[15px] leading-snug shadow-sm whitespace-pre-line ${
                      msg.type === "outgoing"
                        ? "bg-[#E1FFC7] text-[#1F1F1F] rounded-l-xl rounded-tr-xl rounded-br-none"
                        : "bg-white text-[#1F1F1F] rounded-r-xl rounded-tl-xl rounded-bl-xl"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSend}
              className="bg-white p-3 flex flex-col gap-2 border-t border-gray-200"
            >
              <textarea
                rows={1}
                placeholder="Type here..."
                className="w-full text-sm outline-none text-[#1F1F1F] placeholder:text-gray-400 bg-transparent py-2 px-1 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2 text-gray-400">
                  {/* Menu / Attach */}
                  <button
                    type="button"
                    className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
                  {/* Emoji */}
                  <button
                    type="button"
                    className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                      <line x1="9" y1="9" x2="9.01" y2="9"></line>
                      <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
                    message.trim()
                      ? "bg-[#1F1F1F] text-white hover:bg-black scale-100"
                      : "bg-gray-100 text-gray-400 scale-90"
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collapsed Button - Responsive Design */}
      {!isOpen && (
        <>
          {/* Desktop/Large Screen Button */}
          <button
            onClick={toggleChat}
            className="hidden sm:flex bg-[#38364B] text-white px-6 py-3 rounded-t-xl items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-[#3a3647] transition-all group border-t border-x border-white/10 hover:-translate-y-1"
          >
            <div className="relative">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#8BC540] rounded-full border-2 border-[#38364B]"></div>
            </div>
            <span className="text-[16px] font-medium">Send us a message</span>
            <span className="text-[13px] opacity-60 ml-1 font-normal tracking-wide">
              jivochat
            </span>
          </button>

          {/* Mobile/Small Screen Button - Circle with Envelope Icon */}
          <button
            onClick={toggleChat}
            className="sm:hidden flex bg-[#38364B] text-white w-14 h-14 rounded-full mr-4 mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-[#3a3647] transition-all group hover:scale-105 active:scale-95 items-center justify-center relative"
          >
            {/* Envelope Icon */}
            <div className="relative">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transform -translate-y-0.5"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              
              {/* Online Indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#8BC540] rounded-full border-2 border-[#38364B] animate-pulse"></div>
            </div>
            
        
          </button>
        </>
      )}
    </div>
  );
};