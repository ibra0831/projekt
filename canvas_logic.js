let canvas;
let ctx;

// Fixed aspect ratio (width:height)
const ASPECT_RATIO = 18 / 14;

function initialize_canvas() {
    // Create the canvas
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");

    canvas.id = "game_canvas";
    ctx.fillStyle = "crimson";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add the canvas to the document
    document.body.appendChild(canvas);

    // Ensure the canvas resizes properly on load and when the window is resized
    resize_canvas();
    window.addEventListener("resize", resize_canvas);
}

function resize_canvas() {
    // Get the window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate the width and height based on aspect ratio 4:3
    let newWidth = windowWidth;
    let newHeight = windowWidth / ASPECT_RATIO;

    // If the calculated height exceeds the window height, adjust based on height
    if (newHeight > windowHeight) {
        newHeight = windowHeight;
        newWidth = windowHeight * ASPECT_RATIO;
    }

    // Apply the new dimensions to the canvas
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Optional: Add some styling to center the canvas
    canvas.style.display = "block";
    canvas.style.margin = "auto";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.bottom = "0";
    canvas.style.left = "0";
    canvas.style.right = "0";

    // Clear and redraw the canvas with the new size
    ctx.fillStyle = "#FA0F1B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Determine the grid size based on the shortest side of the canvas
    const gridSize = Math.min(canvas.width, canvas.height) / 14;

    // Draw vertical grid lines
    for (let i = 0; i <= 18; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.lineWidth = 5; 
        ctx.strokeStyle = "#FB3741"; 
        ctx.stroke(); 
    }     

    // Draw horizontal grid lines
    for (let i = 0; i <= 14; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.lineWidth = 5; 
        ctx.strokeStyle = "#FB3741"; 
        ctx.stroke(); 
    }    

    initialize_player(canvas.height, canvas.width);
}
function start_game() {
    initialize_canvas();
    initialize_player();
    document.getElementById("button_start_game").remove(); 
}



