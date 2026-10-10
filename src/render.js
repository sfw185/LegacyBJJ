const templates = require('./templates.generated');
const { sliceObject } = require('./data');

const regions = ['NSW', 'QLD', 'TAS'];

// The app shows one week per academy; embeds show the full fetched range
const renderIndex = (scheduleData) => {
  const oneWeek = scheduleData.map(gym => ({ ...gym, data: gym.data && sliceObject(gym.data, 0, 7) }));
  return templates.index({ gyms: oneWeek, regions });
};

const renderEmbed = (data) => templates.embed({ data });

module.exports = { renderIndex, renderEmbed };
