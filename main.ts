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
        }
    }

    basic.pause(15)
})
