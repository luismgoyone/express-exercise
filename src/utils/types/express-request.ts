import { Request } from 'express' 

interface ExpressCustomRequest<T> extends Request {
  body: T
}

export default ExpressCustomRequest

