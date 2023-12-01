module.exports.verifyToken = (authorizationHeader) => {
  if (!authorizationHeader) {
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
