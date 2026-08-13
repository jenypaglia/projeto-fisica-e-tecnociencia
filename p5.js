/* =========================================================
   ÓPTICA — JOGO DE REFLEXÃO
   Desenvolvido com p5.js
   ========================================================= */

let mirrorAngle = 0;

let target = {
    x: 0,
    y: 0
};

let score = 0;

let hits = 0;

let gameStarted = false;

let particles = [];

let message = "Mova o mouse e encontre o alvo!";

let lastHitTime = 0;


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

function setup() {

    let container = document.getElementById("p5-game");

    let canvasWidth = Math.min(
        container.clientWidth,
        1100
    );

    let canvasHeight = Math.min(
        560,
        canvasWidth * 0.55
    );

    let canvas = createCanvas(
        canvasWidth,
        canvasHeight
    );

    canvas.parent("p5-game");

    canvas.mousePressed(startGame);

    resetTarget();

}


/* =========================================================
   LOOP PRINCIPAL
   ========================================================= */

function draw() {

    background("#21191d");

    drawBackground();

    updateMirror();

    drawLightSource();

    drawMirror();

    drawRay();

    drawTarget();

    updateParticles();

    drawGameText();

}


/* =========================================================
   FUNDO
   ========================================================= */

function drawBackground() {

    noStroke();

    for (let r = width; r > 0; r -= 25) {

        let alpha = map(
            r,
            width,
            0,
            8,
            0
        );

        fill(
            247,
            189,
            206,
            alpha
        );

        circle(
            width / 2,
            height / 2,
            r
        );
    }


    /*
       Pequenas estrelas decorativas
    */

    for (let i = 0; i < 30; i++) {

        let x = (i * 97) % width;
        let y = (i * 53) % height;

        fill(
            231,
            201,
            142,
            70
        );

        circle(
            x,
            y,
            2
        );
    }

}


/* =========================================================
   ESPELHO
   ========================================================= */

function updateMirror() {

    let centerX = width * 0.52;
    let centerY = height * 0.52;

    /*
       O mouse controla o ângulo.
    */

    if (
        mouseX >= 0 &&
        mouseX <= width &&
        mouseY >= 0 &&
        mouseY <= height
    ) {

        mirrorAngle = atan2(
            mouseY - centerY,
            mouseX - centerX
        );

    }

}


/* =========================================================
   FONTE DE LUZ
   ========================================================= */

function drawLightSource() {

    let x = width * 0.12;
    let y = height * 0.5;

    noStroke();

    /*
       Brilho externo
    */

    for (let r = 80; r > 10; r -= 10) {

        fill(
            255,
            214,
            113,
            8
        );

        circle(
            x,
            y,
            r
        );
    }


    fill("#e7c98e");

    circle(
        x,
        y,
        22
    );


    fill("#fff6df");

    circle(
        x - 4,
        y - 4,
        7
    );


    fill("#ffffff");

    textAlign(CENTER);

    textSize(11);

    text(
        "FONTE",
        x,
        y + 40
    );

}


/* =========================================================
   ESPELHO
   ========================================================= */

function drawMirror() {

    let centerX = width * 0.52;
    let centerY = height * 0.52;

    push();

    translate(
        centerX,
        centerY
    );

    rotate(
        mirrorAngle + HALF_PI
    );

    /*
       Brilho atrás do espelho
    */

    stroke(
        231,
        201,
        142,
        30
    );

    strokeWeight(12);

    line(
        0,
        -70,
        0,
        70
    );


    /*
       Corpo do espelho
    */

    stroke("#e7c98e");

    strokeWeight(7);

    line(
        0,
        -75,
        0,
        75
    );


    stroke(
        255,
        239,
        245
    );

    strokeWeight(3);

    line(
        -3,
        -72,
        -3,
        72
    );

    pop();

}


/* =========================================================
   RAIO
   ========================================================= */

function drawRay() {

    let sourceX = width * 0.12;
    let sourceY = height * 0.5;

    let mirrorX = width * 0.52;
    let mirrorY = height * 0.52;

    /*
       Direção da fonte até o espelho
    */

    let incoming = createVector(
        mirrorX - sourceX,
        mirrorY - sourceY
    );

    incoming.normalize();


    /*
       Normal do espelho
    */

    let normal = createVector(
        cos(mirrorAngle),
        sin(mirrorAngle)
    );

    /*
       Fórmula de reflexão:

       R = I - 2(I · N)N
    */

    let reflected = p5.Vector.sub(
        incoming,
        p5.Vector.mult(
            normal,
            2 * incoming.dot(normal)
        )
    );

    reflected.normalize();


    /*
       Desenha raio incidente
    */

    stroke(
        255,
        220,
        139,
        170
    );

    strokeWeight(3);

    line(
        sourceX,
        sourceY,
        mirrorX,
        mirrorY
    );


    /*
       Raios decorativos
    */

    drawingContext.setLineDash([8, 10]);

    stroke(
        255,
        220,
        139,
        70
    );

    line(
        sourceX,
        sourceY - 30,
        mirrorX,
        mirrorY - 30
    );

    line(
        sourceX,
        sourceY + 30,
        mirrorX,
        mirrorY + 30
    );

    drawingContext.setLineDash([]);


    /*
       Raio refletido
    */

    let rayLength = width * 0.6;

    let endX =
        mirrorX +
        reflected.x *
        rayLength;

    let endY =
        mirrorY +
        reflected.y *
        rayLength;


    stroke(
        "#fff4cf"
    );

    strokeWeight(4);

    line(
        mirrorX,
        mirrorY,
        endX,
        endY
    );


    /*
       Pontinhos luminosos
    */

    for (
        let distance = 0;
        distance < rayLength;
        distance += 25
    ) {

        let px =
            mirrorX +
            reflected.x *
            distance;

        let py =
            mirrorY +
            reflected.y *
            distance;

        fill(
            255,
            230,
            160,
            150
        );

        noStroke();

        circle(
            px,
            py,
            5
        );
    }


    /*
       Verificação de colisão
    */

    let distanceToTarget = dist(
        endX,
        endY,
        target.x,
        target.y
    );


    /*
       Também verificamos se o alvo está próximo
       do segmento refletido.
    */

    let closest = closestPointOnLine(
        mirrorX,
        mirrorY,
        endX,
        endY,
        target.x,
        target.y
    );

    let targetDistance = dist(
        closest.x,
        closest.y,
        target.x,
        target.y
    );


    if (
        targetDistance < 30 &&
        millis() - lastHitTime > 1000
    ) {

        registerHit();

    }

}


