require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/estimate-price', async (req, res) => {
    const { make, model, year, mileage, transmission, condition } = req.body;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `Estimate the current used market price in EUR for a ${year} ${make} ${model}, ${transmission} transmission, ${mileage}km, ${condition} condition. Respond with only a price range like "€X,XXX - €X,XXX" and nothing else.`
        });

        res.json({ estimate: response.text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get estimate" });
    }
});

app.post('/generate-description', async (req, res) => {
    const { make, model, year, mileage, transmission, condition, extras } = req.body;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `Write a professional, appealing used car listing description for a ${year} ${make} ${model}, ${transmission} transmission, ${mileage}km, ${condition} condition. Extra details: ${extras || "none"}. Keep it concise (3-5 sentences), highlight strengths, and make it sound trustworthy to a buyer. Do not invent any facts not given.`
        });

        res.json({ description: response.text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate description" });
    }
});
app.post('/enhance-photo', async (req, res) => {
    const { imageBase64, mimeType, prompt } = req.body;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-image",
            contents: [
                {
                    role: "user",
                    parts: [
                        { inlineData: { mimeType: mimeType, data: imageBase64 } },
                        { text: prompt }
                    ]
                }
            ]
        });

        // Find the image part in the response
        const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
        res.json({ image: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to enhance photo" });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));