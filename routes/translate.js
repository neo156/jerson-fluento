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

    // Try LibreTranslate first (better quality, free public API)
    try {
      const libreResponse = await fetch('https://libretranslate.com/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: source,
          target: target,
          format: 'text',
        }),
      });

      if (libreResponse.ok) {
        const libreData = await libreResponse.json();
        if (libreData.translatedText) {
          const translatedText = libreData.translatedText.trim();
          console.log(`LibreTranslate: "${text}" -> "${translatedText}"`);
          
          return res.json({
            originalText: text,
            translatedText: translatedText,
            sourceLanguage: source,
            targetLanguage: target,
          });
        }
      } else {
        console.log(`LibreTranslate returned status ${libreResponse.status}, trying fallback...`);
      }
    } catch (libreError) {
      console.log('LibreTranslate failed, trying MyMemory...', libreError.message);
    }

    // Fallback to MyMemory Translation API (free, no API key required)
    try {
      const langPair = `${source}|${target}`;
      const encodedText = encodeURIComponent(text);
      const apiUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 429) {
          console.log('MyMemory rate limited (429), trying alternative service...');
          throw new Error('RATE_LIMITED');
        }
        throw new Error(`MyMemory API returned status ${response.status}`);
      }
      
      const data = await response.json();

      if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        const translatedText = data.responseData.translatedText.trim();
        console.log(`MyMemory: "${text}" -> "${translatedText}"`);
        
        return res.json({
          originalText: text,
          translatedText: translatedText,
          sourceLanguage: source,
          targetLanguage: target,
        });
      } else {
        console.error('MyMemory API error - unexpected response:', JSON.stringify(data, null, 2));
        throw new Error('MyMemory API returned unexpected response format');
      }
    } catch (myMemoryError) {
      // If rate limited, try alternative free service
      if (myMemoryError.message === 'RATE_LIMITED') {
        try {
          // Try Google Translate free API (via translate.googleapis.com)
          const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
          
          const googleResponse = await fetch(googleUrl);
          if (googleResponse.ok) {
            const googleData = await googleResponse.json();
            if (googleData && googleData[0] && googleData[0][0] && googleData[0][0][0]) {
              const translatedText = googleData[0].map((item) => item[0]).join('').trim();
              console.log(`Google Translate: "${text}" -> "${translatedText}"`);
              
              return res.json({
                originalText: text,
                translatedText: translatedText,
                sourceLanguage: source,
                targetLanguage: target,
              });
            }
          }
        } catch (googleError) {
          console.error('Google Translate also failed:', googleError.message);
        }
      }
      
      console.error('Error calling MyMemory API:', myMemoryError.message);
      throw new Error(`All translation services failed. Last error: ${myMemoryError.message}`);
    }
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ 
      error: 'Failed to translate text',
      details: error.message 
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

