var api = require('./authentication-api.js');
var check = require('./check-license.js');

module.exports = {
  type: 'credentials',

  //By default, access tokens expire after 7 days after they are created. We do not currently support refreshing the token to extend this period.
  //The expiration time can be customised by setting the sessionExpiryTime property of the adminAuth setting.
  //This defines, in seconds, how long a token is valid for.
  //sessionExpiryTime: 36000, // 10h
  //tokenHeader: 'Bearer',

  users: function (username) {
    return new Promise(function (resolve) {
      // Do whatever work is needed to check username is a valid
      // user.
      valid = true;
      if (valid) {
        // Resolve with the user object. It must contain
        // properties 'username' and 'permissions'
        var user = {
          username: username,
          permissions: '*',
        };
        resolve(user);
      } else {
        // Resolve with null to indicate this user does not exist
        resolve(null);
      }
    });
  },
  tokens: function (token) {
    return new Promise(function (resolve, reject) {
      // Do whatever work is needed to check token is valid
      api.validate(token, (user) => {
        resolve(user);
      });
    });
  },
  authenticate: function (username, password) {
    var valid = license(username, password);
    if (valid) {
      return new Promise(function (resolve) {
        // Do whatever work is needed to validate the username/password
        // combination.
        api.authenticate(username, password, (user) => {
          resolve(user);
        });
      });
    } else {
      return new Promise(function (resolve) {
        resolve('License is missing', null);
      });
    }
  },
  default: function () {
    return new Promise(function (resolve) {
      // Resolve with the user object for the default user.
      // If no default user exists, resolve with null.
      // resolve({anonymous: true, permissions:'read'});
      resolve(null);
    });
  },
};

const https = require('https');

function license(username, password) {
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
        var valid = callLicensingEndpoint(jsonObject.access_token);
        return valid;
      });
  });

  req.on('error', (error) => {
    console.error(error);
    reject(error);
  });

  req.write(data);
  req.end();
}

function callLicensingEndpoint(token) {
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
      'Content-Length': payload.length,
      Authorization: `Bearer ${token}`,
    },
  };
  var req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      return true;
    } else {
      return false;
    }
  });

  req.on('error', (error) => {
    reject(error);
  });

  req.write(payload);
  req.end();
}

