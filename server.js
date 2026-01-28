const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

let currentStatus = '營業中'; // Initial status

app.get('/status', (req, res) => {
    res.json({ status: currentStatus });
});

app.post('/status', (req, res) => {
    const { status } = req.body;
    if (status) {
        currentStatus = status;
        res.json({ success: true, status: currentStatus });
    } else {
        res.status(400).json({ success: false, message: 'Status is required' });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
