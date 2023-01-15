const https = require('https');

module.exports = {
  checkLicense: function(username, password) {
    let apiKey = getToken(username, password);
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
            let data = '';
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
                      return true;
                    } else {
                      return false;
                    }
                  } else {
                    return false;
                  }
                } catch (err) {
                  return false;
                }
              });
            } else {
              return false;
            }
          }
        )
        .on('error', (err) => {
          return false;
        });
  },

  acquireLicense: function(username, password) {
    let apiKey = getToken(username, password);
      let options = {
        hostname: 'localhost',
        path: '/license',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      let req = https.request(options, (res) => {
        if (res.statusCode === 200) {
          return true;
        } else {
          return false;
        }
      });
      req.on('error', (err) => {
        return false;
      });
      req.write(
        JSON.stringify({
          name: 'SWL-XCx-RED-NODExREDxxxxx-NNNN',
          version: '1.0',
        })
      );
      req.end();
  },

  getToken: async (username, password) => {
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

    return new Promise((resolve, reject) => {
      let req = https.request(options, (res) => {
        res.on('data', (d) => {
          try {
            let jsonObject = JSON.parse(d);
            resolve(jsonObject.access_token);
          } catch (err) {
            console.log(err);
            reject(err);
          }
        });
      });
      req.on('error', (err) => {
        console.log(err);
        reject(err);
      });
      req.write(data);
      req.end();
    });
  },
};
