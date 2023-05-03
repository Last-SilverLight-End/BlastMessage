import { NextApiRequest, NextApiResponse } from 'next';
import { InAuthUser } from '@/models/in_auth_user';
import MemberModel from '@/models/member/member.model';
import BadReqError from './error/bad_request_error';

async function add(req: NextApiRequest, res: NextApiResponse) {
  const { uid, email, displayName, photoURL } = req.body as Partial<InAuthUser>;
  if (uid === null || uid === undefined) {
    throw new BadReqError('uid가 누락되었습니다.');
  }
  if (email === null || email === undefined) {
    throw new BadReqError('이메일이 누락되었습니다.');
  }

  const addResult = await MemberModel.add({ uid, email, displayName, photoURL });
  if (addResult.result === true) {
    return res.status(200).json(addResult);
  }
  res.status(500).json({ addResult });
}

const MemberCtrl = {
  add,
};

export default MemberCtrl;
