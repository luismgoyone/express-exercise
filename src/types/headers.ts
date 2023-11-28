import { IncomingHttpHeaders } from "http";

export interface LogoutHeaders extends IncomingHttpHeaders {
  "x-user-name"?: string;
  "x-user-token"?: string;
}
