const request = require('request');

module.exports = {
  checkLicense: async (username, password) => {
    const apiKey = await getToken(username, password);
    return new Promise((resolve, reject) => {
      request.get(
        {
          url: `https://localhost/license-manager/api/v1/capabilities`,
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
        (err, response, body) => {
          if (err) {
            reject(err);
          } else {
            if (response.statusCode === 200) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        }
      );
    });
  },

  acquireLicense: async (username, password) => {
    const apiKey = await getToken(username, password);
    return new Promise((resolve, reject) => {
      request.post(
        {
          url: `https://localhost/license`,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          json: {
            name: 'SWL-XCx-RED-NODExREDxxxxx-NNNN',
            version: '1.0',
          },
        },
        (err, response, body) => {
          if (err) {
            reject(err);
          } else {
            if (response.statusCode === 200) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        }
      );
    });
  },

  getToken: async (username, password) => {
    return new Promise((resolve, reject) => {
      request.post(
        {
          url: `https://localhost/identity-manager/api/v1/auth/token`,
          json: {
            name: username,
            password: password,
          },
        },
        (err, response, body) => {
          if (err) {
            reject(err);
          } else {
            resolve(body.access_token);
          }
        }
      );
    });
  },
};
