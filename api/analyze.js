/**
 * /api/analyze — YouTube 영상 제목/채널명 → Suno 스타일 프롬프트 생성
 * Claude API를 서버리스에서 호출 → CORS 문제 완전 해결
 */
export default async function handler(req, res) {
  /* CORS 헤더 */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { title = '', author = '' } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    /* API 키 없으면 제목 기반 폴백 결과 반환 */
    return res.status(200).json({ text: '', fallback: true });
  }

  const prompt = `다음 YouTube 영상 정보를 바탕으로 비슷한 결의 음악을 만들기 위한 Suno AI 스타일 프롬프트를 생성해주세요.

영상 제목: "${title}"
채널명: "${author}"

다음 형식의 JSON으로만 답변하세요 (다른 텍스트 없이):
{
  "genre": "장르 (영어, 예: K-Pop, Lo-fi Hip-hop, EDM)",
  "mood": "분위기 (영어, 예: energetic, uplifting, melancholic)",
  "style_prompt": "Suno AI 스타일 프롬프트 (영어, 콤마 구분, 20단어 이내)",
  "description": "분석 결과 한 줄 설명 (한국어)",
  "bpm_estimate": 120
}`;

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await claudeRes.json();
    const text = data.content?.find(c => c.type === 'text')?.text || '';
    return res.status(200).json({ text });
  } catch (err) {
    console.error('[analyze] error:', err);
    return res.status(200).json({ text: '', error: err.message });
  }
}
