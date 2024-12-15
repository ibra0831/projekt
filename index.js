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
    const map = [
        ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
        ['-', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
        ['-', ' ', '-', ' ', '-', ' ', ' ', '-', ' ', ' ', ' ', '-', '-', '-', ' ', '-', ' ', '-'],
        ['-', ' ', '-', ' ', '-', ' ', '-', '-', ' ', '-', '-', '-', ' ', '-', ' ', '-', ' ', '-'],
        ['-', ' ', '-', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', '-', ' ', '-'],
        ['-', ' ', '-', ' ', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', ' ', '-', ' ', '-'],
        [' ', ' ', '-', ' ', ' ', ' ', ' ', '-', ' ', '-', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' '],
        [' ', ' ', '-', '-', ' ', '-', ' ', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', ' '],
        ['-', ' ', ' ', ' ', ' ', '-', ' ', '-', ' ', '-', ' ', '-', ' ', ' ', ' ', ' ', ' ', '-'],
        ['-', '-', '-', '-', ' ', '-', '-', '-', ' ', '-', '-', '-', ' ', '-', '-', '-', '-', '-'],
        ['-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
        ['-', ' ', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', ' ', '-'],
        ['-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
        ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
    ]
    
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

// Tilføjer event listener der lytter til resize af browser-vinduet 
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Her foregår alt spil-mekanikken
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    boundaries.forEach((boundary) => {
        boundary.draw();

        // Collision håndtering
        if (player.position.y + player.velocity.y + (-player.radius) <= boundary.position.y + boundary.height
            && player.position.x + player.velocity.x + (player.radius) >= boundary.position.x
            && player.position.y + player.velocity.y + (player.radius) >= boundary.position.y 
            && player.position.x + player.velocity.x + (-player.radius) <= boundary.position.x + boundary.width
        ) {
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    });

    player.update();


    if (keys.w.pressed && lastKey === 'w') {
        player.velocity.y = -canvas.width * 0.01;
    } else if (keys.a.pressed && lastKey === 'a') {
        player.velocity.x = -canvas.width * 0.01;
    } else if (keys.s.pressed && lastKey === 's') {
        player.velocity.y = canvas.width * 0.01;
    } else if (keys.d.pressed && lastKey === 'd') {
        player.velocity.x = canvas.width * 0.01;
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