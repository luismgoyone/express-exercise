import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const privateKey = process.env.SECRET_KEY || 'random'

type TokenType = {
  id: number
  iat: number
}

const tokenAuthentication = async (request: Request, response: Response, next: NextFunction) => {
  try { 
    const authorizationHeader = request.headers['authorization']

    if(!authorizationHeader || !authorizationHeader.startsWith('Bearer ')){
      return response.status(401).setHeader('WWW-Authenticate', 'Basic').send({ "error": "Not Authenticated!" })
    }
    // Extract the token
    const token = authorizationHeader.substring('Bearer '.length)

    const decodedToken = jwt.verify(token, privateKey) as Partial<TokenType>

    // app.locals object 
    response.locals.tokenId = decodedToken.id

    next()
  } catch (error){
    return response.status(404).send({ "error":"Invalid token!" })
  }
}

export default tokenAuthentication