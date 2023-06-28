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
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COL).doc(uid);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    let messageCount = 1; // default count
    const memberDoc = await transaction.get(memberRef);

    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });
    }
    const memberInfo = memberDoc.data() as InAuthUser & { messageCount?: number };
    if (memberInfo.messageCount !== undefined) {
      messageCount = memberInfo.messageCount;
    }
    const newMessageRef = memberRef.collection(MSG_COL).doc();
    const newMessageBody: {
      message: string;
      createAt: firestore.FieldValue;
      author?: {
        displayName: string;
        photoURL?: string;
      };
      messageNo: number;
    } = {
      message,
      messageNo: messageCount,
      createAt: firestore.FieldValue.serverTimestamp(),
    };
    if (author !== undefined) {
      newMessageBody.author = author;
    }
    await transaction.set(newMessageRef, newMessageBody);
    await transaction.update(memberRef, { messageCount: messageCount + 1 });
  });
}

async function updateMessage({ uid, messageId, deny = true }: { uid: string; messageId: string; deny: boolean }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL).doc(uid).collection(MSG_COL).doc(messageId);
  const result = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'invalid document' });
    }
    await transaction.update(messageRef, { deny });
    const messageData = messageDoc.data() as InMessageServer;
    return {
      ...messageData,
      id: messageId,
      deny,
      createAt: messageData.createAt.toDate().toISOString(),
      replyAt: messageData.replyAt ? messageData.replyAt.toDate().toISOString() : undefined,
    };
  });
  return result;
}

async function list({ uid }: { uid: string }) {
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COL).doc(uid);

  const listData = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);

    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });
    }

    const messageCol = memberRef.collection(MSG_COL).orderBy('createAt', 'desc');
    const messageColDoc = await transaction.get(messageCol);
    const data = messageColDoc.docs.map((mapValue) => {
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

async function listWithPage({ uid, page = 1, size = 10 }: { uid: string; page?: number; size?: number }) {
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COL).doc(uid);

  const listData = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);

    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });
    }
    const memberInfo = memberDoc.data() as InAuthUser & { messageCount?: number };
    const { messageCount = 0 } = memberInfo;
    const totalElementCount = messageCount !== 0 ? messageCount - 1 : 0;
    const remainCount = totalElementCount % size;
    const totalPages = (totalElementCount - remainCount) / size + (remainCount > 0 ? 1 : 0);
    const startAtCount = totalElementCount - (page - 1) * size;
    if (startAtCount < 0) {
      return {
        totalElementCount,
        totalPages: 0,
        page,
        size,
        content: [],
      };
    }
    const messageCol = memberRef.collection(MSG_COL).orderBy('messageNo', 'desc').startAt(startAtCount).limit(size);
    const messageColDoc = await transaction.get(messageCol);
    const data = messageColDoc.docs.map((mapValue) => {
      const docData = mapValue.data() as Omit<InMessageServer, 'id'>;
      const returnData = {
        ...docData,
        id: mapValue.id,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      } as InMessage;
      return returnData;
    });
    return {
      totalElementCount,
      totalPages,
      page,
      size,
      content: data,
    };
  });
  return listData;
}

async function get({ uid, messageId }: { uid: string; messageId: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL).doc(uid).collection(MSG_COL).doc(messageId);
  const data = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'invalid user' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'invalid document' });
    }
    const messageData = messageDoc.data() as InMessageServer;
    return {
      ...messageData,
      id: messageId,
      createAt: messageData.createAt.toDate().toISOString(),
      replyAt: messageData.replyAt ? messageData.replyAt.toDate().toISOString() : undefined,
    };
  });
  return data;
}

async function postReply({ uid, messageId, reply }: { uid: string; messageId: string; reply: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL).doc(uid).collection(MSG_COL).doc(messageId);
  await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'invalid user' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'invalid document' });
    }
    const messageData = messageDoc.data() as InMessageServer;
    if (messageData.reply !== undefined) {
      throw new CustomServerError({ statusCode: 400, message: 'already typed comments' });
    }
    await transaction.update(messageRef, { reply, replyAt: firestore.FieldValue.serverTimestamp() });
  });
}

const MessageModel = {
  post,
  updateMessage,
  list,
  listWithPage,
  get,
  postReply,
};

export default MessageModel;
