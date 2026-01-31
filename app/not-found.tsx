export default function NotFound() {
  return (
    <div className="container">
      <div className="glass-card not-found-container">
        <span className="not-found-emoji">🔍</span>
        <h1>404 - Not Found</h1>
        <p>This paste doesn't exist, has expired, or reached its view limit.</p>
        <a href="/" className="btn">
          Create a New Paste
        </a>
      </div>
    </div>
  );
}
