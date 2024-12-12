const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const aspectRatio = 18 / 14; // Maintain this aspect ratio globally


// Player movement variables
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}


let lastKey = '';


const playerHSP = canvas.width * 0.01;
const playerVSP = canvas.width * 0.01;


// Function to resize the canvas while maintaining the aspect ratio
function resizeCanvas() {
    if (window.innerWidth / window.innerHeight > aspectRatio) {
        // Window is wider than the aspect ratio
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * aspectRatio;
    } else {
        // Window is taller than the aspect ratio
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth / aspectRatio;
    }


    // Redraw the canvas content after resizing
    updateCanvas();
}


// Class to define boundaries
class Boundary {
    constructor({ position }) {
        this.position = position;
        this.width = canvas.width / 18;
        this.height = canvas.height / 14;
    }


    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}


class Player {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.size = (canvas.width / 14) * 0.75;
        this.image = new Image(); // Create the image object
        this.image.src = "Bacteria.png"; // Set the image source
    }


    draw() {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
        } else {
            this.image.onload = () => {
                ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
            };
        }
    }


    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}
const boundaries = [];
// Draw boundaries and other elements
function updateCanvas() {
    // Baggrund
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // Map
    const map = [
        ['-','-','-','-','-','-'],
        ['-',' ',' ',' ',' ','-'],
        [' ',' ','-','-',' ',' '],
        ['-',' ',' ',' ',' ','-'],
        ['-','-','-','-','-','-']
    ];






    map.forEach((row, i) => {
        row.forEach((symbol, j) => {
            switch (symbol) {
                case '-':
                    boundaries.push(new Boundary({
                        position: {
                            x: (canvas.height / 14) * j,
                            y: (canvas.width / 18) * i
                        }
                    }))
                    break;
            }
        })
    })
}


// Add the resize event listener to adjust the canvas size dynamically
window.addEventListener('resize', resizeCanvas);


// Initial setup for canvas size
resizeCanvas();


// Player movement
const player = new Player({
    position: {
        x: (canvas.width / 18) + ((canvas.width / 18) / 2) * 0.05,
        y: (canvas.height / 14) + ((canvas.height / 14) / 2) * 0.05,
    },
    velocity: {
        x: 0,
        y: 0
    }
})


function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height)
   
    boundaries.forEach(boundary => {
        boundary.draw();
    })


    player.update();


    player.velocity.y = 0;
    player.velocity.x = 0;
    if (keys.w.pressed && lastKey === 'w') {
        player.velocity.y = -playerVSP;
    } else if (keys.a.pressed && lastKey === 'a') {
        player.velocity.x = -playerHSP;
    } else if (keys.s.pressed && lastKey === 's') {
        player.velocity.y = playerVSP;
    } else if (keys.d.pressed && lastKey === 'd') {
        player.velocity.x = playerHSP;
    }
}
animate();


addEventListener('keydown', ({ key }) => {
    console.log(key);
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
})


addEventListener('keyup', ({ key }) => {
    console.log(key);
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
})

