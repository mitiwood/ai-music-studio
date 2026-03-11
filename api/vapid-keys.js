/**
 * /api/vapid-keys — VAPID 공개키 반환 (클라이언트용 raw 포맷)
 * Vercel 환경변수 VAPID_PUBLIC_KEY 가 SPKI(DER) 포맷이면 자동으로 raw로 변환
 */
export default function handler(req, res) {
  // 1. CORS 및 캐시 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  // 2. 환경변수에서 공개키 로드
  let publicKey = process.env.VAPID_PUBLIC_KEY || '';

  // 키가 설정되지 않은 경우 빈 결과 반환
  if (!publicKey) {
    return res.status(200).json({ publicKey: '' });
  }

  try {
    // 3. Base64Url 포맷을 Buffer로 변환하기 위해 정규화
    // Node.js의 Buffer.from은 패딩(=)이 없어도 base64를 유연하게 처리합니다.
    const normalizedKey = publicKey.replace(/-/g, '+').replace(/_/g, '/');
    const raw = Buffer.from(normalizedKey, 'base64');

    // 4. SPKI 포맷(91바이트)인 경우 65바이트 Raw Key만 추출
    // SPKI 구조: 알고리즘 식별자(26바이트) + 실제 키 데이터(65바이트)
    if (raw.length === 91) {
      // slice 대신 최신 표준인 subarray를 사용 (성능 및 메모리 효율 향상)
      const point = raw.subarray(26);

      // 5. 다시 클라이언트가 인식할 수 있는 base64url 포맷으로 변환
      publicKey = point.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }
  } catch (e) {
    // 변환 중 에러 발생 시 로그 기록
    console.error('[vapid-keys] key conversion error:', e.message);
  }

  // 6. 최종 공개키 반환
  return res.status(200).json({ publicKey });
}
