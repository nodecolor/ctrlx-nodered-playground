const https = require('https');
const jwtdecode = require('jwt-decode');

module.exports = {

  //checkPermissions checks the Node-RED permissions and returns a valid user or null if access denied
  checkPermissions: function (token, callback) {

    //console.log('checkPermissions:', token);

    var jwt;
    try {
      jwt = jwtdecode(token);
    } catch (e) {
      callback(null);
      return;
    }
    user = null;
    access = '';

    jwt.scope.forEach(element => {
      if (access == '' && element == 'ctrlx-node-red-flowforge.web.r') {
        access = 'read';
        user = {
          username: jwt.name,
          permissions: access
        };
      } else if (access == '' && element == 'ctrlx-node-red-flowforge.web.rwx') {
        access = '*';
        user = {
          username: jwt.name,
          permissions: access
        };
      } else if (access == '' && element == 'rexroth-device.all.rwx') {
        access = '*';
        user = {
          username: jwt.name,
          permissions: access
        };
      } else if (access == 'read' && element == 'ctrlx-node-red-flowforge.web.rwx') {
        access = '*';
        user = {
          username: jwt.name,
          permissions: access
        };
      } else if (access == '*' && element == 'ctrlx-node-red-flowforge.web.r') {
        access = '*';
        user = {
          username: jwt.name,
          permissions: access
        };
      } else if (access == 'read' && element == 'rexroth-device.all.rwx') {
        access = '*';
        user = {
          username: jwt.name,
          permissions: access
        };
      } else if (access == '*' && element == 'rexroth-device.all.rwx') {
        access = '*';
        user = {
          username: jwt.name,
          permissions: access
        };
      }
    });
    callback(user);
  },

  //validate validates a given token and returns true if token valid, else false
  validate: function (token, callback) {

    //console.log('validate:', token);

    var options = {
      hostname: 'localhost',
      path: '/identity-manager/api/v1/auth/token/validity',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': "Bearer " + token,
      }
    };

    var req = https.request(options, (res) => {

      let chunks = [];

      res.on('data', (d) => {
        chunks.push(d);

      }).on('end', function () {

        let data = Buffer.concat(chunks);
        let jsonObject = JSON.parse(data);

        //console.log('validation result:', JSON.stringify(jsonObject));

        if (jsonObject.valid === true) {
          module.exports.checkPermissions(token, callback);
          return;
        }
        callback(null);
      });

    });

    req.on('error', (error) => {
      console.error(error);
      callback(null);
    });

    req.end();
  },

  //authenticate checks the username and password and returns a new valid token or null for unknown users
  authenticate: function (username, password, callback) {

    //console.log('authenticate:', username);

    var data = JSON.stringify({
      name: username,
      password: password
    });

    var options = {
      hostname: 'localhost',
      path: '/identity-manager/api/v1/auth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    var req = https.request(options, (res) => {
      let chunks = [];
      res.on('data', (d) => {
        chunks.push(d);
      }).on('end', function () {
        let data = Buffer.concat(chunks);
        let jsonObject = JSON.parse(data);
        module.exports.checkPermissions(jsonObject.access_token, callback);
      });
    });

    req.on('error', (error) => {
      console.error(error);
      callback(null);
    });

    req.write(data);
    req.end();
  },

// Added by FlowForge to check license

  checkLicense: function(username, password) {
    
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
            var data = '';
            if (res.statusCode === 200) {
              res.on('data', (chunk) => {
                data += chunk;
              });
              res.on('end', () => {
                try {
                  // Find the name "SWL-XCx-RED-NODExREDxxxxx-NNNN in an array of of objects"
                  var data = JSON.parse(data);
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
  },

  acquireLicense: function(username, password) {
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

  getToken: function (username, password) {
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
      var req = https.request(options, (res) => {
        res.on('data', (d) => {
          try {
            var jsonObject = JSON.parse(d);
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
}
