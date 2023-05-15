import moment from 'moment';

function convertDateToString(date: string): string {
  const curDate = moment(date, moment.ISO_8601).milliseconds(0);
  const now = moment();

  const diff = now.diff(curDate);
  const calDur = moment.duration(diff);
  const yearDur = calDur.years();
  const monthDur = calDur.months();
  const dayDur = calDur.days();
  const hourDur = calDur.hours();
  const minuteDur = calDur.minutes();
  const secondDur = calDur.seconds();

  if (
    yearDur === 0 &&
    monthDur === 0 &&
    dayDur === 0 &&
    hourDur === 0 &&
    minuteDur === 0 &&
    secondDur !== undefined &&
    (secondDur === 0 || secondDur === 0 || secondDur < 1)
  ) {
    return 'now';
  }
  if (yearDur === 0 && monthDur === 0 && dayDur === 0 && hourDur === 0 && minuteDur === 0 && secondDur) {
    return `${Math.floor(secondDur)}초 전`;
  }
  if (yearDur === 0 && monthDur === 0 && dayDur === 0 && hourDur === 0 && minuteDur) {
    return `${Math.floor(minuteDur)}분 전`;
  }
  if (yearDur === 0 && monthDur === 0 && dayDur === 0 && hourDur) {
    return `${Math.floor(hourDur)}시간 전`;
  }
  if (yearDur === 0 && monthDur === 0 && dayDur) {
    return `${Math.floor(dayDur)}일 전`;
  }
  if (yearDur === 0 && monthDur) {
    return `${Math.floor(monthDur)}달 전`;
  }

  return `${Math.floor(yearDur)}년 전`;
}

export default convertDateToString;
