import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../../types/chat";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div
      className={`flex gap-3 animate-[fadeIn_0.3s_ease-out] ${
        message.isBot ? "" : "justify-end"
      }`}
    >
      {message.isBot && (
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-xl">
          <span>🤖</span>
        </div>
      )}
      <div
        className={`max-w-[90%] md:max-w-[70%] px-3 py-2.5 md:px-4 md:py-3.5 rounded-[18px] shadow-sm ${
          message.isBot
            ? "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
            : "bg-gradient-to-br from-teal-500 to-teal-400 text-white rounded-br-sm"
        }`}
      >
        <div className="text-[0.9375rem] leading-relaxed m-0 mb-1">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // --- LISTAS (Recetas y Pasos) ---
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
              ),
              li: ({ node, ...props }) => <li className="pl-1" {...props} />,

              // --- TEXTO ---
              strong: ({ node, ...props }) => (
                <strong className="font-bold text-teal-700" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="mb-2 last:mb-0" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-teal-600 underline hover:text-teal-800 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              em: ({ node, ...props }) => (
                <em className="italic text-gray-600" {...props} />
              ),

              // --- ENCABEZADOS (Títulos de recetas/secciones) ---
              h1: ({ node, ...props }) => (
                <h1
                  className="text-xl font-bold text-teal-800 mt-4 mb-2 border-b border-teal-100 pb-1"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-lg font-bold text-teal-700 mt-3 mb-2"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-base font-semibold text-teal-600 mt-2 mb-1"
                  {...props}
                />
              ),

              // --- TABLAS (Información Nutricional) ---
              // Importante: 'overflow-x-auto' permite scroll horizontal en móviles
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 shadow-sm">
                  <table
                    className="min-w-full divide-y divide-gray-200 bg-white text-sm"
                    {...props}
                  />
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-teal-50" {...props} />
              ),
              tbody: ({ node, ...props }) => (
                <tbody
                  className="divide-y divide-gray-200 bg-white"
                  {...props}
                />
              ),
              tr: ({ node, ...props }) => (
                <tr className="hover:bg-gray-50 transition-colors" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th
                  className="px-4 py-3 text-left font-bold text-teal-800 uppercase tracking-wider text-xs"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td
                  className="px-4 py-3 text-gray-700 whitespace-nowrap md:whitespace-normal"
                  {...props}
                />
              ),

              // --- CITAS (Ideal para el Disclaimer o notas) ---
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-teal-400 bg-teal-50 pl-4 py-2 my-2 italic text-gray-600 rounded-r-lg"
                  {...props}
                />
              ),

              // --- OTROS ---
              hr: ({ node, ...props }) => (
                <hr className="my-4 border-gray-200" {...props} />
              ),
              code: ({ node, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || "");
                return !match ? (
                  <code
                    className="bg-gray-100 text-teal-600 px-1.5 py-0.5 rounded font-mono text-xs"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto my-2 text-xs font-mono">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
        <span className="text-xs opacity-70 block">
          {message.timestamp.toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
