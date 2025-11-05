/**
 * Health Endpoint Integration Tests
 */

const request = require('supertest');
const express = require('express');

// Criar mini app para testar health endpoint
const app = express();
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

describe('GET /health', () => {
  test('deve retornar 200 OK', async () => {
    // Act
    const response = await request(app).get('/health');
    
    // Assert
    expect(response.status).toBe(200);
  });

  test('deve retornar JSON válido', async () => {
    // Act
    const response = await request(app).get('/health');
    
    // Assert
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('env');
  });

  test('deve retornar status ok', async () => {
    // Act
    const response = await request(app).get('/health');
    
    // Assert
    expect(response.body.status).toBe('ok');
  });

  test('deve retornar timestamp válido', async () => {
    // Act
    const response = await request(app).get('/health');
    
    // Assert
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  test('deve retornar env correto', async () => {
    // Act
    const response = await request(app).get('/health');
    
    // Assert
    expect(response.body.env).toBe('test');
  });
});

