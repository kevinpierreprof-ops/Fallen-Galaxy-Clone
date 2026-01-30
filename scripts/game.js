// Game class - Main game logic
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.isRunning = false;
        this.isPaused = false;
        this.resources = CONFIG.game.initialResources;
        this.score = 0;
        this.turnCount = 0;
        this.planets = [];
        this.stars = [];
        
        this.init();
    }
    
    init() {
        if (this.canvas) {
            this.canvas.width = CONFIG.canvas.width;
            this.canvas.height = CONFIG.canvas.height;
            this.generateStarfield();
            this.generatePlanets();
            this.render();
        }
    }
    
    generateStarfield() {
        // Generate random stars for background
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * CONFIG.canvas.width,
                y: Math.random() * CONFIG.canvas.height,
                radius: Math.random() * 1.5,
                opacity: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    generatePlanets() {
        // Generate random planets
        this.planets = [];
        const numPlanets = Math.floor(Math.random() * 10) + 10;
        
        for (let i = 0; i < numPlanets; i++) {
            const planet = {
                x: Math.random() * (CONFIG.canvas.width - 40) + 20,
                y: Math.random() * (CONFIG.canvas.height - 40) + 20,
                radius: Math.random() * 15 + 10,
                type: i === 0 ? 'player' : (i === 1 ? 'enemy' : 'neutral'),
                production: Math.floor(Math.random() * 5) + 1,
                ships: i < 2 ? 10 : 0
            };
            this.planets.push(planet);
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.updateStatus('Running');
            this.gameLoop();
        }
    }
    
    pause() {
        this.isPaused = !this.isPaused;
        this.updateStatus(this.isPaused ? 'Paused' : 'Running');
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.resources = CONFIG.game.initialResources;
        this.score = 0;
        this.turnCount = 0;
        this.generatePlanets();
        this.updateUI();
        this.updateStatus('Ready');
        this.render();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        if (!this.isPaused) {
            this.update();
            this.render();
        }
        
        setTimeout(() => this.gameLoop(), CONFIG.game.turnDuration);
    }
    
    update() {
        // Update game logic
        this.turnCount++;
        
        // Produce resources from player planets
        this.planets.forEach(planet => {
            if (planet.type === 'player') {
                this.resources += planet.production;
                this.score += planet.production;
            }
        });
        
        this.updateUI();
    }
    
    render() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = CONFIG.colors.background;
        this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        
        // Draw stars
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw planets
        this.planets.forEach(planet => {
            // Planet body
            this.ctx.fillStyle = CONFIG.colors.planet[planet.type];
            this.ctx.beginPath();
            this.ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Planet border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Ships count
            if (planet.ships > 0) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(planet.ships.toString(), planet.x, planet.y + 5);
            }
        });
    }
    
    updateUI() {
        document.getElementById('player-resources').textContent = `Resources: ${this.resources}`;
        document.getElementById('player-score').textContent = `Score: ${this.score}`;
        document.getElementById('turn-count').textContent = this.turnCount;
    }
    
    updateStatus(status) {
        document.getElementById('status-text').textContent = status;
    }
}
