const jwt = require('jsonwebtoken');
const { AUTH_SECRET } = process.env;

const verifyAuthToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    console.error('no authorization header provided');
    return {
      isValid: false,
      decodedData: null,
    }
  }

  const token = authorizationHeader.split(' ')[1]; // Get <token> from "Bearer <token>"

  const result = jwt.verify(token, AUTH_SECRET, (err, decodedData) => {
    if (err) {
      return {
        isValid: false,
        decodedData,
      }
    }

    return {
      isValid: true,
      decodedData,
    }
  });

  return result;
}

const verifyAuthorizationHeader = async (req, res, next) => { // middleware
  const authorizationHeader = req.headers['Authorization'] || req.headers['authorization'];

  if (!authorizationHeader) {
    return res.status(401).json({ message: 'No `authorization` header provided' });
  }

  const {
    isValid,
    decodedData,
  } = verifyAuthToken(authorizationHeader);

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (!decodedData) {
    return res.status(401).json({ message: 'Invalid decoded data' });
  }

  next();
}

module.exports = {
  verifyAuthToken,
  verifyAuthorizationHeader,
}
