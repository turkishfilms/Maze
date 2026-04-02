/**
 * TODO:
 * add colored squares and wall moving, also counter for available wall moves. 
maybe torches
 *fix randmoness

just get all functions making sense and working and variables named appropriately
addinf feature to remeber where player has been and keep those walls white.
SOL: history is an array of objetcs. each {sectionCoor: [sectionX,sectionY], steps: [[step1[0],step1[1]],[step2[0],step2[1]]]. 
 */



const maxSize = 20,
    stepSize = 40,
    thicc = 1,
    big = 27000000

let w, h,
    screen = [0, 0], //the world is a grid of screens, this represesnts your pos in world
    player = {
        x: 0,
        y: 0
    }, //your pos in current screen
    playrPrev = {
        x: 0,
        y: 0
    }, //your last pos
    playrView = 2, //how big the area around you is "discovered"(turns white)
    col = [255, 255, 255], //idk homie dont ask me
    secCount = 0, //a count of how many sections?
    history = [{
        screenPos: {
            x: 0,
            y: 0
        },
        steps: []
    }], //[ {sectionPos: [sectionX,sectionY], steps: [{x:step1x,y:step1y},{x:step2x,y:step2y}]}, ..sexn2, ..sexn3] 
    speed = 15, // how fast holding a direction key will make you travel (lower is faster)
    maxSpeed = 1, //once a frame
    minSpeed = 40 //once every 40 frames


function setup() {
    w = windowWidth - (windowWidth % stepSize)
    h = windowHeight - (windowHeight % stepSize)
    createCanvas(w, h)
    noStroke()
    background(0)
    fill(255)
    drawScreen(screen[0], screen[1])
}

function keyPressed() {
    if (key == 'w') { //speed incresse
        speed = [speed - 1, maxSpeed].sort((a, b) => b - a)[0] //minimum
        return
    }

    if (key == 's') { //speed decrase
        speed = [speed + 1, minSpeed].sort((a, b) => a - b)[0] //maximum
        return
    }

    if (key == "ArrowLeft") {
        if (notBlockedByWall("left")) movePlayer("left")
    } else if (key == "ArrowRight") {
        if (notBlockedByWall("right")) movePlayer("right")
    } else if (key == "ArrowUp") {
        if (notBlockedByWall("up")) movePlayer("up")
    } else if (key == "ArrowDown") {
        if (notBlockedByWall("down")) movePlayer("down")
    }
}

const movePlayer = (dir) => { //dir is a str naming direction (up right down left) 
    //* from direction update playerPos, if off the edge, toroid it and screen scroll

    playrPrev = JSON.parse(JSON.stringify(player))

    switch (dir) { //from direction update playerPos, if off the edge, toroid it
        case "up":
            player.y = (player.y - stepSize + h) % h
            break;
        case "right":
            player.x = (player.x + stepSize + w) % w
            break;
        case "down":
            player.y = (player.y + stepSize + h) % h
            break;
        case "left":
            player.x = (player.x - stepSize + w) % w
            break;
    }


    //not really supposed to be here
    historyStuff(dir)
    drawNextStep()
}

const historyStuff = (dir) => { // break into single purpose functions
    if (isOffScreen(player, playrPrev, stepSize)) { //screen scroll
        screen = moveScreen(screen, dir)
        if (isVisitedScreen(screen, history)) {
            if (isNewCell(player, screen, history)) addStepToHistory(player, screen, history)
            drawScreen(screen[0], screen[1])
            history[findScreenIndex(screen, history)].steps.forEach(step => {
                drawWalls({
                    x: step.x,
                    y: step.y
                }, playrView, screen, history, col)
            })
        } else {
            history.push({
                screenPos: {
                    x: screen[0],
                    y: screen[1]
                },
                steps: [{
                    x: player.x,
                    y: player.y
                }]
            })
            drawScreen(screen[0], screen[1])
        }
    } else {
        if (isNewCell(player, screen, history)) {
            addStepToHistory(player, screen, history)
        }
    }
}

const addStepToHistory = (player, screen, history) => {
    // console.log("aStH:", player, screen, history);
    history[findScreenIndex(screen, history)].steps.push({
        x: player.x,
        y: player.y
    })
}

const coverPrevStep = (pos) => {
    fill(0, 0, 0)
    ellipse(pos.x + stepSize / 2, pos.y + stepSize / 2, stepSize / 2 + 1)
}

const drawPlayer = (player) => {
    //player
    fill(127, 50, 99)
    ellipse(player.x + stepSize / 2, player.y + stepSize / 2, stepSize / 2)
}

const drawNextStep = () => {
    //this is called after player has moved and prev updated
    /**
     * first draw a circle over previous player
     * draw new player
     * draw discovered squares if applicable
     */
    coverPrevStep(playrPrev)
    drawPlayer(player)
    drawWalls(player, playrView, screen, history, col)
}

