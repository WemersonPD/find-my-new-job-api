import { env } from "@/shared/environment";

async function extractText(fileBuffer: Buffer, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append(
    "fileInput",
    new Blob([new Uint8Array(fileBuffer)], { type: "application/pdf" }),
    filename,
  );
  formData.append("outputFormat", "txt");

  const response = await fetch(`${env.STIRLING_URL}/api/v1/convert/pdf/text`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Stirling extract-text failed: ${response.status}`);
  }

  return response.text();
}

async function ocrPdf(fileBuffer: Buffer, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append(
    "fileInput",
    new Blob([new Uint8Array(fileBuffer)], { type: "application/pdf" }),
    filename,
  );
  formData.append("languages", "eng");

  const response = await fetch(`${env.STIRLING_URL}/api/v1/misc/ocr-pdf`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Stirling ocr-pdf failed: ${response.status}`);
  }

  // OCR returns a PDF — extract text from the response PDF via extract-text
  const pdfBuffer = Buffer.from(await response.arrayBuffer());
  return extractText(pdfBuffer, filename);
}

export async function extractCvText(fileBuffer: Buffer, filename: string): Promise<string> {
  const text = await extractText(fileBuffer, filename);

  if (text.trim().length >= 50) {
    return text;
  }

  // Likely an image-based PDF — fall back to OCR
  return ocrPdf(fileBuffer, filename);
}
