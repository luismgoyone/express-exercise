const crypto = require('crypto');

function generateAuthToken(length = 32) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        const token = buffer.toString('hex');
        resolve(token);
      }
    });
  });
}

async function getAuthToken() {
  try {
    const token = await generateAuthToken(32);

    return token;
  } catch (error) {
    console.error('Error generating token:', error);
  }
}

module.exports = {
  getAuthToken,
};
