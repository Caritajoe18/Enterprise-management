import PDFDocument from "pdfkit";
import { Response } from "express";

interface PdfContent {
  title: string;
  fields: { label: string; value: string | number | null }[];
  footer?: string;
}

export const generatePdf = (
  res: Response,
  filename: string,
  content: PdfContent
) => {
  const { title, fields, footer } = content;

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  doc.pipe(res);

  doc.fontSize(20).text(title, { align: "center" });
  doc.moveDown();

  fields.forEach((field) => {
    doc.fontSize(14).text(`${field.label}: ${field.value || "N/A"}`);
  });

  if (footer) {
    doc.moveDown();
    doc.text(footer, { align: "center" });
  }

  doc.end();
};
