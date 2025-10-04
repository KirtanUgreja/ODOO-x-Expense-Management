import type { Expense, User, Company } from "./types"

export const generateBulkExpensePDF = async (
  expenses: Expense[],
  company: Company,
  users: User[],
  title: string
) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const totalAmount = expenses.reduce((sum, e) => sum + (e.convertedAmount || e.amount), 0)
  const expenseRows = expenses.map(expense => {
    const employee = users.find(u => u.id === expense.employeeId)
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 8px;">${expense.id}</td>
        <td style="padding: 12px 8px;">${employee?.name || 'Unknown'}</td>
        <td style="padding: 12px 8px;">${expense.currency} ${expense.amount.toLocaleString()}</td>
        <td style="padding: 12px 8px;">${expense.category}</td>
        <td style="padding: 12px 8px;">${new Date(expense.date).toLocaleDateString()}</td>
        <td style="padding: 12px 8px;">
          <span style="padding: 4px 8px; border-radius: 12px; font-size: 11px; color: white; background-color: ${expense.status === 'approved' ? '#059669' : expense.status === 'rejected' ? '#dc2626' : '#6b7280'};">
            ${expense.status.toUpperCase()}
          </span>
        </td>
        <td style="padding: 12px 8px;">${expense.receiptUrl ? '📎' : '-'}</td>
      </tr>
    `
  }).join('')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - ${company.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #374151; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #6366f1; margin-bottom: 5px; }
        .document-title { font-size: 18px; color: #6b7280; }
        .summary { margin: 20px 0; padding: 15px; background-color: #f9fafb; border-radius: 8px; }
        .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f3f4f6; padding: 12px 8px; text-align: left; border: 1px solid #d1d5db; font-weight: bold; }
        td { padding: 12px 8px; border: 1px solid #e5e7eb; }
        @media print { body { margin: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${company.name}</div>
        <div class="document-title">${title}</div>
      </div>
      
      <div class="summary">
        <div class="summary-row">
          <strong>Total Expenses:</strong>
          <span>${expenses.length}</span>
        </div>
        <div class="summary-row">
          <strong>Total Amount:</strong>
          <span>${company.currency} ${totalAmount.toLocaleString()}</span>
        </div>
        <div class="summary-row">
          <strong>Generated:</strong>
          <span>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Expense ID</th>
            <th>Employee</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
            <th>Status</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          ${expenseRows}
        </tbody>
      </table>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          }
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

export const generateExpensePDF = async (
  expense: Expense,
  company: Company,
  employee: User
) => {
  // Create a new window for PDF generation
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const receiptImage = expense.receiptUrl 
    ? `<div style="margin-top: 20px; page-break-inside: avoid;">
         <h3 style="margin-bottom: 10px; color: #374151;">Receipt:</h3>
         <img src="${expense.receiptUrl}" alt="Receipt" style="max-width: 100%; height: auto; border: 1px solid #d1d5db; border-radius: 8px;" />
       </div>`
    : ''

  const approvalHistory = expense.approvalHistory.length > 0
    ? `<div style="margin-top: 20px;">
         <h3 style="margin-bottom: 10px; color: #374151;">Approval History:</h3>
         <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
           <thead>
             <tr style="background-color: #f9fafb;">
               <th style="padding: 8px; border: 1px solid #d1d5db; text-align: left;">Step</th>
               <th style="padding: 8px; border: 1px solid #d1d5db; text-align: left;">Approver</th>
               <th style="padding: 8px; border: 1px solid #d1d5db; text-align: left;">Action</th>
               <th style="padding: 8px; border: 1px solid #d1d5db; text-align: left;">Date</th>
               <th style="padding: 8px; border: 1px solid #d1d5db; text-align: left;">Comment</th>
             </tr>
           </thead>
           <tbody>
             ${expense.approvalHistory.map(record => `
               <tr>
                 <td style="padding: 8px; border: 1px solid #d1d5db;">${record.step === -1 ? 'Override' : record.step}</td>
                 <td style="padding: 8px; border: 1px solid #d1d5db;">${record.approverName}</td>
                 <td style="padding: 8px; border: 1px solid #d1d5db; color: ${record.action === 'approved' ? '#059669' : '#dc2626'};">${record.action}</td>
                 <td style="padding: 8px; border: 1px solid #d1d5db;">${new Date(record.timestamp).toLocaleDateString()}</td>
                 <td style="padding: 8px; border: 1px solid #d1d5db;">${record.comment || '-'}</td>
               </tr>
             `).join('')}
           </tbody>
         </table>
       </div>`
    : ''

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Expense Report - ${expense.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #374151; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #6366f1; margin-bottom: 5px; }
        .document-title { font-size: 18px; color: #6b7280; }
        .expense-details { margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #374151; }
        .detail-value { color: #6b7280; }
        .status-badge { 
          padding: 4px 12px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: bold;
          color: white;
          background-color: ${expense.status === 'approved' ? '#059669' : expense.status === 'rejected' ? '#dc2626' : '#6b7280'};
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${company.name}</div>
        <div class="document-title">Expense Report</div>
      </div>
      
      <div class="expense-details">
        <div class="detail-row">
          <span class="detail-label">Expense ID:</span>
          <span class="detail-value">${expense.id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Employee:</span>
          <span class="detail-value">${employee.name} (${employee.email})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Amount:</span>
          <span class="detail-value">${expense.currency} ${expense.amount.toLocaleString()}</span>
        </div>
        ${expense.convertedAmount && expense.currency !== company.currency ? `
        <div class="detail-row">
          <span class="detail-label">Converted Amount:</span>
          <span class="detail-value">${company.currency} ${expense.convertedAmount.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">Category:</span>
          <span class="detail-value">${expense.category}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${new Date(expense.date).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="status-badge">${expense.status.toUpperCase()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Submitted:</span>
          <span class="detail-value">${new Date(expense.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Description:</span>
          <span class="detail-value">${expense.description}</span>
        </div>
      </div>
      
      ${approvalHistory}
      ${receiptImage}
      
      <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
        Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          }
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}