/* =========================================================
   ALVO
   ========================================================= */

function drawTarget() {

    push();

    noFill();

    stroke(
        231,
        201,
        142,
        100
    );

    strokeWeight(2);

    circle(
        target.x,
        target.y,
        65
    );


    stroke(
        "#e7c98e"
    );

    strokeWeight(3);

    circle(
        target.x,
        target.y,
        45
    );


    noStroke();

    fill(
        231,
        201,
        142
    );

    circle(
        target.x,
        target.y,
        17
    );


    fill("#fff6df");

    circle(
        target.x - 3,
        target.y - 3,
        5
    );

    pop();

}


/* =========================================================
   TEXTOS
   ========================================================= */

function drawGameText() {

    fill(
        255,
        255,
        255,
        180
    );

    noStroke();

    textAlign(LEFT);

    textSize(12);

    text(
        message,
        25,
        30
    );


    fill(
        231,
        201,
        142,
        120
    );

    textSize(10);

    text(
        "ÂNGULO DO ESPELHO",
        25,
        height - 25
    );


    /*
       Indicador de ângulo
    */

    let degrees = degreesValue();

    text(
        Math.round(degrees) + "°",
        25,
        height - 42
    );

}


/* =========================================================
   PARTÍCULAS
   ========================================================= */

function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        let p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.life -= 4;

        noStroke();

        fill(
            231,
            201,
            142,
            p.life
        );

        circle(
            p.x,
            p.y,
            p.size
        );


        if (p.life <= 0) {

            particles.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   COLISÃO
   ========================================================= */

function registerHit() {

    score += 100;

    hits++;

    lastHitTime = millis();

    message =
        "✨ Acertou! Excelente reflexão!";


    document.getElementById(
        "score"
    ).textContent = score;


    /*
       Explosão de partículas
    */

    for (
        let i = 0;
        i < 35;
        i++
    ) {

        let angle =
            random(TWO_PI);

        let speed =
            random(1, 5);

        particles.push({

            x: target.x,

            y: target.y,

            vx:
                cos(angle) *
                speed,

            vy:
                sin(angle) *
                speed,

            size:
                random(3, 8),

            life:
                255

        });

    }


    setTimeout(
        () => {

            resetTarget();

            message =
                "Novo alvo! Encontre o próximo.";

        },
        700
    );

}


/* =========================================================
   NOVO ALVO
   ========================================================= */

function resetTarget() {

    /*
       Evita colocar o alvo em cima da fonte
       ou do espelho.
    */

    target.x = random(
        width * 0.65,
        width * 0.92
    );

    target.y = random(
        height * 0.15,
        height * 0.85
    );

}


/* =========================================================
   PONTO MAIS PRÓXIMO DE UMA LINHA
   ========================================================= */

function closestPointOnLine(
    x1,
    y1,
    x2,
    y2,
    px,
    py
) {

    let dx = x2 - x1;
    let dy = y2 - y1;

    if (
        dx === 0 &&
        dy === 0
    ) {

        return {
            x: x1,
            y: y1
        };

    }


    let t =
        (
            (px - x1) * dx +
            (py - y1) * dy
        ) /
        (
            dx * dx +
            dy * dy
        );


    t = constrain(
        t,
        0,
        1
    );


    return {

        x:
            x1 +
            t * dx,

        y:
            y1 +
            t * dy

    };

}


/* =========================================================
   ÂNGULO
   ========================================================= */

function degreesValue() {

    let angle =
        degrees(
            mirrorAngle
        );

    if (angle < 0) {

        angle += 360;

    }

    return angle;

}


/* =========================================================
   INÍCIO DO JOGO
   ========================================================= */

function startGame() {

    if (!gameStarted) {

        gameStarted = true;

        message =
            "Boa sorte! Direcione o raio para o alvo.";

    }

}


/* =========================================================
   RESPONSIVIDADE
   ========================================================= */

function windowResized() {

    let container =
        document.getElementById(
            "p5-game"
        );

    if (!container) return;


    let newWidth =
        Math.min(
            container.clientWidth,
            1100
        );


    let newHeight =
        Math.min(
            560,
            newWidth * 0.55
        );


    resizeCanvas(
        newWidth,
        newHeight
    );


    resetTarget();

}
