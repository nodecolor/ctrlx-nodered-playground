var api = require('./authentication-api.js');

module.exports = {
  type: 'credentials',

  //By default, access tokens expire after 7 days after they are created. We do not currently support refreshing the token to extend this period.
  //The expiration time can be customised by setting the sessionExpiryTime property of the adminAuth setting.
  //This defines, in seconds, how long a token is valid for.
  //sessionExpiryTime: 36000, // 10h
  //tokenHeader: 'Bearer',

  users: function (username, password) {
    return new Promise(function (resolve) {
      api.checkPermissions(username, password, (user) => {
        resolve(user);
      });
    });
  },
  tokens: function (username, password) {
    return new Promise(function (resolve, reject) {
      api.validate(username, password, (user) => {
        resolve(user);
      });
    });
  },
  authenticate: function (username, password) {
    return new Promise(function (resolve) {
      api.authenticate(username, password, (user) => {
        resolve(user);
      });
    });
  },
  default: function () {
    return new Promise(function (resolve) {
      resolve(null);
    });
  },
};
