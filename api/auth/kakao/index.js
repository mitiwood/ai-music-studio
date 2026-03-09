export default function handler(req, res) {
  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = 'https://ai-music-studio-bice.vercel.app/api/auth/kakao/callback';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
  });

  res.redirect(`https://kauth.kakao.com/oauth/authorize?${params}`);
}
