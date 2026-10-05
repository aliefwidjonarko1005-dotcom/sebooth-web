import fs from 'fs'
import path from 'path'

// Helper to read .env.local manually if dotenv is not installed
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...v] = trimmed.split('=')
        if (k && v.length) {
          process.env[k.trim()] = v.join('=').trim()
        }
      }
    }
  }
}

loadEnv()

export async function runOpenAdKitGeneration({
  generator = 'local-seo',
  topic = 'Photobooth Semarang',
  targetMarket = 'Semarang & Tembalang',
  keywords = ['Photobooth Semarang', 'Photobooth Tembalang', 'Photobooth Event Semarang Murah'],
  customPrompt = ''
}) {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: 'GROQ_API_KEY tidak ditemukan di .env.local atau environment.',
      instructions: 'Silakan daftarkan API key gratis di https://console.groq.com lalu tambahkan ke .env.local: GROQ_API_KEY=gsk_...'
    }
  }

  const systemPrompt = `You are OpenAdKit AI Engine, an elite digital marketing and local SEO strategist specialized in Indonesian market positioning for Sebooth (sebooth.in), the modern aesthetic photobooth rental service in Semarang and Tembalang.
Follow copywriting best practices: High-converting hooks, E-E-A-T structure, natural keyword density, zero fluff, and persuasive call-to-actions.`

  const userPrompt = customPrompt || `Tolong buatkan draf artikel SEO lokal untuk website Sebooth dengan spesifikasi:
- Topik: ${topic}
- Wilayah Target: ${targetMarket}
- Target Keywords: ${keywords.join(', ')}
- Output:
  1. SEO Title Tag (< 60 karakter)
  2. Meta Description (< 155 karakter)
  3. H1 Headline
  4. Isi Artikel Terstruktur (H2, H3, bullet points keunggulan Sebooth, tips memilih photobooth event, estimasi harga)
  5. FAQ Schema 3 pertanyaan populer seputar sewa photobooth di Semarang
  6. Call to Action WhatsApp`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3500
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      return { success: false, error: `Groq API Error: ${response.status} - ${errText}` }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    return { success: true, content, model: data.model }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// CLI test runner
if (process.argv[1]?.endsWith('openadkit_engine.mjs')) {
  console.log('--- OpenAdKit Engine CLI Runner ---')
  runOpenAdKitGeneration({
    topic: 'Photobooth Tembalang Murah untuk Event Kampus UNDIP'
  }).then(res => {
    if (!res.success) {
      console.log('Status: API Key Not Configured')
      console.log('Catatan:', res.instructions || res.error)
    } else {
      console.log('Success! Output:\n', res.content)
    }
  })
}
