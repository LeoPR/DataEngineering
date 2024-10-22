// api/index.js

const express = require('express');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json());

// Authentication middleware
const authMiddleware = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://YOUR_DOMAIN/.well-known/jwks.json' // Replace with your JWKS URI
    }),
    audience: 'YOUR_AUDIENCE', // Replace with your audience
    issuer: 'https://YOUR_DOMAIN/', // Replace with your issuer
    algorithms: ['RS256']
});

// Protect API routes
app.use('/chat', authMiddleware);
app.use('/api/tags', authMiddleware);

// Example API endpoint
app.post('/chat', (req, res) => {
    const { model, text } = req.body;
    // Handle the incoming request with the specified model
    // Example response
    const response = [`Response 1 for "${text}" using model "${model}"`, `Response 2 for "${text}" using model "${model}"`];
    res.json(response);
});

app.get('/api/tags', (req, res) => {
    // Return available models
    const models = [
        {
            "name": "codellama:13b",
            "modified_at": "2023-11-04T14:56:49.277302595-07:00",
            "size": 7365960935,
            "digest": "9f438cb9cd581fc025612d27f7c1a6669ff83a8bb0ed86c94fcf4c5440555697",
            "details": {
                "format": "gguf",
                "family": "llama",
                "families": null,
                "parameter_size": "13B",
                "quantization_level": "Q4_0"
            }
        },
        {
            "name": "llama3:latest",
            "modified_at": "2023-12-07T09:32:18.757212583-08:00",
            "size": 3825819519,
            "digest": "fe938a131f40e6f6d40083c9f0f430a515233eb2edaa6d72eb85c50d64f2300e",
            "details": {
                "format": "gguf",
                "family": "llama",
                "families": null,
                "parameter_size": "7B",
                "quantization_level": "Q4_0"
            }
        }
    ];
    res.json({ models });
});

// Start the server
app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});