const drawWalls = (player, playrView, screen, history, col) => {
    // if new cell draw walls white within radius
    // else dont

    //walls
    fill(col[0], col[1], col[2])
    for (let i = -floor(playrView / 2); i < playrView; i++) {
        for (let j = -floor(playrView / 2); j < playrView; j++) {
            randomSeed((player.x + screen[0] + i * stepSize) * (player.y + screen[1] + j * stepSize))
            const r = floor(random(3)),
                white = !isNewCell({
                    x: (player.x + i * stepSize),
                    y: (player.y + j * stepSize)
                }, [screen[0], screen[1]], history)
            if (white) fill(255, 255, 255)
            switch (r) {
                case 0:
                    rect(player.x + (i * stepSize), player.y + (j * stepSize) - (thicc / 2), stepSize, thicc)
                    break;
                case 1:
                    rect(player.x + (i * stepSize) - (thicc / 2), player.y + (j * stepSize), thicc, stepSize)
                    break;
            }
            if (white) fill(col[0], col[1], col[2])
        }
    }
}

const drawScreen = (x, y) => {
    // else use history to know which ones should be white
    background(0)
    const colr = (x * random(234) + 45) % 255,
        colg = (y * 2400 + 87) % 255,
        colb = ((x + y + 27) * 100032) % 255
    fill(colr, colg, colb)
    for (let i = 0; i < w; i += stepSize) {
        for (let j = 0; j < h; j += stepSize) { //cells in current screen
            randomSeed((i + x) * (j + y))
            const r = floor(random(3)),
                white = !isNewCell({
                    x: i,
                    y: j
                }, [x, y], history)
            if (white) fill(255)
            switch (r) {
                case 0: //horizontal
                    rect(i, j - (thicc / 2), stepSize, thicc)
                    break;
                case 1: //vertical
                    rect(i - (thicc / 2), j, thicc, stepSize)
                    break;
            }
            if (white) fill(colr, colg, colb)
        }
    }
}

const moveScreen = (curScreen, dir) => {
    switch (dir) {
        case ("left"):

            return [
                curScreen[0] - 1,
                curScreen[1]
            ]
        case ("right"):

            return [
                curScreen[0] + 1,
                curScreen[1]
            ]
        case ("up"):

            return [
                curScreen[0],
                curScreen[1] - 1
            ]
        case ("down"):

            return [
                curScreen[0],
                curScreen[1] + 1
            ]
    }
    return [curScreen[0], curScreen[1]]
}

function draw() { // just used for speed adjustment
    if (frameCount % speed == 0) {
        if (keyIsDown(UP_ARROW) ||
            keyIsDown(RIGHT_ARROW) ||
            keyIsDown(DOWN_ARROW) ||
            keyIsDown(LEFT_ARROW)) {
            keyPressed()
        }
    }
}

const isVisitedScreen = (screen, history) => {
    return (findScreenIndex(screen, history) + 1)
}

const findScreenIndex = (screen, history) => { //returns index if it has been visited and -1 if it hasnt:://
    // console.log("FSI:",screen,history);
    for (let i = 0; i < history.length; i++) {
        if (history[i].screenPos.x == screen[0] && history[i].screenPos.y == screen[1]) return i
    }
    return -1
}

const isNewCell = (player, screen, history) => { //returns something
    // console.log("iNC:", player, screen, history);
    const screenIndex = findScreenIndex(screen, history)
    if (!isVisitedScreen(screen, history)) {
        // console.log(`[${steps.length}] -- iNC5: TRUE IT IS A NEW CELL`);
        return true
    }
    // console.log("IVC2:", screenIndex, history[screenIndex].steps);
    const steps = history[screenIndex].steps
    // console.log("IVC:",steps);
    for (let i = 0; i < steps.length; i++) {
        // console.log(`iNC2:${steps.length}`, "player", player, "steps", steps[i], );
        if (steps[i].x == player.x && steps[i].y == player.y) {
            // console.log(`[${steps.length}] -- iNC3: FALSE, NOT A NEW CELL`);
            return false
        }
    }
    // console.log(`[${steps.length}] -- iNC4: TRUE IT IS A NEW CELL`);
    return true
}

const isOffScreen = (player, playrPrev, stepSize) => {
    // console.log("iOS:", player);
    return abs(player.x - playrPrev.x) > stepSize || abs(player.y - playrPrev.y) > stepSize
}

const notBlockedByWall = (str) => {
    let r
    switch (str) {
        case "up":
            randomSeed((player.x + screen[0]) * (player.y + screen[1]))
            r = floor(random(3))
            return r // not zero
        case "left":
            randomSeed((player.x + screen[0]) * (player.y + screen[1]))
            r = floor(random(3))
            return r != 1 //not 1
        case "down":
            randomSeed((player.x + screen[0]) * ((player.y + screen[1]) + stepSize))
            r = floor(random(3))
            return r //not zero
        case "right":
            randomSeed(((player.x + screen[0]) + stepSize) * (player.y + screen[1]))
            r = floor(random(3))
            return r != 1 //not 1
    }

}