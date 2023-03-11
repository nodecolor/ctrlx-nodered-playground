const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const { spawn } = require("child_process");

const configYml = "./config.yml";
app.use(express.static(path.join("./")));
// Serve the HTML file when the user navigates to the root URL
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});
// Handle form submission to save the configuration
app.post("/save", function (req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    var data = JSON.parse(body);
    if (data.moduleCache === "true") { 
      data.moduleCache = true;
    }
    var yamlData = yaml.dump(data);
    fs.writeFileSync(configYml, yamlData);
    res.sendStatus(200);
  });
});

// Start and stop device agent functions
var processId = null;


const configPath = path.join(__dirname, 'config.yml');
const dirPath = path.join(__dirname, '/flowforge-device');

function startDeviceAgent(req, res) {
  var process = spawn("flowforge-device-agent", [
    "--port=1882",
    `--config=${configPath}`,
    `--dir=${dirPath}`
  ]);

  process.stdout.on("data", function (data) {
    console.log(data.toString());
    //io.emit('processOutput', data.toString());
  });

  process.stderr.on("data", function (data) {
    console.error(data.toString());
    //io.emit('processOutput', data.toString());
  });

  process.on("exit", function (code) {
    console.log("Process exited with code: " + code);
    //io.emit('processOutput', `Process exited with code: ${code}`);
    processId = null;
  });

  processId = process.pid;
  res.send({ processId: processId });
}


function stopDeviceAgent(req, res) {
  const exec = require("child_process").exec;

  exec(`kill ${processId}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
  res.send("Device agent stopped successfully");
}

function resetDeviceAgent(req, res) {
  const exec = require("child_process").exec;
  exec(`kill ${processId}`);
  exec(`find ${dirPath} -mindepth 1 -maxdepth 1 ! -name module_cache -exec rm -r {} \ +`, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    console.log(`Reset successful`);
  });
  res.send("Device agent reset successfully");
}

app.get("/reset", resetDeviceAgent);
app.get("/start", startDeviceAgent);
app.get("/stop", stopDeviceAgent);

// Endpoint to check the status of the device agent process
app.get('/status', function (req, res) {
  if (processId) {
    res.json({ status: 'running', processId: processId });
  } else {
    res.json({ status: 'stopped' });
  }
});

// Start the server
app.listen(8000, function () {
  console.log("Server started on port 8000");
});
