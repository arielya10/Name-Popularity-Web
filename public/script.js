let myChart;

// Add event listeners to update the chart when the name input or other form fields change
document.getElementById('name').addEventListener('input', debounce(updateChart, 300));  // Debounced input
document.getElementById('M_status').addEventListener('change', updateChart);
document.getElementById('F_status').addEventListener('change', updateChart);
document.getElementById('religion').addEventListener('change', updateChart);

// Debounce function to delay input processing
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

// Function to fetch data and update chart dynamically
function updateChart() {
    const name = document.getElementById('name').value;
    const M_status = document.getElementById('M_status').checked;
    const F_status = document.getElementById('F_status').checked;
    const religion = document.getElementById('religion').value;

    // If the name input is empty, clear the chart and messages
    if (!name) {
        clearChartAndMessages();
        return;
    }

    const data = {
        name: name,
        M_status: M_status ? 'on' : '',
        F_status: F_status ? 'on' : '',
        religion: religion
    };

    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';
        result.messages.forEach(message => {
            const p = document.createElement('p');
            p.textContent = message;
            messagesDiv.appendChild(p);
        });

        const ctx = document.getElementById('chart').getContext('2d');
        if (myChart) {
            myChart.destroy();
        }
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: result.year_M.length ? result.year_M : result.year_F,
                datasets: [
                    {
                        label: 'גברים',
                        data: result.amount_M,
                        borderColor: '#4b77a9',
                        backgroundColor: 'rgba(75, 119, 169, 0.2)',
                        fill: true,
                        hidden: !result.year_M.length
                    },
                    {
                        label: 'נשים',
                        data: result.amount_F,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                        fill: true,
                        hidden: !result.year_F.length
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'שנים',
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'כמות'
                        }
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to clear chart and messages when name input is empty
function clearChartAndMessages() {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = ''; // Clear messages

    if (myChart) {
        myChart.destroy(); // Clear the chart
    }
}
