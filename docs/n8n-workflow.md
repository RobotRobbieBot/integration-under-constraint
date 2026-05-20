# n8n Workflow: Passage Audio Generation

## Setup

**Trigger:** Google Sheets - New Row in "Passages" tab
**Action:** ElevenLabs API - Text to Speech
**Output:** Write Audio URL back to Sheet

## Workflow Steps

### 1. Google Sheets Trigger
```
Watch for changes in:
- Sheet ID: 1rwS7CXiT0PAjiVGkf2J4LC4YFoCe2oHeWZUqj_cxR4I
- Tab: "Passages"
- Trigger on: New row added
```

### 2. Filter (Optional)
```
Only process rows where:
- Status = "ready" OR "pending_audio"
- Passage Text is not empty
- Audio URL is empty
```

### 3. ElevenLabs API Call
```
Endpoint: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}

Headers:
- xi-api-key: [YOUR_API_KEY]
- Content-Type: application/json

Body:
{
  "text": "{{$node["Google Sheets"].json["Passage Text"]}}",
  "model_id": "eleven_monolingual_v1",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}

Voice ID options:
- "21m00Tcm4TlvDq8ikWAM" (Rachel - clear, neutral)
- "nPczCjzI2devNBz1zQrb" (Adam - calm, warm)
- "TxGEqnHWrfWFTfGW9XjX" (Bella - professional)
```

### 4. Download Audio File
```
Convert response audio blob to downloadable MP3
Save to: GitHub Pages CDN or external storage
Generate public URL
```

### 5. Update Google Sheet
```
Write to same row:
- Audio URL: [generated_url]
- Status: "ready"
- Date Added: [timestamp]
```

## Cost Estimate

ElevenLabs pricing:
- Free tier: 10,000 characters/month
- 260 passages × avg 200 chars = 52,000 chars
- Cost: ~$5-10/month (pay-as-you-go)

## Implementation Checklist

- [ ] Add ElevenLabs API key to n8n
- [ ] Create Google Sheets node (watch Passages tab)
- [ ] Create ElevenLabs node (text-to-speech)
- [ ] Test with 1 passage
- [ ] Add audio URL update to Sheet
- [ ] Batch process existing passages
- [ ] Monitor API spend

---

Status: Ready to implement
Estimate: 2-3 hours setup + testing
