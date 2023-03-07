const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

const configYml = './config.yml';
app.use(express.static(path.join('./')));
// Serve the HTML file when the user navigates to the root URL
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission to save the configuration
app.post('/save', function(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const data = JSON.parse(body);
        const yamlData = yaml.dump(data);
        fs.writeFileSync(configYml, yamlData);
        res.sendStatus(200);
    });
});

// Start the server
app.listen(8000, function() {
    console.log('Server started on port 8000');
});
