var api = require('./authentication-api.js');

module.exports = {
  type: 'credentials',

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
    return new Promise(function (resolve, reject) {
      // Do whatever work is needed to validate the username/password
      // combination.
      api.authenticate(username, password, (user) => {
        if (user && user.error) {
          reject(user.error);
        } else {
          resolve(user);
        }
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
