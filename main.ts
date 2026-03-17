<<<<<<< codex/add-line-tracking-code-for-maqueen-robot-28xvx0
// Echo Challenge line tracking for Maqueen Plus V2
// Uses Maqueen Plus V2 line sensors (L2, L1, M, R1, R2).
// Tune speeds/timing on your floor and gray tape brightness.

const STRAIGHT_SPEED = 120
const SLIGHT_TURN_FAST = 130
const SLIGHT_TURN_SLOW = 55
const SHARP_TURN_FAST = 150
const SHARP_TURN_SLOW = 20
const SEARCH_SPEED = 85

const LOST_RECOVER_MS = 350
const END_BOX_STOP_MS = 1200

let running = true
let lastSeenLineMs = input.runningTime()
let lastTurnRight = true

function drive(left: number, right: number) {
    if (left >= 0) {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Forward, left)
    } else {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Backward, -left)
    }

    if (right >= 0) {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Forward, right)
    } else {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Backward, -right)
    }
}

function stopNow() {
    maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
}

maqueenPlusV2.I2CInit()
basic.showIcon(IconNames.Happy)

input.onButtonPressed(Button.A, function () {
    running = !running
    if (!running) {
        stopNow()
        basic.showIcon(IconNames.No)
    } else {
        basic.showIcon(IconNames.Yes)
        basic.pause(200)
        basic.clearScreen()
    }
})

basic.forever(function () {
    if (!running) {
        basic.pause(20)
        return
    }

    // Sensor state: 1 means line detected (matching your example code).
    const l2 = maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorL2)
    const l1 = maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorL1)
    const m = maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorM)
    const r1 = maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorR1)
    const r2 = maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorR2)

    const now = input.runningTime()
    const seesAny = l2 == 1 || l1 == 1 || m == 1 || r1 == 1 || r2 == 1

    if (seesAny) {
        lastSeenLineMs = now
    }

    // Priority: far sensors first for sharp corners.
    if (l2 == 1 && r2 == 0) {
        drive(SHARP_TURN_SLOW, SHARP_TURN_FAST)
        lastTurnRight = false
    } else if (r2 == 1 && l2 == 0) {
        drive(SHARP_TURN_FAST, SHARP_TURN_SLOW)
        lastTurnRight = true
    } else if (l1 == 1 && r1 == 0) {
        drive(SLIGHT_TURN_SLOW, SLIGHT_TURN_FAST)
        lastTurnRight = false
    } else if (r1 == 1 && l1 == 0) {
        drive(SLIGHT_TURN_FAST, SLIGHT_TURN_SLOW)
        lastTurnRight = true
    } else if (m == 1) {
        // Centered on line, go straight.
        drive(STRAIGHT_SPEED, STRAIGHT_SPEED)
    } else {
        // Lost line: short glide, then search in last known turn direction.
        const lostFor = now - lastSeenLineMs

        if (lostFor < LOST_RECOVER_MS) {
            drive(STRAIGHT_SPEED - 10, STRAIGHT_SPEED - 10)
        } else if (lostFor > END_BOX_STOP_MS) {
            // End box condition: no line for long enough.
            stopNow()
            running = false
            basic.showIcon(IconNames.Square)
        } else if (lastTurnRight) {
            drive(SEARCH_SPEED, -SEARCH_SPEED)
        } else {
            drive(-SEARCH_SPEED, SEARCH_SPEED)
=======
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
>>>>>>> master
        }
    }

    basic.pause(15)
})
<<<<<<< codex/add-line-tracking-code-for-maqueen-robot-28xvx0
=======

input.onButtonPressed(Button.A, function () {
    stopRobot()
    basic.showIcon(IconNames.No)
})

input.onButtonPressed(Button.B, function () {
    basic.showIcon(IconNames.Yes)
})
>>>>>>> master
