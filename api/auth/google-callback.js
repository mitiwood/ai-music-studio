export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect('/?login=fail');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = 'https://ai-music-studio-bice.vercel.app/api/auth/google/callback';

  try {
    // 1. code → access_token 교환
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('token 교환 실패');

    // 2. access_token → 유저 정보
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    // 3. 유저 정보를 URL 파라미터로 클라이언트에 전달 (간단한 방식)
    const params = new URLSearchParams({
      login: 'ok',
      provider: 'google',
      name: user.name || '',
      email: user.email || '',
      avatar: user.picture || '',
      id: user.id || '',
    });

    res.redirect(`/?${params}`);
  } catch (e) {
    console.error('Google callback error:', e);
    res.redirect('/?login=fail');
  }
}
