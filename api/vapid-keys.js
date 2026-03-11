/**
 * /api/vapid-keys — VAPID 공개키 반환 (클라이언트용)
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.status(200).json({
    publicKey: process.env.VAPID_PUBLIC_KEY || ''
  });
}
