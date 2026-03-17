// Maqueen line-tracking program for the Echo Challenge style path.
// Works with 2 IR line sensors (left/right). Tune values below for your robot.

const BASE_SPEED = 60
const TURN_SPEED = 42
const SEARCH_SPEED = 35
const LOST_TIMEOUT_MS = 400

// For DFRobot Maqueen sensors, black is usually 0 and white is 1.
// If your robot behaves opposite, change this to 1.
const LINE_DETECTED = 0

let lastSeen = input.runningTime()
let lastTurnDirection = 1 // 1 = right, -1 = left

function setMotors(left: number, right: number) {
    if (left >= 0) {
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, left)
    } else {
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, -left)
    }

    if (right >= 0) {
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, right)
    } else {
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, -right)
    }
}

function stopRobot() {
    maqueen.motorStop(maqueen.Motors.All)
}

basic.showIcon(IconNames.Happy)
basic.pause(500)

basic.forever(function () {
    const leftSensor = maqueen.readPatrol(maqueen.Patrol.PatrolLeft)
    const rightSensor = maqueen.readPatrol(maqueen.Patrol.PatrolRight)

    const leftOnLine = leftSensor == LINE_DETECTED
    const rightOnLine = rightSensor == LINE_DETECTED

    if (leftOnLine && rightOnLine) {
        // Centered or crossing a thick section: drive forward.
        setMotors(BASE_SPEED, BASE_SPEED)
        lastSeen = input.runningTime()
    } else if (leftOnLine && !rightOnLine) {
        // Drifted right -> turn left to recover.
        setMotors(TURN_SPEED, BASE_SPEED)
        lastSeen = input.runningTime()
        lastTurnDirection = -1
    } else if (!leftOnLine && rightOnLine) {
        // Drifted left -> turn right to recover.
        setMotors(BASE_SPEED, TURN_SPEED)
        lastSeen = input.runningTime()
        lastTurnDirection = 1
    } else {
        // Both sensors lost the line; do a controlled search.
        if (input.runningTime() - lastSeen < LOST_TIMEOUT_MS) {
            // Keep moving briefly in the last known direction.
            setMotors(BASE_SPEED + 5 * lastTurnDirection, BASE_SPEED - 5 * lastTurnDirection)
        } else {
            // Pivot search until a sensor sees line again.
            if (lastTurnDirection > 0) {
                setMotors(SEARCH_SPEED, -SEARCH_SPEED)
            } else {
                setMotors(-SEARCH_SPEED, SEARCH_SPEED)
            }
        }
    }

    basic.pause(15)
})

input.onButtonPressed(Button.A, function () {
    stopRobot()
    basic.showIcon(IconNames.No)
})

input.onButtonPressed(Button.B, function () {
    basic.showIcon(IconNames.Yes)
})
