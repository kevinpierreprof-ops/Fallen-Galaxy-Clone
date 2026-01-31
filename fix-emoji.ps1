# Fix emoji encoding issues
$rootPath = "C:\Fallen Galaxy clone\space-strategy-game"
Set-Location $rootPath

Write-Host "Fixing emoji encoding issues..." -ForegroundColor Cyan

# Fix HomePage.tsx
$homePage = @"
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/game');
  };

  return (
    <div className="home-page">
      <div className="hero">
        <h1 className="title">Space Strategy Game</h1>
        <p className="subtitle">
          Conquer the galaxy, build your empire, and dominate the stars
        </p>
        <button className="start-button" onClick={handleStartGame}>
          Start Playing
        </button>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>Colonize Planets</h3>
          <p>Expand your empire across the galaxy by colonizing new worlds</p>
        </div>
        <div className="feature-card">
          <h3>Build Fleets</h3>
          <p>Construct powerful ships and command vast fleets</p>
        </div>
        <div className="feature-card">
          <h3>Form Alliances</h3>
          <p>Team up with other players to dominate the universe</p>
        </div>
        <div className="feature-card">
          <h3>Real-time Chat</h3>
          <p>Communicate with allies and negotiate with enemies</p>
        </div>
      </div>
    </div>
  );
}
"@

# Fix Header.tsx  
$header = @"
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
"@

# Write files
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$rootPath\frontend\src\pages\HomePage.tsx", $homePage, $utf8NoBom)
[System.IO.File]::WriteAllText("$rootPath\frontend\src\components\Header.tsx", $header, $utf8NoBom)

Write-Host "✓ Fixed HomePage.tsx" -ForegroundColor Green
Write-Host "✓ Fixed Header.tsx" -ForegroundColor Green

Write-Host "`nRebuilding Docker..." -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build

Write-Host "`n✓ All fixed!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
