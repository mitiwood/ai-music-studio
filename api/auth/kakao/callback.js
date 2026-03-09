export default async function handler(req, res) {
  const { code, error } = req.query;
  if (error || !code) return res.redirect('/?login=fail');

  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = 'https://ai-music-studio-bice.vercel.app/api/auth/kakao/callback';

  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('token 실패');

    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    const profile = userData.kakao_account?.profile || {};
    const email = userData.kakao_account?.email || '';

    const params = new URLSearchParams({
      login: 'ok',
      provider: 'kakao',
      name: profile.nickname || '카카오 사용자',
      email,
      avatar: profile.profile_image_url || '',
      id: String(userData.id || ''),
    });
    res.redirect(`/?${params}`);
  } catch(e) {
    console.error('Kakao callback error:', e);
    res.redirect('/?login=fail');
  }
}
