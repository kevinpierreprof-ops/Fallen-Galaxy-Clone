import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>Space Strategy</h1>
        </Link>
        <nav>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/game" className="nav-link">Play</Link>
        </nav>
      </div>
    </header>
  );
}