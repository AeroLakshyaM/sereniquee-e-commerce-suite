interface OrderData {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  shipping_address: string | null;
  user?: {
    email?: string;
    full_name?: string;
  };
  order_items: Array<{
    id: string;
    quantity: number;
    price_at_time: number;
    product?: {
      name: string;
    };
  }>;
}

export function generateInvoiceHTML(order: OrderData): string {
  const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subtotal = order.order_items.reduce(
    (sum, item) => sum + item.quantity * item.price_at_time,
    0
  );
  const tax = 0; // Add tax calculation if needed
  const shipping = 0; // Add shipping calculation if needed
  const total = order.total_amount;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.8;
            color: #1a1a1a;
            padding: 40px;
            background: #f5f1e8;
          }
          
          .invoice-container {
            max-width: 850px;
            margin: 0 auto;
            background: #faf8f3;
            padding: 60px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            border: 1px solid #e8e3d6;
          }
          
          .header {
            border-bottom: 2px solid #2c2c2c;
            padding-bottom: 30px;
            margin-bottom: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .company-info {
            flex: 1;
          }
          
          .company-name {
            font-size: 36px;
            font-weight: normal;
            color: #1a1a1a;
            margin-bottom: 8px;
            font-family: 'Georgia', serif;
            letter-spacing: 1px;
          }
          
          .company-tagline {
            color: #5a5a5a;
            font-size: 13px;
            font-style: italic;
            letter-spacing: 0.5px;
          }
          
          .company-contact {
            color: #5a5a5a;
            font-size: 11px;
            margin-top: 8px;
            line-height: 1.6;
          }
          
          .invoice-title {
            text-align: right;
          }
          
          .invoice-title h1 {
            font-size: 48px;
            color: #2c2c2c;
            margin-bottom: 8px;
            font-weight: normal;
            letter-spacing: 2px;
          }
          
          .invoice-number {
            color: #5a5a5a;
            font-size: 13px;
            letter-spacing: 1px;
          }
          
          .info-section {
            display: flex;
            justify-content: space-between;
            margin: 40px 0 50px 0;
            gap: 40px;
          }
          
          .info-box {
            flex: 1;
          }
          
          .info-box h3 {
            color: #2c2c2c;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 12px;
            font-weight: 600;
            letter-spacing: 1.5px;
            border-bottom: 1px solid #d4cdb8;
            padding-bottom: 6px;
          }
          
          .info-box p {
            margin: 6px 0;
            font-size: 14px;
            color: #3a3a3a;
            line-height: 1.6;
          }
          
          .info-box strong {
            color: #1a1a1a;
            font-weight: 600;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 40px 0;
          }
          
          thead {
            background: #2c2c2c;
            color: #faf8f3;
          }
          
          th {
            padding: 14px 16px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          td {
            padding: 14px 16px;
            border-bottom: 1px solid #e8e3d6;
            font-size: 14px;
            color: #2c2c2c;
          }
          
          tbody tr {
            background: #fdfcfa;
          }
          
          tbody tr:nth-child(even) {
            background: #f7f5f0;
          }
          
          .text-right {
            text-align: right;
          }
          
          .totals {
            margin-top: 40px;
            text-align: right;
          }
          
          .totals table {
            margin-left: auto;
            width: 350px;
            border: none;
          }
          
          .totals td {
            padding: 10px 16px;
            font-size: 14px;
            border-bottom: 1px solid #e8e3d6;
          }
          
          .totals td:first-child {
            text-align: left;
            color: #5a5a5a;
          }
          
          .totals td:last-child {
            font-weight: 600;
            color: #1a1a1a;
          }
          
          .totals .total-row {
            background: #e8e3d6;
            color: #1a1a1a;
            font-weight: bold;
            font-size: 18px;
            border-bottom: none;
            border-top: 2px solid #2c2c2c;
          }
          
          .totals .total-row td {
            padding: 16px;
            border-bottom: none;
            color: #1a1a1a;
          }
          
          .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e8e3d6;
            text-align: center;
            color: #7a7a7a;
            font-size: 12px;
            line-height: 1.8;
          }
          
          .footer p {
            margin: 6px 0;
          }
          
          .footer .company-footer {
            margin-top: 20px;
            font-weight: 600;
            color: #2c2c2c;
            letter-spacing: 0.5px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid;
          }
          
          .status-pending { 
            background: #fef8e7; 
            color: #8b6914; 
            border-color: #d4b36a;
          }
          .status-processing { 
            background: #e8f0f8; 
            color: #1e3a5f; 
            border-color: #7aa3cc;
          }
          .status-shipped { 
            background: #f0e8f8; 
            color: #4a1e5f; 
            border-color: #9a7aac;
          }
          .status-delivered { 
            background: #e7f8f0; 
            color: #14513d; 
            border-color: #6aa388;
          }
          .status-cancelled { 
            background: #f8e8e8; 
            color: #5f1e1e; 
            border-color: #cc7a7a;
          }
          
          @media print {
            body {
              padding: 0;
              background: white;
            }
            
            .invoice-container {
              box-shadow: none;
              padding: 40px;
              border: none;
            }
            
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="company-info">
              <div class="company-name">Sereniquee Candles</div>
              <div class="company-tagline">Premium Handcrafted Candles</div>
              <div class="company-contact">
                Email: sereniqueecandles@gmail.com<br>
                Phone: +91 - 9827310636  +91 - 8770222006<br>
                Website: www.sereniqueecandles.com
              </div>
            </div>
            <div class="invoice-title">
              <h1>INVOICE</h1>
              <div class="invoice-number">${invoiceNumber}</div>
            </div>
          </div>
          
          <!-- Info Section -->
          <div class="info-section">
            <div class="info-box">
              <h3>Bill To</h3>
              <p><strong>${order.user?.full_name || 'Customer'}</strong></p>
              <p>${order.user?.email || ''}</p>
              ${order.shipping_address ? `<p>${order.shipping_address}</p>` : ''}
            </div>
            
            <div class="info-box">
              <h3>Invoice Details</h3>
              <p><strong>Date:</strong> ${orderDate}</p>
              <p><strong>Order ID:</strong> ${order.id.slice(0, 8)}</p>
              <p>
                <strong>Status:</strong> 
                <span class="status-badge status-${order.status}">${order.status}</span>
              </p>
            </div>
          </div>
          
          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items
                .map(
                  (item) => `
                <tr>
                  <td>${item.product?.name || 'Product'}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">₹${item.price_at_time.toFixed(2)}</td>
                  <td class="text-right">₹${(item.quantity * item.price_at_time).toFixed(2)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          
          <!-- Totals -->
          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td class="text-right">₹${subtotal.toFixed(2)}</td>
              </tr>
              ${
                tax > 0
                  ? `
              <tr>
                <td>Tax:</td>
                <td class="text-right">₹${tax.toFixed(2)}</td>
              </tr>
              `
                  : ''
              }
              ${
                shipping > 0
                  ? `
              <tr>
                <td>Shipping:</td>
                <td class="text-right">₹${shipping.toFixed(2)}</td>
              </tr>
              `
                  : ''
              }
              <tr class="total-row">
                <td>TOTAL:</td>
                <td class="text-right">₹${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>Thank you for choosing Sereniquee Candles.</p>
            <p style="margin: 12px 0;">
              <strong>Contact Us:</strong><br>
              Email: sereniqueecandles@gmail.com | Phone: +91 9827310636<br>
              Website: www.sereniqueecandles.com
            </p>
            <p class="company-footer">Sereniquee Candles • Premium Handcrafted Candles</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <button 
            onclick="window.print()" 
            style="
              background: #2c2c2c;
              color: #faf8f3;
              border: 1px solid #1a1a1a;
              padding: 14px 32px;
              font-size: 14px;
              font-family: Georgia, serif;
              border-radius: 3px;
              cursor: pointer;
              font-weight: 600;
              letter-spacing: 1px;
              text-transform: uppercase;
              transition: all 0.3s ease;
            "
            onmouseover="this.style.background='#1a1a1a'"
            onmouseout="this.style.background='#2c2c2c'"
          >
            Print / Save as PDF
          </button>
        </div>
      </body>
    </html>
  `;
}

export function downloadInvoice(order: OrderData) {
  const invoiceHTML = generateInvoiceHTML(order);
  const blob = new Blob([invoiceHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${order.id.slice(0, 8)}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function openInvoiceInNewTab(order: OrderData) {
  const invoiceHTML = generateInvoiceHTML(order);
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(invoiceHTML);
    newWindow.document.close();
  }
}
