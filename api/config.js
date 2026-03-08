/**
 * /api/config
 * Vercel 환경변수에 저장된 kie.ai API 키를 프론트에 안전하게 전달
 * 
 * Vercel Dashboard → Settings → Environment Variables 에서 설정:
 *   KIE_API_KEY = 02b67a9618e9c4e91b09888bfbfddb2b
 */
export default function handler(req, res) {
  // CORS - 동일 도메인만 허용
  const origin = req.headers.origin || '';
  if (origin && !origin.includes('vercel.app') && !origin.includes('localhost')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'KIE_API_KEY 환경변수가 설정되지 않았습니다' });
  }

  // 캐시 금지 (항상 최신 키 반환)
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ apiKey });
}
