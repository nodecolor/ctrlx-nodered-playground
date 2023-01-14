const api = require('./authentication-api.js');
const ctrlx = require('./ctrlx-license.js');

module.exports = {
  type: 'credentials',

  //By default, access tokens expire after 7 days after they are created. We do not currently support refreshing the token to extend this period.
  //The expiration time can be customised by setting the sessionExpiryTime property of the adminAuth setting.
  //This defines, in seconds, how long a token is valid for.
  //sessionExpiryTime: 36000, // 10h
  //tokenHeader: 'Bearer',

  users: function (username, password) {
    return new Promise(async function (resolve) {
      // Do whatever work is needed to check username is a valid
      // user.
      valid = true;
      if (valid) {
        //check license
        try {
          const isValid = await ctrlx.checkLicense(username, password);
          if (!isValid) {
            console.log('License is invalid. Acquiring a new license...');
            const license = await ctrlx.acquireLicense(username, password);
            if (license) {
              console.log('License acquired successfully');
              var user = {
                username: username,
                permissions: '*',
              };
              resolve(user);
            } else {
              console.log('Failed to acquire license');
              resolve(null);
            }
          }
          if (isValid) {
            var user = {
              username: username,
              permissions: '*',
            };
            resolve(user);
          }
        } catch (err) {
          console.log(
            `Error occurred while checking or acquiring license`
          );
          resolve(null);
        }
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
    return new Promise(function (resolve) {
      // Do whatever work is needed to validate the username/password
      // combination.
      api.authenticate(username, password, (user) => {
        resolve(user);
      });
    });
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
