import { firestore } from 'firebase-admin';

interface MessageBase {
  id: string;
  /**사용자가 남긴 질문 */
  message: string;
  /**댓글 */
  reply?: string;

  authore?: {
    displayName: string;
    photoURL?: string;
  };
}

export interface InMessage extends MessageBase {
  createAt: string;
  replyAt?: string;
}

export interface InMessageServer extends MessageBase {
  createAt: firestore.Timestamp;
  replyAt?: firestore.Timestamp;
}
