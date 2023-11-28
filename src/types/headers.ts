import { IncomingHttpHeaders } from "http";

export interface LogoutHeaders extends IncomingHttpHeaders {
  "x-user-id"?: string;
  "x-user-token"?: string;
}
