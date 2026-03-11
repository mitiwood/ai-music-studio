/**
 * /api/kie-proxy — kie.ai API CORS 프록시
 * admin.html에서 직접 api.kie.ai 호출 시 CORS 에러 방지용
 * Usage: POST /api/kie-proxy  body: { path, method, body, apiKey }
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { path, method = 'GET', body: reqBody, apiKey } = req.body || {};
  const key = apiKey || process.env.KIE_API_KEY;

  if (!key) return res.status(400).json({ error: 'API key required' });
  if (!path) return res.status(400).json({ error: 'path required' });

  const KIE_BASE = 'https://api.kie.ai';
  const url = `${KIE_BASE}${path}`;

  try {
    const fetchOpts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
    };
    if (reqBody && method !== 'GET') fetchOpts.body = JSON.stringify(reqBody);

    const upstream = await fetch(url, fetchOpts);
    const text = await upstream.text();

    let data;
    if (text.trimStart().startsWith('<')) {
      /* kie.ai가 HTML 에러 페이지 반환 (엔드포인트 없음, 인증 실패 등) */
      return res.status(upstream.status).json({
        error: 'kie.ai returned HTML (status ' + upstream.status + ')',
        endpoint: path,
      });
    }
    try { data = JSON.parse(text); } catch(e) {
      return res.status(500).json({ error: 'JSON parse failed: ' + e.message, raw: text.slice(0,200) });
    }

    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
