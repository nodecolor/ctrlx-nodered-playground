const https = require('https');

function checkLicense(username, password) {
  var apiKey = getToken(username, password);
  https
    .get(
      {
        hostname: 'localhost',
        path: '/license-manager/api/v1/capabilities',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
      (res) => {
        let chunks = [];
        res
          .on('data', (d) => {
            chunks.push(d);
          })
          .on('end', function () {
            let data = Buffer.concat(chunks);
            let jsonObject = JSON.parse(data);
            var license = jsonObject.find(
              (obj) => obj.name === 'SWL_XCR_ENGINEERING_4H'
            );
            if (license.name === 'SWL_XCR_ENGINEERING_4H') {
              var currentDate = new Date();
              var finalExpirationDate = new Date(license.finalExpirationDate);
              if (currentDate < finalExpirationDate) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          });
      }
    )
    .on('error', (error) => {
      console.error(error);
      return false;
    });
}
function getToken(username, password) {
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
        return jsonObject.access_token;
      });
  });

  req.on('error', (error) => {
    console.error(error);
    return null;
  });

  req.write(data);
  req.end();
}
/*
  acquireLicense: function (username, password, callback) {
    var apiKey = getToken(username, password, (apiKey) => {
      var options = {
        hostname: 'localhost',
        path: '/license',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      var req = https.request(options, (res) => {
        if (res.statusCode === 200) {
          callback(true);
        } else {
          callback(false);
        }
      });
      req.on('error', (err) => {
        callback(false);
      });
      req.write(
        JSON.stringify({
          name: 'SWL-XCx-RED-NODExREDxxxxx-NNNN',
          version: '1.0',
        })
      );
      req.end();
    });
  },
  */
