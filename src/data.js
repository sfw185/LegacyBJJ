const axios = require('axios');
const moment = require('moment-timezone');
const { getStartTime: start, getEndTime: end } = require('./time');

// Clubworx returns gym-local times as 'YYYY/MM/DD HH:mm', so parse them as-is
// to keep output independent of the build machine's timezone
const CLUBWORX_FORMAT = 'YYYY/MM/DD HH:mm';

// Descriptions that are booking boilerplate rather than class info
const IGNORED_DESCRIPTIONS = [/book your free trial/i];

// Instructor entries that are the gym itself rather than a person
const NON_PERSON_INSTRUCTOR = /legacy|academy|jiu jitsu|\|/i;

// "Caio Tamura, Adrian Hart, and David Belmonte" -> "Caio & Adrian & David"
const formatInstructors = (instructorNames) => {
  if (!instructorNames) return '';
  const firstNames = instructorNames
    .split(/,\s*and\s+|,\s*|\s+and\s+/)
    .map(name => name.trim())
    .filter(name => name && !NON_PERSON_INSTRUCTOR.test(name))
    .map(name => name.split(' ')[0]);
  return [...new Set(firstNames)].join(' & ');
};

const formatDescription = (description) => {
  if (!description || IGNORED_DESCRIPTIONS.some(pattern => pattern.test(description))) return '';
  return description;
};

// Function to group schedule by start day
const groupByStartDay = (schedule) => {
  const rooms = new Set(schedule.map(someClass => someClass.classroom_name).filter(room => room && room !== '-'));
  const showRoom = rooms.size > 1;

  return [...schedule]
    .sort((a, b) => a.start.localeCompare(b.start))
    .reduce((aggregate, current) => {
      const startDate = moment(current.start, CLUBWORX_FORMAT).format('dddd D MMM');
      if (!aggregate[startDate]) {
        aggregate[startDate] = [];
      }
      aggregate[startDate].push({
        title: current.title,
        start: moment(current.start, CLUBWORX_FORMAT).format('h:mm A'),
        end: moment(current.end, CLUBWORX_FORMAT).format('h:mm A'),
        instructors: formatInstructors(current.instructor_names),
        room: showRoom && rooms.has(current.classroom_name) ? current.classroom_name : '',
        description: formatDescription(current.description),
        cancelled: Boolean(current.cancelled),
      });
      return aggregate;
    }, {});
};

// Function to fetch schedule data for a single gym
const getScheduleData = async (gym) => {
  const scheduleUrl = `https://app.clubworx.com/websites/${gym.clubworx}/calendar/data?start=${start()}&end=${end()}`;
  console.log(`Fetching ${gym.name} schedule from ${scheduleUrl}`);

  try {
    const response = await axios.get(scheduleUrl, { headers: { Accept: 'application/json' } });
    if (!Array.isArray(response.data)) {
      throw new Error('Unexpected response (not a JSON array)');
    }
    return groupByStartDay(response.data);
  } catch (error) {
    console.error(`Error fetching ${gym.name} schedule data: ${error.message}`);
    throw error;
  }
};

// Fetch every gym's schedule. A failing gym renders as unavailable rather than
// breaking the whole site, but if every gym fails the build fails.
const getAllScheduleData = async (gyms) => {
  const results = await Promise.allSettled(gyms.map(getScheduleData));

  if (results.every(result => result.status === 'rejected')) {
    throw new Error('Failed to fetch schedule data for every gym');
  }

  return gyms.map((gym, index) => ({
    ...gym,
    data: results[index].status === 'fulfilled' ? results[index].value : null,
  }));
};

// Function to slice an object based on start index and count
const sliceObject = (object, startIndex, count) => {
  return Object.fromEntries(Object.entries(object).slice(startIndex, startIndex + count));
};

module.exports = { getAllScheduleData, sliceObject };
