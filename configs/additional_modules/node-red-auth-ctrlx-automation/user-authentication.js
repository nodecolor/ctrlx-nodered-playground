var api = require('./authentication-api.js');

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
          permissions: '*'
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
      })
    });
  },
  authenticate: function (username, password) {
<<<<<<< HEAD
    return new Promise(function (resolve) {
      // Do whatever work is needed to validate the username/password
      // combination.
      api.authenticate(username, password, (user) => {
        resolve(user);
      })
=======
    return new Promise(async (resolve, reject) => {
      let isValid = await ctrlx.checkLicense(username, password);
      if (isValid === true) {
        api.authenticate(username, password, (user) => {
          resolve(user);
        });
      } else {
        console.log('License is invalid. Acquiring a new license...');
        let license = await ctrlx.acquireLicense(username, password);
        if (license === true) {
          console.log('License acquired successfully');
          api.authenticate(username, password, (user) => {
            resolve(user);
          });
        } else {
          console.log('Failed to acquire license');
          resolve(null);
        }
      }
>>>>>>> parent of 4d72c6b (fix json.Parse())
    });
  },
  default: function () {
    return new Promise(function (resolve) {
      // Resolve with the user object for the default user.
      // If no default user exists, resolve with null.
      // resolve({anonymous: true, permissions:'read'});
      resolve(null);
    });
  }
}
