import { IncomingHttpHeaders } from "http";

export interface LogoutHeaders extends IncomingHttpHeaders {
  "x-user-token"?: string;
}
