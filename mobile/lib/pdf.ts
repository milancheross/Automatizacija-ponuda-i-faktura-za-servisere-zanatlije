import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Client, Invoice, Quote, QuoteItem, User } from './api';

function formatCurrency(amount: number): string {
  return amount.toLocaleString('sr-RS', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' RSD';
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('sr-RS');
}

function buildItemRows(items: QuoteItem[]): string {
  return items
    .map(
      (item, i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td>${item.name}</td>
        <td class="center">${item.unit}</td>
        <td class="center">${item.quantity}</td>
        <td class="right">${formatCurrency(item.unit_price)}</td>
        <td class="right">${formatCurrency(item.total)}</td>
      </tr>`,
    )
    .join('');
}

export function generateQuotePDF(
  quote: Quote,
  client: Client,
  company: User,
): string {
  const trackingUrl = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'}/q/${quote.id}/accept`;

  return `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ponuda #${quote.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 13px;
      color: #1a1a2e;
      background: #fff;
      padding: 32px 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #1a56db;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .company-name {
      font-size: 22px;
      font-weight: 700;
      color: #1a56db;
    }
    .company-details {
      font-size: 12px;
      color: #555;
      margin-top: 4px;
      line-height: 1.6;
    }
    .doc-title {
      text-align: right;
    }
    .doc-title h1 {
      font-size: 28px;
      color: #1a56db;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .doc-title .doc-number {
      font-size: 14px;
      color: #777;
      margin-top: 4px;
    }
    .doc-title .doc-date {
      font-size: 12px;
      color: #777;
    }
    .info-row {
      display: flex;
      gap: 32px;
      margin-bottom: 24px;
    }
    .info-block {
      flex: 1;
      background: #f7f9fc;
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid #1a56db;
    }
    .info-block h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      margin-bottom: 8px;
    }
    .info-block p {
      font-size: 13px;
      line-height: 1.7;
      color: #222;
    }
    .info-block strong {
      font-size: 15px;
      color: #1a1a2e;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    thead tr {
      background: #1a56db;
      color: #fff;
    }
    thead th {
      padding: 10px 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    thead th.center { text-align: center; }
    thead th.right { text-align: right; }
    tbody tr.even { background: #f7f9fc; }
    tbody tr.odd { background: #fff; }
    tbody td {
      padding: 10px 12px;
      border-bottom: 1px solid #e8ecf0;
      font-size: 13px;
    }
    td.center { text-align: center; }
    td.right { text-align: right; }
    .totals {
      margin-left: auto;
      width: 320px;
      margin-bottom: 24px;
    }
    .totals table {
      margin-bottom: 0;
    }
    .totals td {
      padding: 7px 12px;
      font-size: 13px;
    }
    .totals .label { color: #555; }
    .totals .value { text-align: right; font-weight: 500; }
    .totals tr.discount td { color: #e53e3e; }
    .totals tr.total-row {
      background: #1a56db;
      color: #fff;
      border-radius: 4px;
    }
    .totals tr.total-row td {
      font-size: 15px;
      font-weight: 700;
      padding: 12px;
    }
    .note-block {
      background: #fffbeb;
      border-left: 4px solid #f6ad55;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #744210;
    }
    .note-block strong { display: block; margin-bottom: 4px; }
    .accept-btn {
      display: block;
      width: 100%;
      text-align: center;
      background: #1a56db;
      color: #fff !important;
      text-decoration: none;
      padding: 16px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 24px;
    }
    .footer {
      border-top: 1px solid #e8ecf0;
      padding-top: 16px;
      text-align: center;
      font-size: 11px;
      color: #aaa;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="company-name">${company.company_name}</div>
      <div class="company-details">
        ${company.address ? company.address + '<br/>' : ''}
        ${company.pib ? 'PIB: ' + company.pib + '<br/>' : ''}
        ${company.phone ? 'Tel: ' + company.phone + '<br/>' : ''}
        ${company.email}
      </div>
    </div>
    <div class="doc-title">
      <h1>PONUDA</h1>
      <div class="doc-number">#${quote.id}</div>
      <div class="doc-date">Datum: ${formatDate(quote.created_at)}</div>
      ${quote.valid_until ? `<div class="doc-date">Važi do: ${formatDate(quote.valid_until)}</div>` : ''}
    </div>
  </div>

  <!-- Info row -->
  <div class="info-row">
    <div class="info-block">
      <h3>Ponuđač</h3>
      <p>
        <strong>${company.company_name}</strong><br/>
        ${company.address ?? ''}<br/>
        ${company.pib ? 'PIB: ' + company.pib : ''}
      </p>
    </div>
    <div class="info-block">
      <h3>Klijent</h3>
      <p>
        <strong>${client.name}</strong><br/>
        ${client.phone ? 'Tel: ' + client.phone + '<br/>' : ''}
        ${client.email ? client.email + '<br/>' : ''}
        ${client.address ?? ''}
      </p>
    </div>
  </div>

  <!-- Items table -->
  <table>
    <thead>
      <tr>
        <th>Naziv usluge / materijala</th>
        <th class="center">Jed.mere</th>
        <th class="center">Kol.</th>
        <th class="right">Cena</th>
        <th class="right">Ukupno</th>
      </tr>
    </thead>
    <tbody>
      ${buildItemRows(quote.items)}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <table>
      <tr>
        <td class="label">Međuzbir:</td>
        <td class="value">${formatCurrency(quote.subtotal)}</td>
      </tr>
      ${
        quote.discount_percent > 0
          ? `<tr class="discount">
              <td class="label">Popust (${quote.discount_percent}%):</td>
              <td class="value">- ${formatCurrency(quote.discount_amount)}</td>
             </tr>`
          : ''
      }
      <tr class="total-row">
        <td>UKUPNO ZA UPLATU:</td>
        <td style="text-align:right">${formatCurrency(quote.total)}</td>
      </tr>
    </table>
  </div>

  ${
    quote.note
      ? `<div class="note-block"><strong>Napomena:</strong>${quote.note}</div>`
      : ''
  }

  <!-- Accept CTA -->
  <a class="accept-btn" href="${trackingUrl}">✓ Prihvati ponudu</a>

  <div class="footer">
    Dokument je generisan automatski · Servis Ponuda · ${company.company_name}
  </div>

</body>
</html>`;
}

export function generateInvoicePDF(invoice: Invoice, company: User): string {
  const client = invoice.client!;
  return `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8" />
  <title>Faktura ${invoice.invoice_number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a2e; padding: 32px 40px; }
    .header { display: flex; justify-content: space-between; border-bottom: 3px solid #1a56db; padding-bottom: 20px; margin-bottom: 24px; }
    .company-name { font-size: 22px; font-weight: 700; color: #1a56db; }
    .company-details { font-size: 12px; color: #555; margin-top: 4px; line-height: 1.6; }
    .doc-title h1 { font-size: 28px; color: #1a56db; font-weight: 800; text-align: right; }
    .doc-title p { text-align: right; color: #777; font-size: 12px; }
    .info-row { display: flex; gap: 32px; margin-bottom: 24px; }
    .info-block { flex: 1; background: #f7f9fc; border-radius: 8px; padding: 16px; border-left: 4px solid #1a56db; }
    .info-block h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; }
    .info-block p { font-size: 13px; line-height: 1.7; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    thead tr { background: #1a56db; color: #fff; }
    thead th { padding: 10px 12px; text-align: left; font-size: 12px; }
    thead th.right { text-align: right; } thead th.center { text-align: center; }
    tbody tr:nth-child(even) { background: #f7f9fc; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid #e8ecf0; }
    td.center { text-align: center; } td.right { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .totals td { padding: 7px 12px; }
    .totals .value { text-align: right; }
    .total-row { background: #1a56db; color: #fff; font-weight: 700; font-size: 15px; }
    .status-paid { background: #c6f6d5; color: #276749; padding: 6px 16px; border-radius: 20px; font-weight: 700; display: inline-block; }
    .status-unpaid { background: #fed7d7; color: #9b2c2c; padding: 6px 16px; border-radius: 20px; font-weight: 700; display: inline-block; }
    .footer { border-top: 1px solid #e8ecf0; padding-top: 16px; text-align: center; font-size: 11px; color: #aaa; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">${company.company_name}</div>
      <div class="company-details">
        ${company.address ? company.address + '<br/>' : ''}
        ${company.pib ? 'PIB: ' + company.pib + '<br/>' : ''}
        ${company.phone ? 'Tel: ' + company.phone + '<br/>' : ''}
        ${company.email}
      </div>
    </div>
    <div class="doc-title">
      <h1>FAKTURA</h1>
      <p>Broj: ${invoice.invoice_number}</p>
      <p>Datum izdavanja: ${formatDate(invoice.issued_at)}</p>
      ${invoice.due_at ? `<p>Rok plaćanja: ${formatDate(invoice.due_at)}</p>` : ''}
      <br/>
      <span class="${invoice.status === 'placeno' ? 'status-paid' : 'status-unpaid'}">
        ${invoice.status === 'placeno' ? 'PLAĆENO' : 'NEPLAĆENO'}
      </span>
    </div>
  </div>

  <div class="info-row">
    <div class="info-block">
      <h3>Izdavač</h3>
      <p><strong>${company.company_name}</strong><br/>
      ${company.address ?? ''}<br/>
      ${company.pib ? 'PIB: ' + company.pib : ''}</p>
    </div>
    <div class="info-block">
      <h3>Klijent</h3>
      <p><strong>${client.name}</strong><br/>
      ${client.phone ? 'Tel: ' + client.phone + '<br/>' : ''}
      ${client.email ? client.email + '<br/>' : ''}
      ${client.address ?? ''}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Naziv</th>
        <th class="center">Jed.mere</th>
        <th class="center">Kol.</th>
        <th class="right">Cena</th>
        <th class="right">Ukupno</th>
      </tr>
    </thead>
    <tbody>${buildItemRows(invoice.items)}</tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>Međuzbir:</td><td class="value">${formatCurrency(invoice.subtotal)}</td></tr>
      ${invoice.discount_percent > 0
        ? `<tr><td>Popust (${invoice.discount_percent}%):</td><td class="value">- ${formatCurrency(invoice.discount_amount)}</td></tr>`
        : ''}
      <tr class="total-row">
        <td>UKUPNO:</td><td class="value">${formatCurrency(invoice.total)}</td>
      </tr>
    </table>
  </div>

  ${invoice.note ? `<p style="margin-top:16px;color:#555"><strong>Napomena:</strong> ${invoice.note}</p>` : ''}
  <div class="footer">Servis Ponuda · ${company.company_name}</div>
</body>
</html>`;
}

export async function printQuote(
  quote: Quote,
  client: Client,
  company: User,
): Promise<void> {
  const html = generateQuotePDF(quote, client, company);
  const { uri } = await Print.printToFileAsync({ html });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Ponuda #${quote.id}`,
      UTI: 'com.adobe.pdf',
    });
  } else {
    await Print.printAsync({ html });
  }
}

export async function printInvoice(
  invoice: Invoice,
  company: User,
): Promise<void> {
  const html = generateInvoicePDF(invoice, company);
  const { uri } = await Print.printToFileAsync({ html });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Faktura ${invoice.invoice_number}`,
      UTI: 'com.adobe.pdf',
    });
  } else {
    await Print.printAsync({ html });
  }
}
