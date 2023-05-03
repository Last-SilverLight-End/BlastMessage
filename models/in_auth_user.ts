/* eslint-disable prettier/prettier */
export interface InAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null | undefined;
  photoURL: string | null | undefined;
}
