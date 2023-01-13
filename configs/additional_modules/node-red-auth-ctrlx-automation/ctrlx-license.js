const request = require('request');

const productId = 'YOUR_PRODUCT_ID';
const customerId = 'YOUR_CUSTOMER_ID';
const duration = 30;
const apiKey = 'YOUR_API_KEY';
const baseUrl = 'https://api.boschrexroth.com/ctrlx-automation-sdk/licensing';

async function checkLicense() {
  return new Promise((resolve, reject) => {
    request(
      {
        url: `${baseUrl}/status`,
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
      (err, response, body) => {
        if (err) {
          reject(err);
        } else {
          const data = JSON.parse(body);
          if (data.status === 'valid') {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }
    );
  });
}

async function acquireLicense() {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'POST',
        url: `${baseUrl}/acquire`,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        json: {
          productId,
          customerId,
          duration,
        },
      },
      (err, response, body) => {
        if (err) {
          reject(err);
        } else {
          resolve(body);
        }
      }
    );
  });
}
