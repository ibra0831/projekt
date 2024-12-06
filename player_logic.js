function initialize_player(cHeight, cWidth) {
    let canvas = document.getElementById("game_canvas");
    let ctx = canvas.getContext("2d");

    // Sørg for at billedet er indlæst, før du prøver at tegne det
    let image = new Image();
    image.src = "Bacteria.png";

    // Når billedet er indlæst, kan vi tegne det på canvas
    image.onload = function() {

        // Juster størrelsen på billedet (bredde og højde)
        let imageWidth = cWidth*0.075; // Angiv din ønskede bredde
        let imageHeight = cHeight*0.1; // Angiv din ønskede højde

        // Tegn billedet med den ønskede størrelse
        ctx.drawImage(image, 200, 200, imageWidth, imageHeight);
    };
}