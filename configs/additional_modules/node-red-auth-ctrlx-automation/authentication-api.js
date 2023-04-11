const https = require('https');
const jwtdecode = require('jwt-decode');

module.exports = {
  checkPermissions: function (token, callback) {
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

  validate: function (token, callback) {
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

  authenticate: function (username, password, callback) {
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
          if (res.statusCode === 200) {
            // Check if status code is 200, which means success
            module.exports.license(jsonObject.access_token, (valid) => {
              if (valid === true) {
                module.exports.checkPermissions(
                  jsonObject.access_token,
                  callback
                );
              } else {
                callback({ error: 'License validation failed.' });
              }
            });
          } else {
            let errorMessage = 'User login failed.';
            if (jsonObject.error_description) {
              errorMessage = jsonObject.error_description;
            }
            callback({ error: errorMessage });
          }
        });
    });

    req.on('error', (error) => {
      console.error(error);
      callback({
        error: 'An error occurred during the authentication process.',
      });
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
        if (res.statusCode === 200) {
          successCallback();
        } else {
          errorCallback();
        }
      });

      req.on('error', (error) => {
        errorCallback();
      });

      req.write(payload);
      req.end();
    }

    var license1 = 'SWL-W-XCx-NREDxFLOWxxxxxx-Y1NN';
    var license2 = 'SWL_XCR_ENGINEERING_4H';

    var checkCounter = 0;
    function onSuccess() {
      callback(true);
    }

    function onError() {
      checkCounter++;
      if (checkCounter === 1) {
        callback(false);
      }
    }

    checkLicense(license1, token, onSuccess, onError);
    //checkLicense(license2, token, onSuccess, onError);
  },
};
