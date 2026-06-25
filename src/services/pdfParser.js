import * as pdfjsLib from 'pdfjs-dist'

// Point at our local worker copy (copied to /public during build)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // Join items with space, but add newline when y position changes significantly
    let lastY = null
    let pageText = ''
    for (const item of content.items) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
        pageText += '\n'
      }
      pageText += item.str + ' '
      lastY = item.transform[5]
    }
    fullText += pageText + '\n'
  }

  return fullText.trim()
}
