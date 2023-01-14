const https = require('https');

module.exports = {
  checkLicense: async (username, password) => {
    const apiKey = await getToken(username, password);
    return new Promise((resolve, reject) => {
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
            let data = '';
            if (res.statusCode === 200) {
              res.on('data', (chunk) => {
                data += chunk;
              });
              res.on('end', () => {
                try {
                  const licenses = JSON.parse(data);
                  // Find the license with the name "SWL-XCx-RED-NODExREDxxxxx-NNNN"
                  const license = licenses.find(
                    (lic) => lic.name === 'SWL-XCx-RED-NODExREDxxxxx-NNNN'
                  );
                  if (license) {
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                } catch (err) {
                  reject(err);
                }
              });
            } else {
              resolve(false);
            }
          }
        )
        .on('error', (err) => {
          reject(err);
        });
    });
  },

  acquireLicense: async (username, password) => {
    const apiKey = await getToken(username, password);
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        path: '/license',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      };
      const req = https.request(options, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      req.on('error', (err) => {
        reject(err);
      });
      req.write(
        JSON.stringify({
          name: 'SWL-XCx-RED-NODExREDxxxxx-NNNN',
          version: '1.0',
        })
      );
      req.end();
    });
  },

  getToken: async (username, password) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        path: '/identity-manager/api/v1/auth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const req = https.request(options, (res) => {
        res.on('data', (data) => {
          const body = JSON.parse(data);
          resolve(body.access_token);
        });
      });
      req.on('error', (err) => {
        reject(err);
      });
      req.write(
        JSON.stringify({
          name: username,
          password: password,
        })
      );
      req.end();
    });
  },
};
