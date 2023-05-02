// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import { transcode } from 'buffer';
import FirebaseAdmin from '@/models/firebase_admin';
import { InAuthUser } from '@/models/in_auth_user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uid, email, displayName, photoURL } = req.body as Partial<InAuthUser>;
  if (uid === null || uid === undefined) {
    return res.status(400).json({ result: false, message: ' uid 가 누락되어 있습니다.' });
  }
  if (email === null || email === undefined) {
    return res.status(400).json({ result: false, message: ' email이 누락되어 있습니다.' });
  }

  try {
    const screenName = (email as string).replace('@gmail.com', '');

    const addResult = await FirebaseAdmin.getInstance().Firebase.runTransaction(async (transaction) => {
      const memberRef = FirebaseAdmin.getInstance().Firebase.collection('members').doc(uid);

      const screenRef = FirebaseAdmin.getInstance().Firebase.collection('screen_names').doc(screenName);
      const memberDoc = await transaction.get(memberRef);
      if (memberDoc.exists) {
        return false;
        // 이미 추가된 상태
      }
      const addData = {
        uid,
        email,
        displayName: displayName ?? '',
        photoURL: photoURL ?? '',
      };
      await transaction.set(memberRef, addData);
      await transaction.set(screenRef, addData);
      return true;
    });
    if (addResult === false) {
      return res.status(201).json({ result: true, id: uid });
    }
    return res.status(200).json({ result: true, id: uid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, message: '서버 이상' });
  }
}
