import { NextApiRequest, NextApiResponse } from 'next';
import MessageModel from '@/models/message/message_model';
import BadReqError from './error/bad_request_error';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { uid, message, author } = req.body;

  if (uid === undefined) {
    throw new BadReqError('uid가 존재하지 않습니다.');
  }
  if (message === undefined) {
    throw new BadReqError('메세지가 존재하지 않습니다.');
  }
  await MessageModel.post({ uid, message, author });
  return res.status(201).end();
}

async function list(req: NextApiRequest, res: NextApiResponse) {
  const { uid } = req.query;

  if (uid === undefined) {
    throw new BadReqError('uid가 존재하지 않습니다.');
  }
  const uidToString = Array.isArray(uid) ? uid[0] : uid;
  const listResp = await MessageModel.list({ uid: uidToString });
  return res.status(200).json(listResp);
}
const MessageCrtl = { post, list };

export default MessageCrtl;
