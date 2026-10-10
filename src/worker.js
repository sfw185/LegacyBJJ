// Cloudflare Worker serving legacy.australian.software. Renders the same pages
// as the static build on request, from Clubworx data cached at the edge for
// PAGE_TTL seconds. Static files (CSS, images, manifest) come from ./public.
import moment from 'moment-timezone';
import { gyms } from './gyms';
import { getAllScheduleData } from './data';
import { renderIndex, renderEmbed } from './render';

const PAGE_TTL = 60;
// Last good Clubworx response per gym, served if Clubworx is down or slow
const STALE_TTL = 7 * 24 * 60 * 60;
const CLUBWORX_TIMEOUT_MS = 10000;

const HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': `public, max-age=${PAGE_TTL}`,
  // Embeds are fetched cross-origin by academy websites (see embed.md)
  'Access-Control-Allow-Origin': '*',
};

const gymsById = new Map(gyms.map(gym => [gym.id, gym]));

const staleKey = (gym) => new Request(`https://stale.internal/clubworx/${gym.clubworx}`);

// Drop classes from days that have passed, for when we fall back to stale data
const withoutPastDays = (classes) => {
  const today = moment().tz('Australia/Sydney').format('YYYY/MM/DD');
  return classes.filter(someClass => someClass.start.slice(0, 10) >= today);
};

// Visitor headers passed through to Clubworx. Cookies, auth and IP headers are
// deliberately not forwarded: Clubworx doesn't need them, and the response is
// cached and shared between visitors.
const FORWARDED_HEADERS = ['User-Agent', 'Accept-Language'];
const FALLBACK_USER_AGENT = 'LegacyBJJSchedule/1.0 (+https://legacy.australian.software/)';

const upstreamHeaders = (request) => {
  const headers = { Accept: 'application/json', 'User-Agent': FALLBACK_USER_AGENT };
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }
  return headers;
};

const clubworxFetcher = (request, ctx) => async (gym, url) => {
  try {
    const response = await fetch(url, {
      headers: upstreamHeaders(request),
      cf: { cacheTtl: PAGE_TTL, cacheEverything: true },
      signal: AbortSignal.timeout(CLUBWORX_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Request failed with status code ${response.status}`);
    const classes = await response.json();
    if (!Array.isArray(classes)) throw new Error('Unexpected response (not a JSON array)');

    ctx.waitUntil(caches.default.put(staleKey(gym), new Response(JSON.stringify(classes), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${STALE_TTL}` },
    })));
    return classes;
  } catch (error) {
    const stale = await caches.default.match(staleKey(gym));
    if (!stale) throw error;
    console.warn(`Serving stale ${gym.name} schedule: ${error.message}`);
    return withoutPastDays(await stale.json());
  }
};

// Map a path to the page it renders, or null to fall through to static assets
const route = (pathname) => {
  if (pathname === '/' || pathname === '/index.html') return { type: 'index', cachePath: '/' };
  const embed = /^\/embed\/([a-z]+)\.html$/.exec(pathname);
  if (embed && gymsById.has(embed[1])) return { type: 'embed', gym: gymsById.get(embed[1]), cachePath: pathname };
  return null;
};

const render = async (page, request, ctx) => {
  const fetchSchedule = clubworxFetcher(request, ctx);
  if (page.type === 'index') {
    return renderIndex(await getAllScheduleData(gyms, fetchSchedule));
  }
  const [gym] = await getAllScheduleData([page.gym], fetchSchedule);
  return renderEmbed(gym.data);
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const page = route(url.pathname);
    if (!page) return env.ASSETS.fetch(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, HEAD' } });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Query strings (e.g. ?gym=parramatta) are handled client-side, so share one cache entry
    const cacheKey = new Request(url.origin + page.cachePath);
    const cached = await caches.default.match(cacheKey);
    if (cached) return cached;

    try {
      const response = new Response(await render(page, request, ctx), { headers: HTML_HEADERS });
      ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
      return response;
    } catch (error) {
      console.error(`Render failed for ${url.pathname}: ${error.message}`);
      return new Response('Schedule temporarily unavailable. Please try again shortly.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '60', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
