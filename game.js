const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const message = document.getElementById('message');

// Game objects
const paddle = {
    width: 80,
    height: 15,
    x: 0,
    y: 0,
    speed: 6,
    dx: 0
};

const ball = {
    x: 0,
    y: 0,
    radius: 8,
    speed: 4,
    dx: 4,
    dy: -4,
    maxSpeed: 8
};

// Blocks for 404
const blocks = [];
let blockWidth = 25;
let blockHeight = 12;
let blockPadding = 4;

// Set canvas dimensions and scale
function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    // Set canvas size to match container's size
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Update paddle and ball positions
    paddle.width = Math.min(80, canvas.width * 0.15);
    paddle.height = Math.min(15, canvas.height * 0.04);
    paddle.y = canvas.height - paddle.height * 2;
    paddle.x = canvas.width / 2 - paddle.width / 2;
    
    ball.radius = Math.min(8, canvas.width * 0.015);
    ball.x = canvas.width / 2;
    ball.y = canvas.height - paddle.height * 3;
    
    // Update block sizes
    blockWidth = Math.min(25, canvas.width * 0.05);
    blockHeight = Math.min(12, canvas.height * 0.035);
    blockPadding = Math.min(4, canvas.width * 0.008);
    
    // Recreate blocks with new sizes
    createBlocks();
}

// Create blocks forming "404"
function createBlocks() {
    blocks.length = 0;
    
    // First "4"
    const blocks4 = [
        [0,0,0,1,1],
        [0,0,1,1,0],
        [0,1,0,1,0],
        [1,1,1,1,1],
        [0,0,0,1,0],
        [0,0,0,1,0]
    ];
    
    // "0"
    const blocks0 = [
        [1,1,1,1,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,1]
    ];
    
    // Second "4"
    const blocks42 = [
        [0,0,0,1,1],
        [0,0,1,1,0],
        [0,1,0,1,0],
        [1,1,1,1,1],
        [0,0,0,1,0],
        [0,0,0,1,0]
    ];
    
    function createBlocksFromPattern(pattern, offsetX) {
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    blocks.push({
                        x: offsetX + col * (blockWidth + blockPadding),
                        y: canvas.height * 0.1 + row * (blockHeight + blockPadding),
                        width: blockWidth,
                        height: blockHeight,
                        color: '#ffffff'
                    });
                }
            }
        }
    }
    
    // Calculate dimensions for one digit
    const digitWidth = 5 * (blockWidth + blockPadding) - blockPadding;
    const gapBetweenDigits = digitWidth * 0.25;
    
    // Calculate total width of all digits with gaps
    const totalWidth = (digitWidth * 3) + (gapBetweenDigits * 2);
    
    // Calculate starting X position to center the entire 404
    const startX = (canvas.width - totalWidth) / 2;
    
    // Create digits with proper spacing
    createBlocksFromPattern(blocks4, startX);
    createBlocksFromPattern(blocks0, startX + digitWidth + gapBetweenDigits);
    createBlocksFromPattern(blocks42, startX + (digitWidth + gapBetweenDigits) * 2);
}

// Touch handling
let touchX = null;

canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', handleTouch, { passive: false });
canvas.addEventListener('touchend', () => {
    touchX = null;
});

function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    if (touch) {
        touchX = touch.clientX - rect.left;
        paddle.x = Math.min(Math.max(touchX - paddle.width / 2, 0), canvas.width - paddle.width);
    }
}

// Handle mouse movement
let mouseX = 0;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    if (mouseX >= 0 && mouseX <= canvas.width) {
        paddle.x = Math.min(Math.max(mouseX - paddle.width / 2, 0), canvas.width - paddle.width);
    }
});

// Handle keyboard controls
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === ' ' && message.style.display === 'block') {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
});

// Move paddle
function movePaddle() {
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
}

// Move ball
function moveBall() {
    const nextX = ball.x + ball.dx;
    const nextY = ball.y + ball.dy;

    // Wall collision
    if (nextX + ball.radius > canvas.width || nextX - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (nextY - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Paddle collision
    if (nextY + ball.radius > paddle.y && 
        nextY - ball.radius < paddle.y + paddle.height &&
        nextX + ball.radius > paddle.x && 
        nextX - ball.radius < paddle.x + paddle.width) {
        
        // Determine where the ball hit the paddle
        const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        
        // Calculate new angle (between -60 and 60 degrees)
        const angle = hitPoint * Math.PI / 3;
        
        // Set new velocity based on angle while maintaining speed
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = Math.sin(angle) * speed;
        ball.dy = -Math.abs(Math.cos(angle) * speed);
        
        // Ensure ball doesn't get stuck in paddle
        ball.y = paddle.y - ball.radius;
    }

    // Block collision
    for (let i = blocks.length - 1; i >= 0; i--) {
        const block = blocks[i];
        const left = block.x;
        const right = block.x + block.width;
        const top = block.y;
        const bottom = block.y + block.height;

        if (nextX + ball.radius > left && 
            nextX - ball.radius < right && 
            nextY + ball.radius > top && 
            nextY - ball.radius < bottom) {
            
            // Determine which side was hit
            const dx = ball.x - (block.x + block.width / 2);
            const dy = ball.y - (block.y + block.height / 2);
            
            // Compare slope to determine hit side
            if (Math.abs(dx / block.width) > Math.abs(dy / block.height)) {
                ball.dx = -ball.dx;
            } else {
                ball.dy = -ball.dy;
            }
            
            blocks.splice(i, 1);
            break;
        }
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ensure ball speed doesn't exceed maximum
    const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    if (currentSpeed > ball.maxSpeed) {
        const scale = ball.maxSpeed / currentSpeed;
        ball.dx *= scale;
        ball.dy *= scale;
    }

    // Check for game over
    if (ball.y + ball.radius > canvas.height) {
        message.style.display = 'block';
    }
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#272727';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw paddle
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();

    // Draw blocks
    blocks.forEach(block => {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
    });
}

// Game loop
function gameLoop() {
    movePaddle();
    moveBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Update message for mobile
function updateMessage() {
    if ('ontouchstart' in window) {
        message.textContent = 'TAP TO RESTART';
    } else {
        message.textContent = 'PRESS SPACE TO RESTART';
    }
}

// Add touch restart
canvas.addEventListener('touchstart', (e) => {
    if (message.style.display === 'block') {
        e.preventDefault();
        resetGame();
    }
});

// Reset game
function resetGame() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - paddle.height * 3;
    ball.dx = canvas.width * 0.007;
    ball.dy = -canvas.width * 0.007;
    paddle.x = canvas.width / 2 - paddle.width / 2;
    message.style.display = 'none';
    createBlocks();
}

// Initialize
updateMessage();
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
gameLoop(); 