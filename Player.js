class Player {
    constructor({ } = {}) {
        this.player = {
            x: 0,
            y: 0
        } //your pos in current screen
        this.playrPrev = {
            x: 0,
            y: 0
        } //your last pos
        this.playrView = 2 //how big the area around you is "discovered"(turns white)
        this.col = [255, 255, 255] //idk homie dont ask me
        this.history = [{
            screenPos: {
                x: 0,
                y: 0
            },
            steps: []
        }] //[ {sectionPos: [sectionX,sectionY], steps: [{x:step1x,y:step1y},{x:step2x,y:step2y}]}, ..sexn2, ..sexn3] 
        this.speed = 15 // how fast holding a direction key will make you travel (lower is faster)
        this.maxSpeed = 1 //once a frame
        this.minSpeed = 40 //once every 40 frames
    }

    movePlayer = (dir) => { //dir is a str naming direction (up right down left) 
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

    addStepToHistory = (player, screen, history) => {
        // console.log("aStH:", player, screen, history);
        history[findScreenIndex(screen, history)].steps.push({
            x: player.x,
            y: player.y
        })
    }

    historyStuff = (dir) => { // break into single purpose functions
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

    addStepToHistory = (player, screen, history) => {
        // console.log("aStH:", player, screen, history);
        history[findScreenIndex(screen, history)].steps.push({
            x: player.x,
            y: player.y
        })
    }

    coverPrevStep = (pos) => {
        fill(0, 0, 0)
        ellipse(pos.x + stepSize / 2, pos.y + stepSize / 2, stepSize / 2 + 1)
    }

    drawPlayer = (player) => {
        //player
        fill(127, 50, 99)
        ellipse(player.x + stepSize / 2, player.y + stepSize / 2, stepSize / 2)
    }

    drawNextStep = () => {
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

    moveScreen = (curScreen, dir) => {
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

    isVisitedScreen = (screen, history) => {
        return (findScreenIndex(screen, history) + 1)
    }

    findScreenIndex = (screen, history) => { //returns index if it has been visited and -1 if it hasnt:://
        // console.log("FSI:",screen,history);
        for (let i = 0; i < history.length; i++) {
            if (history[i].screenPos.x == screen[0] && history[i].screenPos.y == screen[1]) return i
        }
        return -1
    }

    isNewCell = (player, screen, history) => { //returns something
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

    isOffScreen = (player, playrPrev, stepSize) => {
        // console.log("iOS:", player);
        return abs(player.x - playrPrev.x) > stepSize || abs(player.y - playrPrev.y) > stepSize
    }

    notBlockedByWall = (str) => {
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
}