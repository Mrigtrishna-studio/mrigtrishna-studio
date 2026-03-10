import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

/**
 * EXCEL EXPORT
 * Uses exceljs to generate a secure .xlsx file
 */
export const exportToExcel = async (data, fileName = 'Studio_Report') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Analytics');

  // Define Columns
  worksheet.columns = [
    { header: 'Metric / Region', key: 'name', width: 30 },
    { header: 'Value', key: 'value', width: 15 },
  ];

  // Add Data
  worksheet.addRows(data);

  // Format Header
  worksheet.getRow(1).font = { bold: true };

  // Generate and Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileName}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

/**
 * PDF EXPORT
 * Uses jspdf and jspdf-autotable directly to avoid prototype errors
 */
export const exportToPDF = (data, title = 'Studio Analytics Report') => {
  const doc = jsPDF();
  
  // Design Header
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Mrigtrishna Studio', 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(title, 14, 30);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

  const tableColumn = ["Metric / Region", "Value"];
  const tableRows = data.map(item => [item.name, item.value]);

  // Use the autoTable function directly
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [212, 175, 55] }, // Gold theme
  });

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};