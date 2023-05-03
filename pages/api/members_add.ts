// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import { InAuthUser } from '@/models/in_auth_user';
import MemberModel from '@/models/member/member.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uid, email, displayName, photoURL } = req.body as Partial<InAuthUser>;
  if (uid === null || uid === undefined) {
    return res.status(400).json({ result: false, message: ' uid 가 누락되어 있습니다.' });
  }
  if (email === null || email === undefined) {
    return res.status(400).json({ result: false, message: ' email이 누락되어 있습니다.' });
  }

  const addResult = await MemberModel.add({ uid, email, displayName, photoURL });
  if (addResult.result === true) {
    return res.status(200).json(addResult);
  }
  res.status(500).json({ addResult });
}
