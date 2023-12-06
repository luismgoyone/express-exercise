const jwt = require('jsonwebtoken');
const { AUTH_SECRET } = process.env;

const parseTokenFromAuthHeader = (authorizationHeader) => {
  return (
    authorizationHeader &&
    typeof authorizationHeader === 'string' &&
    authorizationHeader.length
  ) ? authorizationHeader.split(' ')[1] // Get <token> from "Bearer <token>"
    : '';
}

const verifyAuthToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    console.error('no authorization header provided');
    return {
      isValid: false,
      decodedAuthData: null,
    }
  }

  const token = parseTokenFromAuthHeader(authorizationHeader);

  const result = jwt.verify(token, AUTH_SECRET, (err, decodedAuthData) => {
    if (err) {
      return {
        isValid: false,
        decodedAuthData,
      }
    }

    return {
      isValid: true,
      decodedAuthData,
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
    decodedAuthData,
  } = verifyAuthToken(authorizationHeader);

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (!decodedAuthData) {
    return res.status(401).json({ message: 'Invalid decoded auth data' });
  }

  next();
}

module.exports = {
  parseTokenFromAuthHeader,
  verifyAuthToken,
  verifyAuthorizationHeader,
}
