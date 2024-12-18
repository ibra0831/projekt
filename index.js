const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const aspectRatio = 18 / 14;

// Variabler til input-tjek
const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
};
let lastKey = '';

let gameRunning = true;

const projectiles = [];

// Map generation
const selectedStarterMap = starterMaps[Math.floor(Math.random() * starterMaps.length)];

// Boundary class (vægge)
class Boundary {
    constructor({ position }) {
        this.position = position;
        this.width = canvas.width / 18;
        this.height = canvas.height / 14;
    }

    draw() {
        ctx.fillStyle = '#EC5766';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

// Spillerkarakter class
class Player {
    constructor({ position, velocity }) {
        this.position = position;
        this.health = 3;
        this.velocity = velocity;
        this.size = (canvas.width / 14) * 0.75;
        this.radius = (canvas.width / 14) * 0.35;

        this.image = new Image();
        this.image.src = 'Bacteria.png';
    }

    takeDamage() {
        this.health -= 1;
        if (this.health <= 0) {
            return true;
        }
        return false;
    }

    resize() {

        this.position.x = (canvas.width / 18) + ((canvas.width / 18) / 2);
        this.position.y = (canvas.height / 14) + ((canvas.height / 14) / 2);
    }

    draw() {
        this.size = (canvas.width / 14) * 0.75;
        this.radius = (canvas.width / 14) * 0.25;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#069E2D';
        ctx.fill();
        ctx.closePath();
        
    if (this.image.complete) {
        ctx.drawImage(
            this.image, 
            this.position.x - this.size / 2,
            this.position.y - this.size / 2,
            this.size, 
            this.size
        );
    } else {
        this.image.onload = () => {
            ctx.drawImage(
                this.image, 
                this.position.x - this.size / 2, 
                this.position.y - this.size / 2, 
                this.size, 
                this.size
            );
        };
    }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.draw();
    }
}
const boundaries = [];

// Projektil klasse
class Projectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.size = (canvas.width / 14) * 0.1;
        this.radius = (canvas.width / 14) * 0.1;
    }

    resize() {
        this.size = (canvas.width / 14) * 0.75;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#069E2D';
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class BloodCell { 
    static speed = 2;
    constructor({ position, velocity, color = 'white' }) {
      this.position = position;
      this.velocity = velocity;
      this.size = (canvas.width / 14) * 0.75; // Player size
      this.radius = (canvas.width / 14) * 0.35; // Player radius      
      this.color = color;
      this.prevCollisions = []; 
      this.speed = 2; 
      this.scared = false; 

      this.health = 3;

      this.image = new Image();
      this.image.src = 'WhiteBlood.png';
    }

    takeDamage() {
        this.health -= 1;
        if (this.health <= 0) {
            return true;
        }
        return false;
    }

    draw() {
        ctx.save();
        
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
    
        if (this.image.complete) {
            ctx.drawImage(
                this.image,
                this.position.x - this.radius,
                this.position.y - this.radius, 
                this.radius * 2,               
                this.radius * 2              
            );
        } else {
            this.image.onload = () => {
                ctx.drawImage(
                    this.image,
                    this.position.x - this.radius,
                    this.position.y - this.radius,
                    this.radius * 2,
                    this.radius * 2
                );
            };
        }
    
        ctx.restore(); // Restore the canvas state to remove the clipping
    }

    update() {
        this.draw();

        // Calculate the next position
        const nextPosition = {
            x: this.position.x + this.velocity.x,
            y: this.position.y + this.velocity.y,
        };

        // Check for collisions at the next position
        const collidesWithBoundary = boundaries.some(boundary => 
            circleCollidesWithRectangle({
                circle: { ...this, position: nextPosition }, // Check collision with next position
                rectangle: boundary
            })
        );

        // If collision detected, don't move
        if (!collidesWithBoundary) {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }

        // Adjust direction randomly if needed
        if (collidesWithBoundary) {
            this.velocity.x = 0;
            this.velocity.y = 0;

            // Random direction after collision
            const directions = ['down', 'up', 'right', 'left'];
            const availableDirections = directions.filter(direction => !this.prevCollisions.includes(direction));

            if (availableDirections.length > 0) {
                const direction = availableDirections[Math.floor(Math.random() * availableDirections.length)];
                switch (direction) {
                    case 'down':
                        this.velocity = { x: 0, y: this.speed };
                        break;
                    case 'up':
                        this.velocity = { x: 0, y: -this.speed };
                        break;
                    case 'right':
                        this.velocity = { x: this.speed, y: 0 };
                        break;
                    case 'left':
                        this.velocity = { x: -this.speed, y: 0 };
                        break;
                }
            }
        }
    }
}


// Resizing til canvas baseret på browser vinduets størrelse
function resizeCanvas() {
    if (window.innerWidth / window.innerHeight > aspectRatio) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * aspectRatio;
    } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth / aspectRatio;
    }

