const maxSize = 20,
    res = 20,
    thicc = 4,
    big = 27000000

let w, h,
    screen = [0, 0], //the world is a grid of screens, this represesnts your pos in world
    playerPos = [0, 0], //your pos in curretn screen
    playrPrev = [0, 0], //your last pos
    playrView = 2, //how big the area around you is "discovered"(turns white)
    col = [255, 255, 255], //idk homie dont ask me
    secCount = 0, //a count of how many sections?
    history = [], //[ {sectionPos: [sectionX,sectionY], steps: [{x:step1x,y:step1y},{x:step2x,y:step2y}]}, ..sexn2, ..sexn3] 
    speed = 10, // how fast holding a direction key will make you travel (lower is faster)
    maxSpeed = 1, //once a frame
    minSpeed = 40 //once every 40 frames



/*
addinf feature to remeber where player has been and keep those walls white.
history is an array of objetcs. each {sectionCoor: [sectionX,sectionY], steps: [[step1[0],step1[1]],[step2[0],step2[1]]]. 
newscreen handles placing new section arrays into history and each keypressed event should put a new step into the appropriate section array as long as is unique step. 
newscreen will draw new colored walls. this code is trash send help.   

add colored squares and wall moving, also counter for available wall moves. 
maybe torches

fix randmoness
*/

function setup() {
    w = windowWidth - (windowWidth % res)
    h = windowHeight - (windowHeight % res)
    createCanvas(w, h)
    noStroke()
    background(0)
    fill(255)
    newScreen(screen[0], screen[1])
}

function newScreen(x, y) {
    background(0)
    fill((x * random(234) + 45) % 255 +80, (y * 2400 + 87) % 255+80, ((x + y + 27) * 100032) % 255+80)
    for (let i = 0; i < w; i += res) {
        for (let j = 0; j < h; j += res) {
            randomSeed((i + x) * (j + y))
            let r = floor(random(3))
            switch (r) {
                case 0: //horizontal
                    rect(i, j - (thicc / 2), res, thicc)
                    break;
                case 1: //vertical
                    rect(i - (thicc / 2), j, thicc, res)
                    break;
            }
        }
    }
}

function notBlockedByWall(str) {
    let r
    switch (str) {
        case "up":
            randomSeed((playerPos[0] + screen[0]) * (playerPos[1] + screen[1]))
            r = floor(random(3))
            return r // not zero
        case "left":
            randomSeed((playerPos[0] + screen[0]) * (playerPos[1] + screen[1]))
            r = floor(random(3))
            return r != 1 //not 1
        case "down":
            randomSeed((playerPos[0] + screen[0]) * ((playerPos[1] + screen[1]) + res))
            r = floor(random(3))
            return r //not zero
        case "right":
            randomSeed(((playerPos[0] + screen[0]) + res) * (playerPos[1] + screen[1]))
            r = floor(random(3))
            return r != 1 //not 1
    }
}

function screenScroll(pos1, pos2, currentScreen) {
    let p1 = pos1,
        p2 = pos2,
        cur = currentScreen
    let x = 0,
        y = 0
    if (p1[0] - p2[0] > res) {
        x = cur[0] - 1
        y = cur[1]
    }
    if (p2[0] - p1[0] > res) {
        x = cur[0] + 1
        y = cur[1]
    }
    if (p1[1] - p2[1] > res) {
        y = cur[1] - 1
        x = cur[0]
    }
    if (p2[1] - p1[1] > res) {
        y = cur[1] + 1
        x = cur[0]
    }
    screen = [x, y]
    newScreen(screen[0], screen[1])
    return [x, y]
}

function keyPressed() {
    //move
    if (key == 'w') {
        speed--
        speed = [speed, maxSpeed].sort((a, b) => b - a)[0] //minimum
        return
    }

    if (key == 's') {
        speed++
        speed = [speed, minSpeed].sort((a, b) => a - b)[0] //maximum
        return
    }

    playrPrev = playerPos.slice()
    if (key == "ArrowLeft" && notBlockedByWall("left")) playerPos[0] = (playerPos[0] - res + w) % w
    else if (key == "ArrowRight" && notBlockedByWall("right")) playerPos[0] = (playerPos[0] + res + w) % w
    else if (key == "ArrowUp" && notBlockedByWall("up")) playerPos[1] = (playerPos[1] - res + h) % h
    else if (key == "ArrowDown" && notBlockedByWall("down")) playerPos[1] = (playerPos[1] + res + h) % h
    else return

    //draw

    if (abs(playerPos[0] - playrPrev[0]) > res || abs(playerPos[1] - playrPrev[1]) > res) screen = screenScroll(playerPos, playrPrev, screen)

    // let sccc = []
    // history.forEach((sec) => {
    //     console.log("kp:hFe", sec);
    //     if (sec[0] == screen[0] && sec[1] == screen[1]) sccc = sec
    //     console.log("zuc:", sccc);
    // })

    // let gotcha = 0
    // console.log("typsccc:", typeof sccc);
    // sccc.forEach((step) => {
    //     console.log("kp:sFe", step);
    //     if (step[0] == player[0] && step[1] == player[1]) {
    //         gotcha++
    //         return
    //     }
    // })
    // if (gotcha == 0) sccc.push([player[0], player[1]])
    /**
     * Dont draw box
     * just draw circle covering character from previous step and white boxes according to playerview.
     * 
     */

    //box

    fill(0)
    rect(playerPos[0] - (res * 1) + thicc, playerPos[1] - (res * 1) + thicc, res * 3 - thicc, res * 3 - thicc)

    fill(0, 0, 0)
    // fixing player not disappearing from opposite side 
    if (playerPos[0] >= w - res - res / 2) ellipse(res / 2, playerPos[1] + res / 2, res / 2 + 1)
    if (playerPos[0] <= res * 1.5) ellipse(w - res / 2, playerPos[1] + res / 2, res / 2 + 1)
    if (playerPos[1] >= h - res - res / 2) ellipse(playerPos[0] + res / 2, res / 2, res / 2 + 1)
    if (playerPos[1] <= res * 1.5) ellipse(playerPos[0] + res / 2, h - res / 2, res / 2 + 1)

    //walls
    fill(col[0], col[1], col[2])
    for (let i = -floor(playrView / 2); i < playrView; i++) {
        for (let j = -floor(playrView / 2); j < playrView; j++) {
            randomSeed((playerPos[0] + screen[0] + i * res) * (playerPos[1] + screen[1] + j * res))
            let r = floor(random(3))
            switch (r) {
                case 0:
                    rect(playerPos[0] + (i * res), playerPos[1] + (j * res) - (thicc / 2), res, thicc)
                    break;
                case 1:
                    rect(playerPos[0] + (i * res) - (thicc / 2), playerPos[1] + (j * res), thicc, res)
                    break;
            }
        }
    }
    //player
    fill(127, 50, 99)
    ellipse(playerPos[0] + res / 2, playerPos[1] + res / 2, res / 2)
}

function draw() {
    if (frameCount % speed == 0) {
        if (keyIsDown(UP_ARROW)) {
            keyPressed()
        }
        if (keyIsDown(RIGHT_ARROW)) {
            keyPressed()
        }
        if (keyIsDown(DOWN_ARROW)) {
            keyPressed()
        }
        if (keyIsDown(LEFT_ARROW)) {
            keyPressed()
        }
    }
}