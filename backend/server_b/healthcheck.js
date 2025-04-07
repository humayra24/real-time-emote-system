const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: process.env.PORT || 3001,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const health = JSON.parse(data);
      if (res.statusCode === 200 && health.status === 'healthy') {
        process.exit(0);
      } else {
        process.exit(1);
      }
    } catch (error) {
      process.exit(1);
    }
  });
});

req.on('error', () => {
  process.exit(1);
});

req.end(); 