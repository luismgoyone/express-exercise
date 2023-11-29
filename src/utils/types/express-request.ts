import { Request } from 'express' 

// reference: https://stackoverflow.com/questions/48027563/typescript-type-annotation-for-res-body 
interface ExpressCustomRequest<T> extends Request {
  body: T
}

export default ExpressCustomRequest

