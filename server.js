const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const statusFilePath = path.join(__dirname, 'status.json');

// Function to read status from file
const readStatus = () => {
    try {
        if (fs.existsSync(statusFilePath)) {
            const data = fs.readFileSync(statusFilePath, 'utf8');
            const json = JSON.parse(data);
            return json.status;
        }
    } catch (error) {
        console.error('Error reading status file:', error);
    }
    return '營業中'; // Default status
};

// Function to write status to file
const writeStatus = (status) => {
    try {
        fs.writeFileSync(statusFilePath, JSON.stringify({ status }), 'utf8');
    } catch (error) {
        console.error('Error writing status file:', error);
    }
};

let currentStatus = readStatus();
if (!fs.existsSync(statusFilePath)) {
    writeStatus(currentStatus);
}


app.get('/status', (req, res) => {
    res.json({ status: currentStatus });
});

app.post('/status', (req, res) => {
    const { status } = req.body;
    if (status) {
        currentStatus = status;
        writeStatus(currentStatus); // Write to file
        res.json({ success: true, status: currentStatus });
    } else {
        res.status(400).json({ success: false, message: 'Status is required' });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
