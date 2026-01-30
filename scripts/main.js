// Main entry point
let game;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    
    // Set up event listeners
    const btnStart = document.getElementById('btn-start-game');
    const btnPause = document.getElementById('btn-pause-game');
    const btnReset = document.getElementById('btn-reset-game');
    
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            game.start();
            btnStart.disabled = true;
            btnPause.disabled = false;
        });
    }
    
    if (btnPause) {
        btnPause.addEventListener('click', () => {
            game.pause();
        });
    }
    
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            game.reset();
            btnStart.disabled = false;
            btnPause.disabled = true;
        });
    }
    
    // Add canvas click handler for future planet selection
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if clicked on a planet
            game.planets.forEach(planet => {
                const dx = x - planet.x;
                const dy = y - planet.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= planet.radius) {
                    console.log('Clicked planet:', planet);
                    // Future: implement planet selection and actions
                }
            });
        });
    }
});
