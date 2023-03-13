const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const { spawn } = require('child_process');

const configPath = path.join(process.env.SNAP_DATA,"solutions/activeConfiguration/device-agent/flowforge-device/config.yml");
app.use('/device-agent/', express.static(path.join(__dirname, './')));
// Serve the HTML file when the user navigates to the root URL
app.get('/device-agent/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/device-agent/config.yml', function (req, res) {
  res.sendFile(path.join(process.env.SNAP_DATA, "solutions/activeConfiguration/device-agent/flowforge-device/config.yml"));
});
// Handle form submission to save the configuration
app.post('/device-agent/save', function (req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    var data = JSON.parse(body);
    if (data.moduleCache === 'true') {
      data.moduleCache = true;
    }
    var yamlData = yaml.dump(data);
    fs.writeFileSync(configPath, yamlData);
    res.sendStatus(200);
  });
});

// Start and stop device agent functions
var processId = null;


const dirPath = path.join(process.env.SNAP_DATA,"solutions/activeConfiguration/device-agent/flowforge-device/");


function startDeviceAgent(req, res) {
  var process = spawn(path.join(process.env.SNAP,"bin/node"), [
    path.join(process.env.SNAP,"lib/node_modules/.bin/flowforge-device-agent"),
    '--port=1882',
    `--config=${configPath}`,
    `--dir=${dirPath}`,
  ]);


  process.stdout.on('data', function (data) {
    console.log(data.toString());
    //io.emit('processOutput', data.toString());
  });

  process.stderr.on('data', function (data) {
    console.error(data.toString());
    //io.emit('processOutput', data.toString());
  });

  process.on('exit', function (code) {
    console.log('Process exited with code: ' + code);
    //io.emit('processOutput', `Process exited with code: ${code}`);
    processId = null;
  });

  processId = process.pid;
  res.send({ processId: processId });
}

function stopDeviceAgent(req, res) {
  const exec = require('child_process').exec;

  exec(`kill ${processId}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  res.send('Device agent stopped successfully');
}

function resetDeviceAgent(req, res) {
  const exec = require('child_process').exec;
  exec(`kill ${processId}`);
  exec(
    `find ${dirPath} -mindepth 1 -maxdepth 1 ! -name module_cache -exec rm -r {} \ +`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      console.log(`Reset successful`);
    }
  );
  res.send('Device agent reset successfully');
}

app.get('/device-agent/reset', resetDeviceAgent);
app.get('/device-agent/start', startDeviceAgent);
app.get('/device-agent/stop', stopDeviceAgent);

// Endpoint to check the status of the device agent process
app.get('/device-agent/status', function (req, res) {
  if (processId) {
    res.json({ status: 'running', processId: processId });
  } else {
    res.json({ status: 'stopped' });
  }
});

// Start the server
app.listen(1883, function () {
  console.log('Server started on port 1883');
});
