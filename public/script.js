let myChart;

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

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
                        borderColor: '#4b77a9', // Blue with a softer shade
                        backgroundColor: 'rgba(75, 119, 169, 0.2)', // Semi-transparent fill
                        fill: true,
                        hidden: !result.year_M.length
                    },
                    {
                        label: 'נשים',
                        data: result.amount_F,
                        borderColor: '#e74c3c', // Bright red
                        backgroundColor: 'rgba(231, 76, 60, 0.2)', // Semi-transparent fill
                        fill: true,
                        hidden: !result.year_F.length
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: `שמות חדשים עבור ${data.name}`,
                    fontSize: 18,
                    fontColor: '#fff'
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'שנים',
                            fontColor: '#fff'
                        },
                        ticks: {
                            fontColor: '#fff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'כמות',
                            fontColor: '#fff'
                        },
                        ticks: {
                            fontColor: '#fff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    }
                },
                legend: {
                    labels: {
                        fontColor: '#fff'
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
