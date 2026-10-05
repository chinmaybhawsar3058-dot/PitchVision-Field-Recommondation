package com.example;

import java.io.Serializable;

/**
 * FieldPosition data model representing a recommended cricket fielding spot,
 * containing position coordinates relative to the cricket pitch, tactical zone,
 * side (Off / Leg), and tactical rationale.
 */
public class FieldPosition implements Serializable {

    private final String positionName;
    private final String zone;            // e.g. "Boundary Sweeper", "In-Ring Pressure", "Slip Cordon"
    private final String side;            // "Off Side" or "Leg Side"
    private final float xRatio;           // -1.0 (far Off/Leg) to 1.0 (far Leg/Off)
    private final float yRatio;           // -1.0 (behind batsman/keeper) to 1.0 (behind bowler)
    private final String tacticalReason;  // Strategic justification
    private final int catchingChance;     // percentage 0 - 100
    private final int runSavingPriority;  // percentage 0 - 100

    public FieldPosition(String positionName, String zone, String side,
                         float xRatio, float yRatio,
                         String tacticalReason, int catchingChance, int runSavingPriority) {
        this.positionName = positionName;
        this.zone = zone;
        this.side = side;
        this.xRatio = xRatio;
        this.yRatio = yRatio;
        this.tacticalReason = tacticalReason;
        this.catchingChance = catchingChance;
        this.runSavingPriority = runSavingPriority;
    }

    public String getPositionName() {
        return positionName;
    }

    public String getZone() {
        return zone;
    }

    public String getSide() {
        return side;
    }

    public float getXRatio() {
        return xRatio;
    }

    public float getYRatio() {
        return yRatio;
    }

    public String getTacticalReason() {
        return tacticalReason;
    }

    public int getCatchingChance() {
        return catchingChance;
    }

    public int getRunSavingPriority() {
        return runSavingPriority;
    }
}
