const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.BACKEND_URL || "https://your-backend-url.run.app"]
    }
  }
}));

// Compression middleware
app.use(compression());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// API proxy middleware for backend calls
app.use('/api/*', (req, res) => {
  const backendUrl = process.env.BACKEND_URL || 'https://your-backend-url.run.app';
  const targetUrl = `${backendUrl}${req.originalUrl}`;
  
  // Simple proxy implementation
  const options = {
    method: req.method,
    headers: {
      ...req.headers,
      'host': new URL(backendUrl).host
    }
  };
  
  if (req.body) {
    options.body = JSON.stringify(req.body);
    options.headers['content-type'] = 'application/json';
  }
  
  fetch(targetUrl, options)
    .then(response => {
      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.set(key, value);
      });
      return response.text();
    })
    .then(data => res.send(data))
    .catch(err => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Backend proxy error' });
    });
});

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Vocilio Dashboard server running on port ${port}`);
  console.log(`📊 Health check available at /health`);
  console.log(`🔗 Backend URL: ${process.env.BACKEND_URL || 'Not configured'}`);
});
