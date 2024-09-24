
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json()); // For parsing application/json

// Route to serve the login form
app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login</title>
        </head>
        <body>
            <h1>Login</h1>
            <form id="loginForm">
                <input type="text" id="username" placeholder="Enter username" required>
                <button type="submit">Login</button>
            </form>

            <script>
                document.getElementById('loginForm').addEventListener('submit', function (e) {
                    e.preventDefault();
                    const username = document.getElementById('username').value;
                    localStorage.setItem('username', username);
                    window.location.href = '/';
                });
            </script>
        </body>
        </html>
    `);
});

// Route to serve the chat form
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Chat</title>
        </head>
        <body>
            <h1>Group Chat</h1>
            <div id="chatWindow"></div>

            <form id="messageForm">
                <input type="text" id="messageInput" placeholder="Type a message" required>
                <button type="submit">Send</button>
            </form>

            <script>
                const username = localStorage.getItem('username');
                if (!username) {
                    window.location.href = '/login';
                }

                function loadMessages() {
                    fetch('/messages')
                        .then(response => response.json())
                        .then(messages => {
                            const chatWindow = document.getElementById('chatWindow');
                            chatWindow.innerHTML = '';
                            messages.forEach(msg => {
                                const messageDiv = document.createElement('div');
                                messageDiv.textContent = \`\${msg.username}: \${msg.message}\`;
                                chatWindow.appendChild(messageDiv);
                            });
                        });
                }

                loadMessages();

                document.getElementById('messageForm').addEventListener('submit', function (e) {
                    e.preventDefault();
                    const message = document.getElementById('messageInput').value;

                    fetch('/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username, message })
                    })
                    .then(response => response.json())
                    .then(() => {
                        document.getElementById('messageInput').value = ''; // Clear input
                        loadMessages(); // Reload messages
                    });
                });

                setInterval(loadMessages, 5000); // Optionally reload messages every 5 seconds
            </script>
        </body>
        </html>
    `);
});

// Route to handle message submission
app.post('/messages', (req, res) => {
    const { username, message } = req.body;

    const filePath = path.join(__dirname, 'messages.json');
    let messages = [];

    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        messages = JSON.parse(data);
    }

    // Add the new message
    messages.push({ username, message });

    // Save the updated messages back to the file
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));

    res.json({ status: 'Message saved!' });
});

// Route to fetch all messages
app.get('/messages', (req, res) => {
    const filePath = path.join(__dirname, 'messages.json');
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        const messages = JSON.parse(data);
        res.json(messages);
    } else {
        res.json([]);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
