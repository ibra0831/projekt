const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const aspectRatio = 18 / 14; // Størrelsen og billedformat af banen

// Variabler til input-tjek
const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false },
};
let lastKey = '';

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
        this.velocity = velocity;
        this.size = (canvas.width / 14) * 0.75;
        this.radius = (canvas.width / 14) * 0.75;

        /* this.image = new Image();
        this.image.src = 'Bacteria.png'; */
    }

    resize() {

        this.position.x = (canvas.width / 18) + ((canvas.width / 18) / 2);
        this.position.y = (canvas.height / 14) + ((canvas.height / 14) / 2);
    }

    draw() {
        this.size = (canvas.width / 14) * 0.75;
        this.radius = (canvas.width / 14) * 0.35;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#069E2D';
        ctx.fill();
        ctx.closePath();
        
        /*if (this.image.complete) {
            ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
        } else {
            this.image.onload = () => {
                ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
            };
        }*/
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
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

        /* this.image = new Image();
        this.image.src = 'Bacteria.png'; */
    }

    resize() {
        this.size = (canvas.width / 14) * 0.75;
        this.position.x = (canvas.width / 18) + ((canvas.width / 18) / 2);
        this.position.y = (canvas.height / 14) + ((canvas.height / 14) / 2);
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

// Fjende class
class BloodCell { 
    static speed = 2 
    constructor({ position, velocity, color = 'white' }) {
      this.position = position
      this.velocity = velocity
      this.radius = (canvas.width / 14) * 0.75;
      this.color = color
      this.prevCollisions = [] 
      this.speed = 2 
      this.scared = false 
    }

draw() {
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2) 
    ctx.fillStyle = this.scared ? 'blue' : this.color
    ctx.fill() 
    ctx.closePath()
    }

update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
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

const BWCs = [
    new BloodCell({
        position: {
            x: (canvas.width / 18) + ((canvas.width / 18) / 2),
            y: (canvas.height / 14) + ((canvas.height / 14) / 2),
        }, 
        velocity: {
            x: BloodCell.speed,
            y: 0 
        },
        color: 'white'
    })
]

// Tilføjer event listener der lytter til resize af browser-vinduet 
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function circleCollidesWithRectangle({ circle, rectangle }) {
    const padding = Boundary.width / 2 - circle.radius - 1
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

// Her foregår alt spil-mekanikken
function animate() {
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

    BWCs.forEach((BWCs) => {
        BWCs.update();
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

// Input-tjek listeners
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