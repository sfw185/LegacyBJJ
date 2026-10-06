const pug = require('pug');
const { promises: { writeFile, mkdir } } = require('fs');
const path = require('path');

const { gyms } = require('../src/gyms');
const { getAllScheduleData, sliceObject } = require('../src/data');

const indexTemplate = pug.compileFile('./src/index.pug');
const embedTemplate = pug.compileFile('./src/embed.pug');

const regions = ['NSW', 'QLD', 'TAS'];

const build = async () => {
  try {
    // Ensure output directories exist
    await mkdir('./public/embed', { recursive: true });

    console.log('Fetching data...');
    const scheduleData = await getAllScheduleData(gyms);

    console.log('Building index.html...');
    const oneWeek = scheduleData.map(gym => ({ ...gym, data: gym.data && sliceObject(gym.data, 0, 7) }));
    const index = indexTemplate({ gyms: oneWeek, regions, pretty: true });
    await writeFile(path.join('./public', 'index.html'), index, 'utf8');

    const sizes = { index: index.length };
    for (const gym of scheduleData.filter(gym => gym.data)) {
      console.log(`Building embed/${gym.id}.html...`);
      const embed = embedTemplate({ data: gym.data, pretty: true });
      await writeFile(path.join('./public/embed', `${gym.id}.html`), embed, 'utf8');
      sizes[`embed/${gym.id}`] = embed.length;
    }

    const unavailable = scheduleData.filter(gym => !gym.data).map(gym => gym.name);
    if (unavailable.length) {
      console.warn(`Schedule unavailable for: ${unavailable.join(', ')}`);
    }

    console.log('Build completed successfully!');
    console.log(sizes);
  } catch (error) {
    console.error('Build error:', error);
    process.exit(1);
  }
};

build();
