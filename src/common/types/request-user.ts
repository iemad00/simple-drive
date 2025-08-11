export type RequestUser = {
  sub: string; // user id
  roles?: string[]; // ['backend:update'] | ['blob:read'] ...
  iat?: number;
  exp?: number;
};
