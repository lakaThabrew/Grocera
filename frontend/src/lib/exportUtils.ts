import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Converts an array of objects to a CSV string and triggers a download.
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) return;

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Convert objects to CSV rows
  const csvRows = [];
  csvRows.push(headers.join(',')); // Add header row

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Escape quotes and wrap in quotes if it contains a comma
      const stringVal = String(val ?? '');
      if (stringVal.includes(',') || stringVal.includes('"')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    });
    csvRows.push(values.join(','));
  }

  // Trigger download
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Captures an HTML element and exports it as a PDF document.
 */
export async function exportElementToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  try {
    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#000000', // Assuming dark mode
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions to fit the image
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
  }
}
