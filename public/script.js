const paymentForm = document.getElementById('paymentForm');
const processPaymentsBtn = document.getElementById('processPayments');
const historyTableBody = document.getElementById('historyTableBody');

// Function to submit payment request
paymentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const billType = document.getElementById('billType').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const urgent = document.getElementById('urgent').checked;

    const paymentData = { userId, billType, amount, urgent };

    try {
        const response = await fetch('/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();
        alert(result.message);
        paymentForm.reset();
        displayHistory();
    } catch (error) {
        console.error('Error:', error);
    }
});

// Function to process payments
processPaymentsBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/process', { method: 'POST' });
        const result = await response.json();
        alert(result.message);
        displayHistory();
    } catch (error) {
        console.error('Error:', error);
    }
});

// Function to fetch and display transaction history
async function displayHistory() {
    try {
        const response = await fetch('/history');
        const history = await response.json();
        
        // Clear the table body
        historyTableBody.innerHTML = '';

        // Populate table rows
        history.forEach((transaction) => {
            const row = document.createElement('tr');
            const isUrgent = transaction.urgent==true ? 'Yes' : 'No';
            
            // Convert timestamp to a readable format
            const formattedDate = transaction.timestamp 
                ? new Date(transaction.timestamp).toLocaleString() 
                : 'N/A';

            row.innerHTML = `
                <td>${transaction.userId}</td>
                <td>${transaction.billType}</td>
                <td>₹${transaction.amount}</td>
                <td>${isUrgent}</td>
                <td>${formattedDate}</td>
            `;
            historyTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Load transaction history on page load
window.onload = displayHistory;
