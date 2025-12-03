import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../../types/chat";
import { generateAnmiPDF } from "../../utils/pdfGenerator";

interface MessageBubbleProps {
  message: Message;
  fontSizeStyle: string; 
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, fontSizeStyle }) => {
  const hasNutritionalContent =
    message.text.includes("Ingredientes") ||
    message.text.includes("Preparación") ||
    message.text.includes("Valor nutricional") ||
    message.text.includes("| ") || // Tiene tablas markdown
    (message.text.includes("##") && message.text.length > 200);
  const showDownloadButton =
    message.isBot && message.id !== 1 && hasNutritionalContent;

  const isUser = !message.isBot;

  return (
    <div
      className={`flex gap-3 animate-[fadeIn_0.3s_ease-out] ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* 2. Ícono del Bot (solo si no es del usuario) */}
      {!isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-xl
            dark:from-teal-600 dark:to-teal-500" // Clases Dark Mode para el icono del bot
        >
          <span>🤖</span>
        </div>
      )}

      {/* 3. Burbuja de Mensaje */}
      <div
        // 4. Aplicar el tamaño de fuente usando estilos inline
        style={{ fontSize: fontSizeStyle }} 
        
        // 5. Aplicar clases de Dark Mode
        className={`max-w-[90%] md:max-w-[70%] px-3 py-2.5 md:px-4 md:py-3.5 rounded-[18px] shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-teal-500 to-teal-400 text-white rounded-br-sm dark:from-teal-600 dark:to-teal-500" // Usuario: fondo oscuro, texto blanco
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" // Bot: fondo oscuro/gris, texto claro
        }`}
      >
        <div className="leading-relaxed m-0 mb-1">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // --- Markdown Components Adaptados al Dark Mode ---
              
              // Texto
              strong: ({ node, ...props }) => (
                <strong className="font-bold text-teal-700 dark:text-teal-400" {...props} />
              ),
              em: ({ node, ...props }) => (
                <em className="italic text-gray-600 dark:text-gray-400" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-teal-600 underline hover:text-teal-800 transition-colors dark:text-teal-400 dark:hover:text-teal-300"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),

              // Encabezados
              h1: ({ node, ...props }) => (
                <h1
                  className="text-xl font-bold text-teal-800 mt-4 mb-2 border-b border-teal-100 pb-1 dark:text-teal-300 dark:border-teal-900"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-lg font-bold text-teal-700 mt-3 mb-2 dark:text-teal-400"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-base font-semibold text-teal-600 mt-2 mb-1 dark:text-teal-500"
                  {...props}
                />
              ),

              // Tablas (Asegurarse de que los colores de fondo y bordes cambien)
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 shadow-sm dark:border-gray-600">
                  <table
                    className="min-w-full divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-700 text-sm"
                    {...props}
                  />
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-teal-50 dark:bg-gray-800" {...props} />
              ),
              tbody: ({ node, ...props }) => (
                <tbody
                  className="divide-y divide-gray-200 dark:divide-gray-600"
                  {...props}
                />
              ),
              tr: ({ node, ...props }) => (
                <tr className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-600" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th
                  className="px-4 py-3 text-left font-bold text-teal-800 uppercase tracking-wider text-xs dark:text-teal-400"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td
                  className="px-4 py-3 text-gray-700 whitespace-nowrap md:whitespace-normal dark:text-gray-300"
                  {...props}
                />
              ),

              // Citas/Disclaimer
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-teal-400 bg-teal-50 pl-4 py-2 my-2 italic text-gray-600 rounded-r-lg
                    dark:border-teal-600 dark:bg-gray-800 dark:text-gray-400" // Adaptar Dark Mode
                  {...props}
                />
              ),
              
              // Códigos en línea
              code: ({ node, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || "");
                return !match ? (
                  <code
                    className="bg-gray-100 text-teal-600 px-1.5 py-0.5 rounded font-mono text-xs
                        dark:bg-gray-600 dark:text-teal-400"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  // Bloques de código
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto my-2 text-xs font-mono">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              
              // Otros elementos
              p: ({ node, ...props }) => (
                <p className="mb-2 last:mb-0" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
              ),
              li: ({ node, ...props }) => <li className="pl-1" {...props} />,
              hr: ({ node, ...props }) => (
                <hr className="my-4 border-gray-200 dark:border-gray-600" {...props} />
              ),
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
        
        {/* Timestamp y Botón de Descarga */}
        <div className="flex items-center justify-between text-xs opacity-70">
          <span>
            {message.timestamp.toLocaleTimeString("es-PE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {showDownloadButton && (
            <button
              onClick={() => generateAnmiPDF(message.text)}
              className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-800 hover:bg-teal-50 px-2 py-1 rounded-md transition-colors
                dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-gray-600" // Adaptar Dark Mode
              title="Guardar esta información en mi dispositivo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
                  clipRule="evenodd"
                />
              </svg>
              Descargar Ficha
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
