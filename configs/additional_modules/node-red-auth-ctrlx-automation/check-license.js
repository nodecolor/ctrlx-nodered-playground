const https = require('https');

module.exports = {
  license: function (username, password, callback) {
    //console.log('authenticate:', username);

    var data = JSON.stringify({
      name: username,
      password: password,
    });

    var options = {
      hostname: 'localhost',
      path: '/identity-manager/api/v2/auth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    var req = https.request(options, (res) => {
      let chunks = [];
      res
        .on('data', (d) => {
          chunks.push(d);
        })
        .on('end', function () {
          let data = Buffer.concat(chunks);
          let jsonObject = JSON.parse(data);
          module.exports.callLicensingEndpoint(jsonObject.access_token, callback);
        });
    });

    req.on('error', (error) => {
      console.error(error);
      callback(null);
    });

    req.write(data);
    req.end();
  },

  callLicensingEndpoint: function (token, callback) {
    var payload = JSON.stringify({
      name: 'SWL_XCR_ENGINEERING_4H',
      version: '1.0',
    });

    var options = {
      hostname: 'localhost',
      //socketPath: '$SNAP_DATA/licensing-service/licensing-service.sock',
      path: '/license-manager/api/v1/license',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${token}`,
      },
    };
      var req = https.request(options, (res) => {
        if (res.statusCode === 200) {
          callback(true);
        } else {
          callback(false);
        }
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(payload);
      req.end();
  },
};
