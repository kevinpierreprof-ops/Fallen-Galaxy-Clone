import { useGameStore } from '../store/gameStore';

export default function ResourcePanel() {
  const player = useGameStore((state) => state.player);

  if (!player) {
    return <div className="resource-panel">Loading...</div>;
  }

  return (
    <div className="resource-panel">
      <h3>Resources</h3>
      <div className="resource-item">
        <span className="resource-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</span>
        <span className="resource-name">Minerals:</span>
        <span className="resource-value">{Math.floor(player.resources.minerals)}</span>
      </div>
      <div className="resource-item">
        <span className="resource-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡</span>
        <span className="resource-name">Energy:</span>
        <span className="resource-value">{Math.floor(player.resources.energy)}</span>
      </div>
      <div className="resource-item">
        <span className="resource-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°</span>
        <span className="resource-name">Credits:</span>
        <span className="resource-value">{Math.floor(player.resources.credits)}</span>
      </div>
    </div>
  );
}
