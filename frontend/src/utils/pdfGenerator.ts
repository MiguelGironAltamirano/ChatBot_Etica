import { jsPDF } from "jspdf";

export const generateAnmiPDF = (content: string) => {
  const doc = new jsPDF();

  // --- CONFIGURACIÓN INICIAL ---
  const margin = 20;
  const pageWidth = 210;
  const maxLineWidth = pageWidth - margin * 2;
  const pageHeight = 297;
  let yPos = 40; // Posición vertical inicial (debajo del encabezado)

  // Función para verificar si necesitamos nueva página
  const checkPageBreak = (heightToAdd: number) => {
    if (yPos + heightToAdd >= pageHeight - 20) {
      doc.addPage();
      yPos = 30; // Reiniciar posición en nueva página
    }
  };

  // --- 1. ENCABEZADO (Estático) ---
  doc.setFillColor("#0d9488"); // Teal-600
  doc.rect(0, 0, pageWidth, 20, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ANMI - Ficha Nutricional", 15, 13);

  // --- 2. PROCESAMIENTO DEL CONTENIDO (El "Mini-Parser") ---

  // Función para renderizar texto con negritas inline
  const renderTextWithBold = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, baseColor: number[] = [60, 60, 60]) => {
    // Dividir el texto en segmentos (normal y bold)
    const segments: { text: string; bold: boolean }[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Texto antes del bold
      if (match.index > lastIndex) {
        segments.push({ text: text.slice(lastIndex, match.index), bold: false });
      }
      // Texto en bold
      segments.push({ text: match[1], bold: true });
      lastIndex = regex.lastIndex;
    }
    // Texto restante después del último bold
    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex), bold: false });
    }

    // Si no hay negritas, renderizar normal
    if (segments.length === 0) {
      segments.push({ text, bold: false });
    }

    doc.setFontSize(fontSize);
    let currentX = x;
    let currentY = y;
    const lineHeight = fontSize * 0.5;

    segments.forEach((segment) => {
      if (segment.bold) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 118, 110); // Teal para negritas
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(baseColor[0], baseColor[1], baseColor[2]);
      }

      const words = segment.text.split(' ');
      words.forEach((word, idx) => {
        const wordWithSpace = idx < words.length - 1 ? word + ' ' : word;
        const wordWidth = doc.getTextWidth(wordWithSpace);

        // Si la palabra no cabe en la línea actual, saltar a la siguiente
        if (currentX + wordWidth > x + maxWidth) {
          currentX = x;
          currentY += lineHeight;
          checkPageBreak(lineHeight);
        }

        doc.text(wordWithSpace, currentX, currentY);
        currentX += wordWidth;
      });
    });

    return currentY - y + lineHeight; // Retorna la altura usada
  };

  // Función auxiliar para limpiar markdown inline (para casos donde no queremos formato)
  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, "$1") // Quitar negritas
      .replace(/\*(.+?)\*/g, "$1") // Quitar cursivas
      .replace(/`(.+?)`/g, "$1"); // Quitar código inline
  };

  // Dividimos el texto en líneas para analizar una por una
  const lines = content.split("\n");
  let inTable = false;

  lines.forEach((line, index) => {
    line = line.trim();

    // Saltar líneas vacías pero agregar espacio
    if (!line) {
      yPos += 3;
      return;
    }

    // A. DETECCIÓN DE TÍTULOS (###, ##, #)
    if (
      line.startsWith("###") ||
      line.startsWith("##") ||
      line.startsWith("#")
    ) {
      const level = (line.match(/^#+/) || [""])[0].length;
      const titleText = line.replace(/^#+\s*/, "").trim();

      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(level === 1 ? 14 : level === 2 ? 12 : 11);
      doc.setTextColor(15, 118, 110); // Teal oscuro
      doc.text(titleText, margin, yPos);
      yPos += level === 1 ? 10 : 8;
    }

    // B. DETECCIÓN DE LISTAS CON VIÑETAS (- o *)
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      const listText = cleanMarkdown(line.substring(2).trim());

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);

      checkPageBreak(7);
      doc.circle(margin + 2, yPos - 1, 1, "F");

      const splitText = doc.splitTextToSize(listText, maxLineWidth - 5);
      doc.text(splitText, margin + 6, yPos);

      const textHeight = splitText.length * 5;
      yPos += textHeight + 2;
    }

    // C. DETECCIÓN DE LISTAS NUMERADAS (1., 2., etc.)
    else if (/^\d+\.\s/.test(line)) {
      const matches = line.match(/^(\d+)\.\s(.+)$/);
      if (matches) {
        const number = matches[1];
        const listText = cleanMarkdown(matches[2]);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);

        checkPageBreak(7);
        doc.setFont("helvetica", "bold");
        doc.text(`${number}.`, margin, yPos);
        doc.setFont("helvetica", "normal");

        const splitText = doc.splitTextToSize(listText, maxLineWidth - 8);
        doc.text(splitText, margin + 8, yPos);

        const textHeight = splitText.length * 5;
        yPos += textHeight + 2;
      }
    }

    // D. DETECCIÓN DE TABLAS (líneas con |)
    else if (line.includes("|")) {
      // Saltar líneas separadoras de tabla (|---|---|)
      if (line.includes("---")) {
        inTable = true;
        return;
      }

      const cells = line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell);

      checkPageBreak(10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);

      // Si es la primera fila de la tabla (header), usar negrita
      if (!inTable || index === 0) {
        doc.setFont("helvetica", "bold");
      }

      const cellWidth = maxLineWidth / cells.length;
      cells.forEach((cell, i) => {
        const cleanCell = cleanMarkdown(cell);
        doc.text(cleanCell, margin + i * cellWidth, yPos, {
          maxWidth: cellWidth - 2,
        });
      });

      yPos += 6;
      inTable = true;
    }

    // E. DETECCIÓN DE BLOCKQUOTES (>)
    else if (line.startsWith("> ")) {
      const quoteText = cleanMarkdown(line.substring(2));

      checkPageBreak(10);
      doc.setDrawColor(45, 212, 191); // Teal
      doc.setLineWidth(2);
      doc.line(margin, yPos - 3, margin, yPos + 5);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);

      const splitText = doc.splitTextToSize(quoteText, maxLineWidth - 8);
      doc.text(splitText, margin + 6, yPos);

      const textHeight = splitText.length * 5;
      yPos += textHeight + 4;
    }

    // F. LÍNEAS CON NEGRITAS COMO SUBTÍTULOS (ej: **PURECITO MORENO**)
    else if (/^\*\*[^*]+\*\*$/.test(line)) {
      const boldText = line.replace(/\*\*/g, '');

      checkPageBreak(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 118, 110); // Teal
      doc.text(boldText, margin, yPos);
      yPos += 7;
    }
    
    // G. LÍNEAS EN CURSIVA (disclaimers, notas importantes)
    else if (line.startsWith("*") && line.endsWith("*") && !line.includes("**")) {
      const italicText = cleanMarkdown(line);

      checkPageBreak(10);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      
      const splitText = doc.splitTextToSize(italicText, maxLineWidth);
      const textHeight = splitText.length * 5;
      
      checkPageBreak(textHeight);
      doc.text(splitText, margin, yPos);
      yPos += textHeight + 4;
    }

    // H. TEXTO NORMAL (Párrafos) - Ahora con soporte para negritas inline
    else {
      inTable = false; // Resetear flag de tabla

      // Si el texto contiene negritas, usar la función especial
      if (line.includes("**")) {
        checkPageBreak(10);
        const heightUsed = renderTextWithBold(line, margin, yPos, maxLineWidth, 10, [60, 60, 60]);
        yPos += heightUsed + 3;
      } else {
        const cleanText = cleanMarkdown(line);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        const splitText = doc.splitTextToSize(cleanText, maxLineWidth);
        const textHeight = splitText.length * 5;

        checkPageBreak(textHeight);
        doc.text(splitText, margin, yPos);
        yPos += textHeight + 3;
      }
    }
  });

  // --- 3. PIE DE PÁGINA (En todas las páginas) ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 10;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Fuente: ANMI (Basado en MINSA/OMS). Información educativa.", margin, footerY);
  }

  // --- 4. GUARDAR EL PDF ---
  const timestamp = new Date().toLocaleDateString('es-PE').replace(/\//g, '-');
  doc.save(`Ficha_ANMI_${timestamp}.pdf`);
};