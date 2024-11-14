const express = require('express');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const jsonfile = require('jsonfile');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Queue, PriorityQueue } = require('./queues');
const { TransactionStack } = require('./transactions');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const paymentQueue = new Queue();
const urgentQueue = new PriorityQueue();
const transactionStack = new TransactionStack();

// File Paths
const invoicePath = path.join(__dirname, 'logs/invoices/');
const dailyLogPath = path.join(__dirname, 'logs/daily_logs/daily_log.json');

// Helper function to generate an invoice PDF
async function generateInvoice(payment) {
    const { userId, billType, amount, status } = payment;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([500, 600]);
    page.drawText(`Invoice for ${billType} Bill`, { x: 50, y: 550 });
    page.drawText(`User ID: ${userId}`, { x: 50, y: 520 });
    page.drawText(`Amount: Rs.${amount}`, { x: 50, y: 490 });
    page.drawText(`Status: ${status}`, { x: 50, y: 460 });
    page.drawText(`Date: ${new Date().toLocaleString()}`, { x: 50, y: 430 });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(`${invoicePath}${userId}_${billType}.pdf`, pdfBytes);
}

// Endpoint to handle bill payment
app.post('/pay', async (req, res) => {
    const { userId, billType, amount, urgent } = req.body;
    const payment = {
        userId,
        billType,
        amount,
        status: 'Pending',
        date: new Date()
    };

    if (urgent) {
        urgentQueue.enqueue(payment);
    } else {
        paymentQueue.enqueue(payment);
    }
    transactionStack.push(payment);
    await generateInvoice(payment);
    res.json({ message: 'Payment request received', payment });
});

// Endpoint to process payments
app.post('/process', (req, res) => {
    const processedPayments = [];
    while (!urgentQueue.isEmpty()) {
        const urgentPayment = urgentQueue.dequeue();
        urgentPayment.status = 'Completed';
        processedPayments.push(urgentPayment);
    }
    if (!paymentQueue.isEmpty()) {
        const payment = paymentQueue.dequeue();
        payment.status = 'Completed';
        processedPayments.push(payment);
    }
    res.json({ message: 'Processed Payments', processedPayments });
    logTransactions(processedPayments);
});

// Endpoint to view transaction history
app.get('/history', (req, res) => {
    const history = transactionStack.getHistory();
    res.json(history);
});

// Log transactions to a JSON file
function logTransactions(transactions) {
    const data = transactions.map(t => ({
        userId: t.userId,
        billType: t.billType,
        amount: t.amount,
        status: t.status,
        date: t.date.toISOString()
    }));

    fs.writeFileSync(dailyLogPath, JSON.stringify(data, null, 2));
}

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
