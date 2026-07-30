import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/auth';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

const testData = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  phone_number: '+1234567890',
  password: 'Test1234'
};

let authToken = null;

async function testRegistration() {
  try {
    log.info('Testing user registration...');

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const data = await response.json();

    if (response.status === 201 && data.success) {
      log.success('Registration successful');
      log.info(`User ID: ${data.data.userId}`);
      log.info(`Username: ${data.data.username}`);
      log.info(`Email: ${data.data.email}`);
      return true;
    } else {
      log.error(`Registration failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log.error(`Registration error: ${error.message}`);
    return false;
  }
}

async function testLogin() {
  try {
    log.info('Testing user login...');

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testData.email,
        password: testData.password
      })
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      authToken = data.data.token;
      log.success('Login successful');
      log.info(`Token received: ${authToken.substring(0, 20)}...`);
      log.info(`User: ${data.data.user.username}`);
      return true;
    } else if (response.status === 403) {
      log.warning(`Login blocked: ${data.message}`);
      log.warning('This is expected - email verification is required');
      return 'email_verification_required';
    } else {
      log.error(`Login failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log.error(`Login error: ${error.message}`);
    return false;
  }
}

async function testGetProfile() {
  try {
    log.info('Testing get profile (authenticated)...');

    if (!authToken) {
      log.warning('No auth token available, skipping profile test');
      return false;
    }

    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      log.success('Profile retrieved successfully');
      log.info(`Username: ${data.data.user.username}`);
      log.info(`Email: ${data.data.user.email}`);
      log.info(`Email Verified: ${data.data.user.email_verified}`);
      return true;
    } else {
      log.error(`Get profile failed: ${data.message}`);
      return false;
    }
  } catch (error) {
    log.error(`Get profile error: ${error.message}`);
    return false;
  }
}

async function testInvalidLogin() {
  try {
    log.info('Testing invalid login credentials...');

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testData.email,
        password: 'WrongPassword123'
      })
    });

    const data = await response.json();

    if (response.status === 401 && !data.success) {
      log.success('Invalid login correctly rejected');
      return true;
    } else {
      log.error('Invalid login was not properly rejected');
      return false;
    }
  } catch (error) {
    log.error(`Invalid login test error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(50));
  console.log('  Authentication API Test Suite');
  console.log('='.repeat(50) + '\n');

  log.info(`Testing against: ${API_URL}`);
  log.info(`Test user email: ${testData.email}`);
  log.info(`Test username: ${testData.username}\n`);

  const results = {
    registration: await testRegistration(),
    login: await testLogin(),
    invalidLogin: await testInvalidLogin()
  };

  if (authToken) {
    results.profile = await testGetProfile();
  }

  console.log('\n' + '='.repeat(50));
  console.log('  Test Results Summary');
  console.log('='.repeat(50) + '\n');

  const passed = Object.values(results).filter(r => r === true).length;
  const failed = Object.values(results).filter(r => r === false).length;
  const warnings = Object.values(results).filter(r => typeof r === 'string').length;

  log.success(`Tests passed: ${passed}`);
  if (failed > 0) log.error(`Tests failed: ${failed}`);
  if (warnings > 0) log.warning(`Warnings: ${warnings}`);

  console.log('\n' + '='.repeat(50) + '\n');

  if (warnings > 0) {
    log.warning('Note: Email verification is required for login');
    log.info('Check the Supabase dashboard to verify the email manually for testing');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
