import type { ProjectInvoice } from '../types/invoice'

export async function downloadInvoicePdf(invoice: ProjectInvoice, element: HTMLElement): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  const printMargin = 14 * 72 / 25.4
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const contentWidth = pageWidth - printMargin * 2
  const contentHeight = pageHeight - printMargin * 2

  // Render a print-sized clone of the very same invoice sheet shown on screen.
  // The width and spacing match the A4 print stylesheet (@page margin: 14mm).
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    windowWidth: 800,
    onclone: (documentClone) => {
      const renderer = documentClone.querySelector<HTMLElement>('.pdf-renderer')
      if (renderer) {
        renderer.style.left = '0'
        renderer.style.top = '0'
        renderer.style.zIndex = '1'
        renderer.style.opacity = '1'
      }
      const clonedSheet = documentClone.querySelector<HTMLElement>('.invoice-sheet')
      if (clonedSheet) {
        clonedSheet.style.width = '688px'
        clonedSheet.style.minHeight = '0'
        clonedSheet.style.margin = '0'
        clonedSheet.style.padding = '0'
        clonedSheet.style.boxShadow = 'none'
      }
    },
  })

  const sourcePageHeight = Math.floor(canvas.width * contentHeight / contentWidth)
  let sourceY = 0
  while (sourceY < canvas.height) {
    const sliceHeight = Math.min(sourcePageHeight, canvas.height - sourceY)
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = sliceHeight
    const context = pageCanvas.getContext('2d')
    if (!context) throw new Error('PDF halaman invoice tidak dapat dibuat.')
    context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)
    if (sourceY > 0) pdf.addPage()
    pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.94), 'JPEG', printMargin, printMargin, contentWidth, sliceHeight * contentWidth / canvas.width)
    sourceY += sliceHeight
  }

  pdf.save(invoice.code + '.pdf')
}
