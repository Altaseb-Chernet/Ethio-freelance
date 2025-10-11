// server/tests/auth.test.js
const request = require('supertest');
const app = require('../src/index'); // Express app, NOT listening server
const User = require('../src/models/User');

describe('Authentication API', () => {
  // Clean database before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new client user', async () => {
      const userData = {
        email: `testclient_${Date.now()}@example.com`,
        password: 'testpassword123',
        role: 'client',
        firstName: 'Test',
        lastName: 'Client'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.role).toBe('client');
    });

    it('should not register user with existing email', async () => {
      const email = `duplicate_${Date.now()}@example.com`;
      const userData = {
        email,
        password: 'testpassword123',
        role: 'client'
      };

      // First registration
      await request(app).post('/api/auth/register').send(userData);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    let testEmail;
    const testPassword = 'testpassword123';

    beforeEach(async () => {
      testEmail = `testlogin_${Date.now()}@example.com`;
      await User.create({
        email: testEmail,
        password: testPassword,
        role: 'freelancer',
        profile: { firstName: 'Test', lastName: 'Freelancer' }
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });
});
