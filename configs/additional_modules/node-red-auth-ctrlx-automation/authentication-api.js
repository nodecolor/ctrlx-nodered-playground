const https = require('https');
const jwtdecode = require('jwt-decode');

const checkUserAccess = (jwt, access) => {
  jwt.scope.forEach((element) => {
    if (access === '' && element === 'ctrlx-node-red-flowforge.web.r') {
      access = 'read';
    } else if (
      access === '' &&
      element === 'ctrlx-node-red-flowforge.web.rwx'
    ) {
      access = '*';
    } else if (access === '' && element === 'rexroth-device.all.rwx') {
      access = '*';
    } else if (
      access === 'read' &&
      element === 'ctrlx-node-red-flowforge.web.rwx'
    ) {
      access = '*';
    } else if (access === '*' && element === 'ctrlx-node-red-flowforge.web.r') {
      access = '*';
    } else if (access === 'read' && element === 'rexroth-device.all.rwx') {
      access = '*';
    } else if (access === '*' && element === 'rexroth-device.all.rwx') {
      access = '*';
    }
  });
  return access;
};

module.exports = {
  // checkPermissions checks the Node-RED permissions and returns a valid user or null if access denied
  checkPermissions: function (username, password, callback) {
    module.exports.token(username, password, (token) => {
      if (token !== null) {
        let jwt;
        try {
          jwt = jwtdecode(token);
        } catch (e) {
          callback(null);
          return;
        }
        const access = checkUserAccess(jwt, '');

        if (access !== '') {
          callback({
            username: jwt.name,
            permissions: access,
          });
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },

  // validate validates a given token and returns true if token valid, else false
  validate: function (username, password, callback) {
    const options = {
      hostname: 'localhost',
      path: '/identity-manager/api/v1/auth/token/validity',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: 'Bearer ' + token,
      },
    };
    const req = https.request(options, (res) => {
      let chunks = [];

      res
        .on('data', (d) => {
          chunks.push(d);
        })
        .on('end', function () {
          let data = Buffer.concat(chunks);
          let jsonObject = JSON.parse(data);

          if (jsonObject.valid === true) {
            module.exports.checkPermissions(username, password, callback);
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

  token: function (username, password, callback) {
    const data = JSON.stringify({
      name: username,
      password: password,
    });
    const options = {
      hostname: 'localhost',
      path: '/identity-manager/api/v2/auth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
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

  authenticate: function (username, password, callback) {
    module.exports.token(username, password, (token) => {
      if (token !== null) {
        module.exports.license(token, (valid) => {
          if (valid === true) {
            module.exports.checkPermissions(username, password, callback);
          } else {
            callback(null);
          }
        });
      } else {
        callback(null);
      }
    });
  },

  license: function (token, callback) {
    function checkLicense(licenseName, token, successCallback, errorCallback) {
      const payload = JSON.stringify({
        name: licenseName,
        version: '1.0',
      });
      const options = {
        hostname: 'localhost',
        path: '/license-manager/api/v1/license',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length,
          Authorization: 'Bearer ' + token,
        },
      };

      const req = https.request(options, (res) => {
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

    const license1 = 'SWL-W-XCx-NREDxFLOWxxxxxx-Y1NN';
    const license2 = 'SWL_XCR_ENGINEERING_4H';

    let checkCounter = 0;
    function onSuccess() {
      callback(true);
    }

    function onError() {
      checkCounter++;
      if (checkCounter === 2) {
        callback(false);
      }
    }

    checkLicense(license1, token, onSuccess, onError);
    checkLicense(license2, token, onSuccess, onError);
  },
};
