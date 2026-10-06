const moment = require("moment-timezone");
const daysRequired = 14;

const getStartTime = () => {
  return moment().tz('Australia/Sydney').startOf('day').unix();
};

const getEndTime = () => {
  const dayOffset = daysRequired - 1;
  return moment().tz('Australia/Sydney').startOf('day').add(dayOffset, 'days').unix();
};

module.exports = {
  getStartTime,
  getEndTime
}
