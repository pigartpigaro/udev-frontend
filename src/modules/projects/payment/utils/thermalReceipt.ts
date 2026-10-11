import type { PrintItem } from '@delicity/capacitor-thermal-printer'
import type { ProjectPayment } from '../types/payment'

const money = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })
const date = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
const paymentTypes = { down_payment: 'DP / Uang muka', installment: 'Termin / cicilan', final: 'Pelunasan' } as const
const methods = { cash: 'Tunai', bank_transfer: 'Transfer bank', other: 'Lainnya' } as const

function wrap(value: string, width = 32): string[] {
  const words = value.trim().split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if (!word) continue
    if (word.length > width) {
      if (line) lines.push(line)
      line = ''
      for (let i = 0; i < word.length; i += width) lines.push(word.slice(i, i + width))
      continue
    }
    if (line && `${line} ${word}`.length > width) { lines.push(line); line = word }
    else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['-']
}

export function buildThermalReceipt(payment: ProjectPayment): PrintItem[] {
  const text = (value: string, bold = false, align: 'left' | 'center' | 'right' = 'left'): PrintItem => ({ type: 'text', value, style: { bold, align } })
  const items: PrintItem[] = [
    text('UDev', true, 'center'),
    text('UDUMBARA DEVELOPMENT', false, 'center'),
    text('STRUK PEMBAYARAN', true, 'center'),
    { type: 'divider', char: '-' },
    ...wrap(`No. transaksi: ${payment.code}`).map((line) => text(line)),
    text(`Tanggal: ${date.format(new Date(`${payment.received_at}T00:00:00`))}`),
    { type: 'divider', char: '-' },
    text('DITERIMA DARI', true),
    ...wrap(payment.invoice.project.customer.name).map((line) => text(line, true)),
    { type: 'divider', char: '-' },
    text('RINCIAN TRANSAKSI', true),
    text('Pembayaran project x1', true),
    ...wrap(payment.invoice.project.name).map((line) => text(line, true)),
    ...wrap(`Kode project: ${payment.invoice.project.code}`).map((line) => text(line)),
    ...wrap(`Invoice: ${payment.invoice.code}`).map((line) => text(line)),
    text(`Jenis: ${paymentTypes[payment.payment_type]}`),
    text(`Metode: ${methods[payment.method]}`),
  ]
  if (payment.reference) items.push(...wrap(`Referensi: ${payment.reference}`).map((line) => text(line)))
  items.push({ type: 'divider', char: '=' }, text('TOTAL DITERIMA', true), text(payment.status === 'received' ? 'PEMBAYARAN SAH' : 'TIDAK BERLAKU'), text(`Rp ${money.format(Number(payment.amount))}`, true, 'center'))
  if (payment.notes) items.push(...wrap(`Catatan: ${payment.notes}`).map((line) => text(line)))
  if (payment.status === 'voided') {
    items.push({ type: 'divider', char: '-' }, ...wrap(`TIDAK BERLAKU - ${payment.void_reason || 'dikoreksi'}`).map((line) => text(line, true)))
  }
  items.push({ type: 'divider', char: '-' }, text('Terima kasih!', true, 'center'), text('Struk bukti penerimaan pembayaran', false, 'center'), text(`Diterima oleh: ${payment.receiver?.name || 'UDev'}`), text('Dicetak melalui UDev', false, 'center'), { type: 'feed', lines: 3 })
  return items
}
