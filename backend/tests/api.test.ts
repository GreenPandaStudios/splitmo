import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.ts';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('HTTP API Endpoints', () => {
  const sceneName = 'test_api_scene';
  const sceneFilePath = path.join(process.cwd(), 'data', 'scenes', `${sceneName}.json`);

  // Ensure NODE_ENV is test
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  afterAll(async () => {
    try {
      await fs.unlink(sceneFilePath);
    } catch (e) {}
  });

  it('should return list of characters on GET /api/characters', async () => {
    const res = await request(app)
      .get('/api/characters')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
  });

  it('should advance simulation tick on POST /api/tick', async () => {
    const res = await request(app)
      .post('/api/tick')
      .send({
        tickCount: 1,
        meetingActive: false,
        userWhispers: {}
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('characters');
    expect(res.body).toHaveProperty('events');
    expect(res.body).toHaveProperty('speechBubbles');
    expect(Array.isArray(res.body.characters)).toBe(true);
  });

  it('should support saving, listing, and loading playback scenes', async () => {
    // Save scene
    const fakeFrames = [
      {
        tick: 1,
        timeOfDay: '9:00 AM',
        characters: [],
        slackLogs: [],
        activeSpeechBubbles: {}
      }
    ];

    await request(app)
      .post(`/api/scenes/${sceneName}`)
      .send({ frames: fakeFrames })
      .expect(200);

    // List scenes
    const listRes = await request(app)
      .get('/api/scenes')
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.includes(sceneName)).toBe(true);

    // Load scene
    const loadRes = await request(app)
      .get(`/api/scenes/${sceneName}`)
      .expect(200);

    expect(loadRes.body.length).toBe(1);
    expect(loadRes.body[0].tick).toBe(1);
  });
});
