import { useGameStore } from '../store/gameStore';

export default function PlanetList() {
  const planets = useGameStore((state) => state.planets);
  const player = useGameStore((state) => state.player);

  const myPlanets = planets.filter((p) => p.ownerId === player?.id);

  return (
    <div className="planet-list">
      <h3>My Planets ({myPlanets.length})</h3>
      <div className="planet-items">
        {myPlanets.map((planet) => (
          <div key={planet.id} className="planet-item">
            <div className="planet-name">{planet.name}</div>
            <div className="planet-info">
              <small>Pop: {Math.floor(planet.population)}/{planet.maxPopulation}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
