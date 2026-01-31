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