    // Opdaterer spillerens størrelse
    player.resize();

    // Genindlæser canvas
    updateCanvas();
}

const BWCs = [];

function updateCanvas() {
    boundaries.length = 0;

    ctx.fillStyle = '#C42348';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Banen
    const map = selectedStarterMap;
    
    map.forEach((row, i) => {
        row.forEach((symbol, j) => {
            if (symbol === '-') {
                boundaries.push(
                    new Boundary({
                        position: {
                            x: (canvas.width / 18) * j,
                            y: (canvas.height / 14) * i,
                        },
                    })
                );
            } else if (symbol === 'B') {
                BWCs.push(
                    new BloodCell({
                        position: {
                            x: (canvas.width / 18) * j + (canvas.width / 18) / 2,
                            y: (canvas.height / 14) * i + (canvas.height / 14) / 2,
                        }, 
                        velocity: {
                            x: BloodCell.speed,
                            y: 0 
                        },
                        color: 'white'
                    })
                );
            }
        });
    });
}

// Skaber spiller karakteren
const player = new Player({
    position: {
        x: (canvas.width / 18) + ((canvas.width / 18) / 2),
        y: (canvas.height / 14) + ((canvas.height / 14) / 2),
    },
    velocity: { x: 0, y: 0 },
});

// Tilføjer event listener der lytter til resize af browser-vinduet 
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function circleCollidesWithRectangle({ circle, rectangle }) {
    return ( 
        circle.position.y - circle.radius + circle.velocity.y <= 
        rectangle.position.y + rectangle.height && 
        circle.position.x + circle.radius + circle.velocity.x >= 
        rectangle.position.x && 
        circle.position.y + circle.radius + circle.velocity.y >= 
        rectangle.position.y && 
        circle.position.x - circle.radius + circle.velocity.x <= 
        rectangle.position. x + rectangle.width
    )
} 

function circleCollidesWithCircle(circle1, circle2) {
    const dx = circle1.position.x - circle2.position.x;
    const dy = circle1.position.y - circle2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circle1.radius + circle2.radius) {
        return true;
    }
    return false;
}

