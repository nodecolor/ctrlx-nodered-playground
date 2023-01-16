const https = require('https');

module.exports = {
  checkLicense: function (username, password, callback) {
    getToken(username, password, (apiKey) => {
      var apiKey = apiKey;
    });
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
          var data = '';
          if (res.statusCode === 200) {
            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
              try {
                // Find the name "SWL-XCx-RED-NODExREDxxxxx-NNNN in an array of of objects"
                var license = data.find(
                  (obj) => obj.name === 'SWL_XCR_ENGINEERING_4H'
                );
                if (license.name === 'SWL_XCR_ENGINEERING_4H') {
                  var currentDate = new Date();
                  var finalExpirationDate = new Date(
                    license.finalExpirationDate
                  );
                  if (currentDate < finalExpirationDate) {
                    callback(true);
                  } else {
                    callback(false);
                  }
                } else {
                  callback(false);
                }
              } catch (err) {
                callback(false);
              }
            });
          } else {
            callback(false);
          }
        }
      )
      .on('error', (err) => {
        resolve(false);
      });
  },
  /*
  acquireLicense: function(username, password, ccallback) {
    var apiKey = getToken(username, password);
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
  },
*/
  getToken: function (username, password, callback) {
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
          callback(jsonObject.access_token);
        });
    });

    req.on('error', (error) => {
      console.error(error);
      callback(null);
    });

    req.write(data);
    req.end();
  },
};
