// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import MemberCtrl from '@/controllers/member.ctrl';
import handleError from '@/controllers/error/handle_error';

import checkSupportMethod from '@/controllers/error/check_support_method';

export default async function add(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const supportedMethond = ['POST', undefined];
  try {
    checkSupportMethod(supportedMethond, method);
    await MemberCtrl.add(req, res);
  } catch (err) {
    console.error(err);
    //TODO 에러처리
    handleError(err, res);
  }
}