// Her foregår alt spil-mekanikken
function animate() {
    if (!gameRunning) return;

    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    boundaries.forEach((boundary) => {
        boundary.draw();

        if (
            circleCollidesWithRectangle({
                circle: player,
                rectangle: boundary
            })
            ) {
                player.velocity.x = 0
                player.velocity.y = 0 
              }
    });

    BWCs.forEach((BWC) => {
        BWC.update();

        //tjek om spilleren kolliderer med BWC
        if (circleCollidesWithCircle(player, BWC)){
            player.position = {
                x: (canvas.width / 18) + ((canvas.width / 18) / 2),
                y: (canvas.height / 14) + ((canvas.height / 14) / 2),
            };
            player.velocity.x = 0;
            player.velocity.y = 0;
            let isDead = player.takeDamage();
            if(isDead){
                window.location.href = "dead.html"
            }
        }

        if (BWC.position.x < 0) {
            BWC.position.x = canvas.width;
        } 
        if (BWC.position.x > canvas.width) {
            BWC.position.x = 0;
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (
            projectile.position.x + projectile.radius < 0 ||
            projectile.position.x - projectile.radius > canvas.width ||
            projectile.position.y + projectile.radius < 0 ||
            projectile.position.y - projectile.radius > canvas.height
        ) {
            projectiles.splice(index, 1);
        }
        boundaries.forEach((boundary) => {
            if (
                circleCollidesWithRectangle({
                    circle: projectile,
                    rectangle: boundary,
                })
            ) {
                projectiles.splice(index, 1);
            }
        });

        BWCs.forEach((BWC, BWCIndex) => {
            if (circleCollidesWithCircle(projectile, BWC)) {
                projectiles.splice(index, 1); // Remove projectile
                if (BWC.takeDamage()) {
                    const deadBWC = BWCs.splice(BWCIndex, 1); // Remove BWC if health <= 0
                    respawnBWC(deadBWC[0].position);
                    respawnBWC(deadBWC[0].position);
                }
            }
        });
        
    });

    player.update();

    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i] 
            if ( 
            circleCollidesWithRectangle({
            circle: {...player, 
                velocity: {
                x: 0,
                y: -5 
            }},
            rectangle: boundary
        })
        )   {
            player.velocity.y = 0 
            break 
        } else {
            player.velocity.y = -5 
        }
      } 
    } else if (keys.a.pressed && lastKey === 'a') {
         for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i] 
            if ( 
            circleCollidesWithRectangle({
            circle: {...player, 
                velocity: {
                x: -5, 
                y: 0 
            }},
            rectangle: boundary
        })
        )   {
            player.velocity.x = 0 
            break 
        } else {
            player.velocity.x = -5 
        }
      } 
    } else if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i] 
            if ( 
            circleCollidesWithRectangle({
            circle: {...player, 
                velocity: {
                x: 0,
                y: 5 
            }},
            rectangle: boundary
        })
        )   {
            player.velocity.y = 0 
            break 
        } else {
            player.velocity.y = 5 
        }
      } 
    } else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i] 
            if ( 
            circleCollidesWithRectangle({
            circle: {...player, 
                velocity: {
                x: 5, 
                y: 0 
            }},
            rectangle: boundary
        })
        )   {
            player.velocity.x = 0 
            break 
        } else {
            player.velocity.x = 5 
        }
      } 
    } 

    if (player.position.x < 0) {
        player.position.x = canvas.width;
    } 
    if (player.position.x > canvas.width) {
        player.position.x = 0;
    }
}
animate();

// Async function som kører efter 5 sekunder (5000 millisekunder) og spawner nye BWC i givne position
async function respawnBWC(position) {
    setTimeout(() => {
        BWCs.push(
            new BloodCell({
                position: {
                    x: position.x,
                    y: position.y
                }, 
                velocity: {
                    x: BloodCell.speed,
                    y: 0 
                },
                color: 'white'
            })
        );
    }, 5000);
}

function shootProjectile(direction) {
    const velocity = { x: 0, y: 0 };

    if (direction === 'up') {
        velocity.y = -10;
    } else if (direction === 'down') {
        velocity.y = 10;
    } else if (direction === 'left') {
        velocity.x = -10;
    } else if (direction === 'right') {
        velocity.x = 10;
    }

    projectiles.push(new Projectile({
        position: { x: player.position.x, y: player.position.y },
        velocity: velocity,
    }));
}

addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
        case 'ArrowUp':
            shootProjectile('up');
            break;
        case 'ArrowDown':
            shootProjectile('down');
            break;
        case 'ArrowLeft':
            shootProjectile('left');
            break;
        case 'ArrowRight':
            shootProjectile('right');
            break;
    }
});

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
});
