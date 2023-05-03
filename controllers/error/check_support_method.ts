import BadReqError from './bad_request_error';
import CustomServerError from './custom_server_error';

export default function checkSupportMethod(
  supportedMethond: Array<string | null | undefined>,
  method: string | undefined,
) {
  if (supportedMethond.indexOf(method) === -1) {
    // 상시나는 에러반환
    throw new BadReqError('지원하지 않는 method');
  }
}
