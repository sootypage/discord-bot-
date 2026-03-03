export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Bot Dashboard</h1>
      <p>Login to configure your bot.</p>
      <a href="/api/auth/login">Login with Discord</a>
    </main>
  );
}
