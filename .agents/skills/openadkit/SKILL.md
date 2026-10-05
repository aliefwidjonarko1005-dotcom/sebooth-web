---
name: openadkit
description: Open-source AI marketing, ad copywriting, and SEO content engine adapted from OpenAdKit. Includes 18 AI generators, 11 optimizers, local SEO article drafting, Google Ads RSA copy, Instagram caption mirroring, framework training (PAS, AIDA, BAB, 4 U's), and Groq/Llama-3 execution scripts.
---

# OpenAdKit Skill: AI Marketing, Local SEO & Copywriting Engine

Adapted from [IamRamgarhia/OpenAdKit-Open-Source-AI-Marketing-Tool](https://github.com/IamRamgarhia/OpenAdKit-Open-Source-AI-Marketing-Tool), this skill equips the agent with high-performance ad copywriting, local SEO keyword clustering, article generation, and creative optimization engines.

---

## 1. Core Capabilities

1. **Local SEO Article Generation (`local-seo-article`)**:
   - Generates 1,000–1,500 word E-E-A-T compliant articles targeted to specific geographical search queries (e.g. *"Photobooth Semarang"*, *"Photobooth Tembalang"*, *"Photobooth Event Semarang Murah"*).
   - Enforces keyword density (1.5%–2.5%), semantic H1/H2/H3 hierarchy, schema.org JSON-LD FAQ formatting, internal linking, and WhatsApp CTA conversion hooks.

2. **Social Media & Instagram Mirroring (`meta-instagram-mirror`)**:
   - Takes real Sebooth event photos and activity captions from Instagram, cleans and expands them into rich, engaging web articles with local geo-tags and event keywords.

3. **Google Ads & Performance Max (`google-ads-rsa`)**:
   - Generates 15 headlines (≤30 chars) and 4 descriptions (≤90 chars) strictly following Google Ads character limits, targeting high-intent local queries with exact and phrase match keywords.

4. **Copywriting Frameworks (`framework-stack`)**:
   - **PAS**: Problem (foto event membosankan) → Agitate (momen lewat begitu saja) → Solution (Sebooth cetak instan & softfile langsung ke HP).
   - **AIDA**: Attention → Interest → Desire → Action.
   - **BAB**: Before → After → Bridge.

5. **Creative Score & Audit (`creative-score`)**:
   - 5-lever rubric: Hook strength (0-10), Specificity (0-10), Urgency (0-10), Brand fit (0-10), Conversion potential (0-10).

---

## 2. Groq & BYOK Execution Engine

OpenAdKit uses the **BYOK (Bring Your Own Key)** architecture. For instant, free, ultra-fast generation, this skill integrates with Groq Cloud (`console.groq.com`) using `Llama-3.3-70b-versatile` or `Mixtral-8x7b-32768`.

### Environment Variable:
```env
GROQ_API_KEY=gsk_...
```

### Execution Script:
A standalone runner script is available at `scripts/openadkit_engine.mjs` to test prompts or generate batch articles directly via CLI:
```bash
node scripts/openadkit_engine.mjs --generator local-seo --topic "Photobooth Tembalang Murah"
```
If no Groq API key is present in environment, the agent can execute the generation directly using its own LLM reasoning capabilities.

---

## 3. SEO Prompt Templates

### Local SEO Article Prompt Structure
```markdown
Peran: Senior SEO Content Strategist & Copywriter berpengalaman di pasar lokal Semarang.
Brand: Sebooth (sebooth.id) - Vendor photobooth modern, aesthetic, cetak instan dengan softfile langsung ke HP.
Wilayah Target: Semarang, Tembalang (UNDIP/Polines), Banyumanik, Simpang Lima, dan Jawa Tengah.
Keyword Utama: {keyword}
Keyword Sekunder: {secondary_keywords}

Format Output:
1. Meta Title (55-60 karakter, mencakup keyword utama dan nama brand Sebooth)
2. Meta Description (145-155 karakter, memicu CTR tinggi dengan ajakan aksi)
3. H1 Title yang Menarik & Natural
4. Konten Lengkap (H2, H3, bullet points, tabel perbandingan paket)
5. FAQ Schema (3-4 pertanyaan & jawaban populer seputar sewa photobooth di Semarang)
6. CTA Booking WhatsApp
```
