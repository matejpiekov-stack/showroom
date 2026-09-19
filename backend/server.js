require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/estimate-price', async (req, res) => {
    const { make, model, year, mileage, condition } = req.body;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `Estimate the current used market price in EUR for a ${year} ${make} ${model} with ${mileage}km and ${condition} condition. Respond with only a price range like "€X,XXX - €X,XXX" and nothing else.`
        });

        res.json({ estimate: response.text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get estimate" });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));