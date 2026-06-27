export async function downloadPdf(el: HTMLElement, year: string): Promise<void> {
  const { default: html2pdf } = await import("html2pdf.js");
  await html2pdf()
    .set({
      margin: [16, 14, 18, 14],
      filename: `Annual-Plan-${year || "Year"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: "#ffffff", useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy", "avoid-all"] },
    })
    .from(el)
    .save();
}
