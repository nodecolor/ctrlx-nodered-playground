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

    jwt.scope.forEach((element) => {
      if (access == '' && element == 'ctrlx-node-red-flowforge.web.r') {
        access = 'read';
        user = {
          username: jwt.name,
          permissions: access,
        };
      } else if (
        access == '' &&
        element == 'ctrlx-node-red-flowforge.web.rwx'
      ) {
        access = '*';
        user = {
          username: jwt.name,
          permissions: access,
        };
      } else if (access == '' && element == 'rexroth-device.all.rwx') {
        access = '*';
        user = {
          username: jwt.name,
          permissions: access,
        };
      } else if (
        access == 'read' &&
        element == 'ctrlx-node-red-flowforge.web.rwx'
      ) {
        access = '*';
        user = {
          username: jwt.name,
          permissions: access,
        };
      } else if (access == '*' && element == 'ctrlx-node-red-flowforge.web.r') {
        access = '*';
        user = {
          username: jwt.name,
          permissions: access,
        };
      } else if (access == 'read' && element == 'rexroth-device.all.rwx') {
        access = '*';
        user = {
          username: jwt.name,
          permissions: access,
        };
      } else if (access == '*' && element == 'rexroth-device.all.rwx') {
        access = '*';
        user = {
          username: jwt.name,
          permissions: access,
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
        Accept: 'application/json',
        authorization: 'Bearer ' + token,
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
          module.exports.license(jsonObject.access_token, (valid) => {
            if (valid === true) {
              module.exports.checkPermissions(
                jsonObject.access_token,
                callback
              );
            } else {
              callback(null);
            }
          });
        });
    });

    req.on('error', (error) => {
      console.error(error);
      callback(null);
    });

    req.write(data);
    req.end();
  },

  license: function (token, callback) {
    function checkLicense(licenseName, token, successCallback, errorCallback) {
      var payload = JSON.stringify({
        name: licenseName,
        version: '1.0',
      });
  
      var options = {
        hostname: 'localhost',
        path: '/license-manager/api/v1/license',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length,
          Authorization: 'Bearer ' + token,
        },
      };
  
      var req = https.request(options, (res) => {
        let data = '';
  
        res.on('data', (chunk) => {
          data += chunk;
        });
  
        res.on('end', () => {
          if (res.statusCode === 200) {
            let parsedData = JSON.parse(data);
            successCallback(parsedData.id);
          } else {
            errorCallback();
          }
        });
      });
  
      req.on('error', (error) => {
        errorCallback();
      });
  
      req.write(payload);
      req.end();
    }
  
    function releaseLicense(id, token, errorCallback) {
      var options = {
        hostname: 'localhost',
        path: '/license-manager/api/v1/license/' + id,
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      };
  
      var req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
          errorCallback();
        }
      });
  
      req.on('error', (error) => {
        errorCallback();
      });
  
      req.end();
    }
  
    var license1 = 'SWL-W-XCx-NREDxFLOWxxxxxx-Y1NN';
    var license2 = 'SWL_XCR_ENGINEERING_4H';
  
    var checkCounter = 0;
    function onSuccess(id) {
      releaseLicense(id, token, onError);
      callback(true);
    }
  
    function onError() {
      checkCounter++;
      if (checkCounter === 2) {
        log.warning("No valid Node-RED license is installed or the current license has expired.");
        callback(false);
      }
    }
  
    checkLicense(license1, token, onSuccess, onError);
    checkLicense(license2, token, onSuccess, onError);
  },  
};
