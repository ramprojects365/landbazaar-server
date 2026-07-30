async function getFreshToken() {
  try {
    console.log('Getting fresh token...');
    
    const response = await fetch('http://localhost:3008/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'leelaprasanthi@gmail.com',
        password: 'Test1234'
      })
    });

    const responseData = await response.json();
    console.log('Login response:', responseData);
    
    if (responseData.success && responseData.data?.token) {
      console.log('Fresh token:', responseData.data.token);
      return responseData.data.token;
    } else {
      console.error('Login failed:', responseData);
      return null;
    }
  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
}

getFreshToken();
