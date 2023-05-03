import { NextApiResponse } from 'next';
import CustomServerError from './custom_server_error';

const handleError = (err: unknown, res: NextApiResponse) => {
  let unknownError = err;

  if (err instanceof CustomServerError === false) {
    unknownError = new CustomServerError({ statusCode: 499, message: 'unknown Error : ' });
  }
  const customError = unknownError as CustomServerError;
  res
    .status(customError.statusCode)
    .setHeader('location', customError.location ?? '')
    .send(customError.serializeErrors());
};

export default handleError;
