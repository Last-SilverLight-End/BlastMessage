import { STATUS_CODES } from 'http';
import { firestore } from 'firebase-admin';
import CustomServerError from '@/controllers/error/custom_server_error';
import FirebaseAdmin from '../firebase_admin';
import { InAuthUser } from '../in_auth_user';
import { InMessage, InMessageServer } from './in_message';

const MEMBER_COL = 'members';
const SCR_NAME_COL = 'screen_names';
const MSG_COL = 'messages';

const { Firestore } = FirebaseAdmin.getInstance();

async function post({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);

  await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);

    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '현존하지 않는 사용자 입니다.' });
    }
    const newMessageRef = memberRef.collection(MSG_COL).doc();
    const newMessageBody: {
      message: string;
      createAt: firestore.FieldValue;
      author?: {
        displayName: string;
        photoURL?: string;
      };
    } = {
      message,
      createAt: firestore.FieldValue.serverTimestamp(),
    };
    if (author !== undefined) {
      newMessageBody.author = author;
    }
    await transaction.set(newMessageRef, newMessageBody);
  });
}

async function list({ uid }: { uid: string; }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const listData = await Firestore.runTransaction(async (transaction: { get: (arg0: any) => any; }) => {
    const memberDoc = await transaction.get(memberRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });
    }
    const messageCol = memberRef.collection(MSG_COL);
    const messageColDoc = await transaction.get(messageCol);
    const data = messageColDoc.docs.map((mapValue: { data: () => Omit<InMessageServer, "id">; id: any; }) => {
      const docData = mapValue.data() as Omit<InMessageServer, 'id'>;
      const returnData = {
        ...docData,
        id: mapValue.id,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      } as InMessage;
      return returnData;
    });
    return data;
  });
  return listData;
}

const MessageModel = {
  post,
  list,
};

export default MessageModel;
