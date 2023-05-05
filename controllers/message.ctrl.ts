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

const MessageCrtl = { post };

export default MessageCrtl;
