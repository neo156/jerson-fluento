const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// All translate routes require authentication
router.use(auth);

// Translation endpoint using MyMemory Translation API (free)
router.post('/', async (req, res) => {
  try {
    const { text, source, target } = req.body;

    if (!text || !source || !target) {
      return res.status(400).json({ error: 'Please provide text, source, and target languages' });
    }

    // If source and target are the same, return original text
    if (source === target) {
      return res.json({
        originalText: text,
        translatedText: text,
        sourceLanguage: source,
        targetLanguage: target,
      });
    }

    // Use MyMemory Translation API (free, no API key required for basic usage)
    const langPair = `${source}|${target}`;
    const encodedText = encodeURIComponent(text);
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
      res.json({
        originalText: text,
        translatedText: data.responseData.translatedText,
        sourceLanguage: source,
        targetLanguage: target,
      });
    } else {
      // Fallback: return original text if translation fails
      console.error('Translation API error:', data);
      res.json({
        originalText: text,
        translatedText: text,
        sourceLanguage: source,
        targetLanguage: target,
      });
    }
  } catch (error) {
    console.error('Error translating text:', error);
    // Return original text on error instead of failing
    res.json({
      originalText: req.body.text,
      translatedText: req.body.text,
      sourceLanguage: req.body.source,
      targetLanguage: req.body.target,
    });
  }
});

// Get available languages
router.get('/languages', async (req, res) => {
  try {
    // Common languages list
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'nl', name: 'Dutch' },
      { code: 'pl', name: 'Polish' },
      { code: 'tr', name: 'Turkish' },
      { code: 'sv', name: 'Swedish' },
      { code: 'da', name: 'Danish' },
      { code: 'no', name: 'Norwegian' },
      { code: 'fi', name: 'Finnish' },
      { code: 'el', name: 'Greek' },
    ];

    res.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

