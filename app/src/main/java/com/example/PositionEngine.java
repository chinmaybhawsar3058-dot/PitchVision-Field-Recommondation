package com.example;

/**
 * PositionEngine encapsulates the tactical intelligence for cricket fielding placement.
 * Computes the optimal fielding position, ground coordinates, zone classification,
 * and tactical rationale based on fielder ability, bowler style, and batsman profile.
 */
public class PositionEngine {

    /**
     * Recommends the optimal field position for the given match parameters.
     */
    public static FieldPosition recommendPosition(String fielderName,
                                                  String fielderAbility,
                                                  String bowlerType,
                                                  String batsmanHand,
                                                  String batsmanStyle) {

        boolean isLeftHand = "Left Hand".equalsIgnoreCase(batsmanHand);
        boolean isAggressive = "Aggressive".equalsIgnoreCase(batsmanStyle);

        String positionName;
        String zone;
        String side;
        float xRatio; // Negative = Off-side for RHB (Left on screen), Positive = Leg-side for RHB (Right on screen)
        float yRatio; // Negative = Behind batsman (Upwards), Positive = Down ground towards bowler (Downwards)
        String tacticalReason;
        int catchingChance;
        int runSavingPriority;

        switch (fielderAbility) {
            case "Good Catcher":
                if ("Spinner".equalsIgnoreCase(bowlerType)) {
                    if (isAggressive) {
                        positionName = "Deep Mid-Wicket";
                        zone = "Boundary Catching Zone";
                        side = "Leg Side";
                        xRatio = 0.65f;
                        yRatio = 0.35f;
                        tacticalReason = fielderName + " has superior catching reflexes. Against an aggressive batsman facing a spinner, lofted slog-sweeps frequently carry to deep mid-wicket for crucial wicket-taking chances.";
                        catchingChance = 94;
                        runSavingPriority = 78;
                    } else {
                        positionName = "Forward Short Leg";
                        zone = "Close Infield Cordon";
                        side = "Leg Side";
                        xRatio = 0.16f;
                        yRatio = -0.28f;
                        tacticalReason = fielderName + " stationed at forward short leg capitalizes on glove deflections, inside-edges, and bat-pad pop-ups off the defensive prod against spin.";
                        catchingChance = 96;
                        runSavingPriority = 40;
                    }
                } else if ("Fast Bowler".equalsIgnoreCase(bowlerType)) {
                    if (isAggressive) {
                        positionName = "First Slip";
                        zone = "Catching Slip Cordon";
                        side = "Off Side";
                        xRatio = -0.15f;
                        yRatio = -0.60f;
                        tacticalReason = fielderName + " provides safe hands in the slip cordon. Aggressive batsmen flashing hard outside off-stump against express pace offer high-speed, regulation catches.";
                        catchingChance = 98;
                        runSavingPriority = 60;
                    } else {
                        positionName = "Gully";
                        zone = "Catching Slip Cordon";
                        side = "Off Side";
                        xRatio = -0.42f;
                        yRatio = -0.38f;
                        tacticalReason = fielderName + " positioned at gully attacks thick squirted edges and defensive push-drives through the backward point and slip gap.";
                        catchingChance = 92;
                        runSavingPriority = 70;
                    }
                } else { // Medium Pacer
                    positionName = isAggressive ? "First Slip" : "Backward Point";
                    zone = isAggressive ? "Catching Slip Cordon" : "Infield Ring Ring-Saver";
                    side = "Off Side";
                    xRatio = isAggressive ? -0.18f : -0.46f;
                    yRatio = isAggressive ? -0.56f : -0.25f;
                    tacticalReason = fielderName + "'s catching talent at " + positionName + " chokes scoring against medium pace swing and intercepts airborne cut shots.";
                    catchingChance = 90;
                    runSavingPriority = 82;
                }
                break;

            case "Fast Runner":
                if ("Spinner".equalsIgnoreCase(bowlerType)) {
                    if (isAggressive) {
                        positionName = "Deep Mid-Wicket";
                        zone = "Deep Boundary Sweeper";
                        side = "Leg Side";
                        xRatio = 0.72f;
                        yRatio = 0.40f;
                        tacticalReason = fielderName + "'s blistering running speed enables massive ground coverage between deep mid-wicket and long-on, cutting off 4s against aggressive spin assault.";
                        catchingChance = 82;
                        runSavingPriority = 95;
                    } else {
                        positionName = "Cover Point";
                        zone = "30-Yard Infield Ring";
                        side = "Off Side";
                        xRatio = -0.50f;
                        yRatio = -0.05f;
                        tacticalReason = fielderName + " can rapidly charge in from cover point, smothering soft push singles and putting immense psychological pressure on the defensive batsman.";
                        catchingChance = 75;
                        runSavingPriority = 92;
                    }
                } else { // Fast Bowler or Medium Pacer
                    if (isAggressive) {
                        positionName = "Deep Extra Cover";
                        zone = "Deep Boundary Sweeper";
                        side = "Off Side";
                        xRatio = -0.74f;
                        yRatio = 0.15f;
                        tacticalReason = fielderName + "'s pace makes them the ideal sweeper at deep extra cover, sprinting along the fence to cut off thunderous lofted cover drives and turning boundaries into singles.";
                        catchingChance = 80;
                        runSavingPriority = 97;
                    } else {
                        positionName = "Sweeper Cover";
                        zone = "Deep Boundary Sweeper";
                        side = "Off Side";
                        xRatio = -0.76f;
                        yRatio = -0.15f;
                        tacticalReason = fielderName + " covers the vast open off-side acreage, restricting defensive strike rotation and keeping the fielding side in complete control.";
                        catchingChance = 72;
                        runSavingPriority = 93;
                    }
                }
                break;

            case "Strong Arm":
                if ("Fast Bowler".equalsIgnoreCase(bowlerType)) {
                    if (isAggressive) {
                        positionName = "Third Man";
                        zone = "Boundary Patrol";
                        side = "Off Side";
                        xRatio = -0.60f;
                        yRatio = -0.72f;
                        tacticalReason = fielderName + "'s powerful throwing arm is vital at third man. Fast edges fly fine and deep; a bullet 70-meter direct throw to the wicketkeeper prevents batters stealing a second run.";
                        catchingChance = 76;
                        runSavingPriority = 98;
                    } else {
                        positionName = "Deep Fine Leg";
                        zone = "Boundary Patrol";
                        side = "Leg Side";
                        xRatio = 0.55f;
                        yRatio = -0.74f;
                        tacticalReason = fielderName + " utilizes their throwing arm at deep fine leg to launch direct rocket throws over the bails on defensive glances and clipped balls.";
                        catchingChance = 74;
                        runSavingPriority = 96;
                    }
                } else if ("Spinner".equalsIgnoreCase(bowlerType)) {
                    positionName = "Long On";
                    zone = "Deep Boundary Patrol";
                    side = "Leg Side";
                    xRatio = 0.38f;
                    yRatio = 0.78f;
                    tacticalReason = fielderName + " at long on delivers blistering flat throws right to the bowler's end stumps, deterring aggressive batsmen attempting to turn singles into twos down the ground.";
                    catchingChance = 84;
                    runSavingPriority = 94;
                } else { // Medium Pacer
                    positionName = "Deep Square Leg";
                    zone = "Deep Boundary Patrol";
                    side = "Leg Side";
                    xRatio = 0.74f;
                    yRatio = -0.25f;
                    tacticalReason = fielderName + " commands deep square leg. Pull shots and mistimed sweeps are quickly collected and dispatched on the fly back to the striker's end.";
                    catchingChance = 82;
                    runSavingPriority = 95;
                }
                break;

            case "Good Thrower":
                if (isAggressive) {
                    positionName = "Backward Point";
                    zone = "Inner Ring Hotspot";
                    side = "Off Side";
                    xRatio = -0.48f;
                    yRatio = -0.28f;
                    tacticalReason = fielderName + " brings deadly throwing accuracy to backward point. Any hesitation on square cuts results in a lightning-fast direct hit run-out.";
                    catchingChance = 88;
                    runSavingPriority = 96;
                } else {
                    if ("Spinner".equalsIgnoreCase(bowlerType)) {
                        positionName = "Short Mid-Wicket";
                        zone = "Inner Ring Hotspot";
                        side = "Leg Side";
                        xRatio = 0.40f;
                        yRatio = 0.05f;
                        tacticalReason = fielderName + " clamps down on soft defensive taps at short mid-wicket, delivering pinpoint underarm flicks onto the stumps to produce run-out breakthroughs.";
                        catchingChance = 85;
                        runSavingPriority = 92;
                    } else {
                        positionName = "Cover Point";
                        zone = "Inner Ring Hotspot";
                        side = "Off Side";
                        xRatio = -0.48f;
                        yRatio = -0.10f;
                        tacticalReason = fielderName + " shuts down the batsman's favourite scoring arc in the off-side ring with pinpoint bullet throws to both sets of wickets.";
                        catchingChance = 86;
                        runSavingPriority = 94;
                    }
                }
                break;

            case "All Round Fielder":
            default:
                if (isAggressive) {
                    if ("Spinner".equalsIgnoreCase(bowlerType)) {
                        positionName = "Long Off";
                        zone = "V-Zone Boundary Command";
                        side = "Off Side";
                        xRatio = -0.38f;
                        yRatio = 0.78f;
                        tacticalReason = fielderName + " is a complete fielder possessing high agility, supreme catching, and distance coverage. Long off allows them to intercept straight lofted drives and hold match-winning catches.";
                        catchingChance = 90;
                        runSavingPriority = 92;
                    } else {
                        positionName = "Extra Cover";
                        zone = "30-Yard Ring Command";
                        side = "Off Side";
                        xRatio = -0.46f;
                        yRatio = 0.12f;
                        tacticalReason = fielderName + " commands extra cover, the most demanding position in cricket against aggressive pace. Demands diving stops, catching reflexes, and rapid pick-and-throw executions.";
                        catchingChance = 89;
                        runSavingPriority = 96;
                    }
                } else {
                    positionName = "Mid Wicket";
                    zone = "30-Yard Ring Anchor";
                    side = "Leg Side";
                    xRatio = 0.44f;
                    yRatio = 0.16f;
                    tacticalReason = fielderName + " anchors mid wicket, stopping easy rotations into the on-side against defensive batsmen and maintaining relentless bowling pressure.";
                    catchingChance = 86;
                    runSavingPriority = 90;
                }
                break;
        }

        // Tactically mirror the X-axis and Side description if the batsman is Left-Handed!
        if (isLeftHand) {
            xRatio = -xRatio;
            if ("Off Side".equalsIgnoreCase(side)) {
                side = "Off Side (LHB)";
            } else if ("Leg Side".equalsIgnoreCase(side)) {
                side = "Leg Side (LHB)";
            }
        }

        return new FieldPosition(positionName, zone, side, xRatio, yRatio, tacticalReason, catchingChance, runSavingPriority);
    }
}
