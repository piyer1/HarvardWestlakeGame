class GameManager {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isPaused = true;
        this.username = '';
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.map = new Map();
        const spawnPoint = this.map.getRandomSpawnPoint();
        this.localPlayer = new Player(spawnPoint.x, spawnPoint.y, Math.random() < 0.2 ? 'teacher' : 'student');
        this.players = [this.localPlayer];

        this.cameraX = 0;
        this.cameraY = 0;
        this.keys = {};
        this.setupInputs();
        this.gameLoop();
    }

    start(username) {
        this.username = username;
        this.isPaused = false;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupInputs() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Hotbar selection
            if (e.key === '1' || e.key === '2') {
                this.localPlayer.selectHotbarSlot(parseInt(e.key) - 1);
            }
            
            // Inventory toggle
            if (e.key.toLowerCase() === 'e') {
                this.localPlayer.toggleInventory();
            }
            
            // Item use
            if (e.key.toLowerCase() === 'f') {
                if (this.localPlayer.getCurrentItem()) {
                    this.localPlayer.useCurrentItem();
                } else {
                    this.handleInteraction();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    update() {
        let moveX = 0;
        let moveY = 0;
        
        if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
        if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
        if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
        }

        if (moveX !== 0 || moveY !== 0) {
            console.log("Moving player:", moveX, moveY);
            this.localPlayer.move(moveX, moveY);
        }

        this.cameraX = this.canvas.width/2 - this.localPlayer.x;
        this.cameraY = this.canvas.height/2 - this.localPlayer.y;
    }

    draw() {
        if (!this.ctx) {
            console.error("No context available");
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.translate(Math.floor(this.cameraX), Math.floor(this.cameraY));
        
        // Draw map
        this.map.draw(this.ctx);
        
        // Draw player
        console.log("Drawing player at:", this.localPlayer.x, this.localPlayer.y);
        this.ctx.fillStyle = this.localPlayer.role === 'student' ? '#0000FF' : '#FF0000';
        this.ctx.fillRect(
            Math.floor(this.localPlayer.x - this.localPlayer.size/2),
            Math.floor(this.localPlayer.y - this.localPlayer.size/2),
            this.localPlayer.size,
            this.localPlayer.size
        );
        
        this.ctx.restore();

        // Draw UI elements after restore
        this.localPlayer.drawUI(this.ctx);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Ensure game only starts after window loads
window.onload = () => {
    console.log("Window loaded, creating game");
    new GameManager();
};