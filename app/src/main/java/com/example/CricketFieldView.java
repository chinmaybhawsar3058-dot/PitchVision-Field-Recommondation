package com.example;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.util.AttributeSet;
import android.view.View;

import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;

/**
 * CricketFieldView is a custom 2D Canvas View representing a complete cricket ground.
 * Renders the boundary rope, 30-yard inner circle, 22-yard pitch, wickets, bowler run-up,
 * dynamic Off/Leg side labels (reflecting RHB/LHB orientation), and pins the recommended fielder.
 */
public class CricketFieldView extends View {

    private Paint grassDarkPaint;
    private Paint grassLightPaint;
    private Paint boundaryRopePaint;
    private Paint circle30YardPaint;
    private Paint pitchPaint;
    private Paint creasePaint;
    private Paint stumpsPaint;
    private Paint textSidePaint;
    private Paint otherFielderPaint;
    private Paint targetHaloPaint;
    private Paint targetPinPaint;
    private Paint targetBadgeBgPaint;
    private Paint targetTextNamePaint;
    private Paint targetTextPosPaint;

    private String fielderName = "Fielder";
    private FieldPosition recommendedPosition = null;
    private boolean isLeftHandBatsman = false;

    private final RectF boundaryRect = new RectF();
    private final RectF innerCircleRect = new RectF();
    private final RectF pitchRect = new RectF();
    private final RectF badgeRect = new RectF();

    public CricketFieldView(Context context) {
        super(context);
        init();
    }

    public CricketFieldView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public CricketFieldView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        Context context = getContext();

        grassDarkPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        grassDarkPaint.setColor(ContextCompat.getColor(context, R.color.turf_green_outer));
        grassDarkPaint.setStyle(Paint.Style.FILL);

        grassLightPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        grassLightPaint.setColor(ContextCompat.getColor(context, R.color.turf_green_inner));
        grassLightPaint.setStyle(Paint.Style.FILL);

        boundaryRopePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        boundaryRopePaint.setColor(Color.WHITE);
        boundaryRopePaint.setStyle(Paint.Style.STROKE);
        boundaryRopePaint.setStrokeWidth(4f);

        circle30YardPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        circle30YardPaint.setColor(Color.parseColor("#90FFFFFF"));
        circle30YardPaint.setStyle(Paint.Style.STROKE);
        circle30YardPaint.setStrokeWidth(2.5f);
        circle30YardPaint.setPathEffect(new DashPathEffect(new float[]{12f, 10f}, 0));

        pitchPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        pitchPaint.setColor(ContextCompat.getColor(context, R.color.cricket_pitch));
        pitchPaint.setStyle(Paint.Style.FILL);

        creasePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        creasePaint.setColor(Color.WHITE);
        creasePaint.setStyle(Paint.Style.STROKE);
        creasePaint.setStrokeWidth(2f);

        stumpsPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        stumpsPaint.setColor(ContextCompat.getColor(context, R.color.cricket_stumps));
        stumpsPaint.setStyle(Paint.Style.FILL);

        textSidePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        textSidePaint.setColor(Color.parseColor("#80FFFFFF"));
        textSidePaint.setTextSize(26f);
        textSidePaint.setTextAlign(Paint.Align.CENTER);
        textSidePaint.setLetterSpacing(0.12f);

        otherFielderPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        otherFielderPaint.setColor(Color.parseColor("#80E0E0E0"));
        otherFielderPaint.setStyle(Paint.Style.FILL);

        targetHaloPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        targetHaloPaint.setColor(Color.parseColor("#50FFD600"));
        targetHaloPaint.setStyle(Paint.Style.FILL);

        targetPinPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        targetPinPaint.setColor(Color.parseColor("#FFD600"));
        targetPinPaint.setStyle(Paint.Style.FILL);

        targetBadgeBgPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        targetBadgeBgPaint.setColor(Color.parseColor("#E6121E17"));
        targetBadgeBgPaint.setStyle(Paint.Style.FILL);

        targetTextNamePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        targetTextNamePaint.setColor(Color.WHITE);
        targetTextNamePaint.setTextSize(26f);
        targetTextNamePaint.setFakeBoldText(true);
        targetTextNamePaint.setTextAlign(Paint.Align.CENTER);

        targetTextPosPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        targetTextPosPaint.setColor(Color.parseColor("#FFD600"));
        targetTextPosPaint.setTextSize(20f);
        targetTextPosPaint.setTextAlign(Paint.Align.CENTER);
    }

    public void setFielderData(String name, FieldPosition position, boolean isLeftHand) {
        this.fielderName = (name != null && !name.trim().isEmpty()) ? name.trim() : "Fielder";
        this.recommendedPosition = position;
        this.isLeftHandBatsman = isLeftHand;
        invalidate();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        int width = getWidth();
        int height = getHeight();
        if (width <= 0 || height <= 0) return;

        float centerX = width / 2.0f;
        float centerY = height / 2.0f;

        // Ground radii
        float radiusX = (width - 40f) / 2.0f;
        float radiusY = (height - 40f) / 2.0f;

        boundaryRect.set(centerX - radiusX, centerY - radiusY, centerX + radiusX, centerY + radiusY);

        // 1. Draw Ground Base (Outer grass)
        canvas.drawOval(boundaryRect, grassDarkPaint);

        // Concentric decorative mowing lawn bands
        float bandX = radiusX * 0.78f;
        float bandY = radiusY * 0.78f;
        canvas.drawOval(centerX - bandX, centerY - bandY, centerX + bandX, centerY + bandY, grassLightPaint);

        // 2. Draw 30-Yard Circle
        float innerX = radiusX * 0.52f;
        float innerY = radiusY * 0.52f;
        innerCircleRect.set(centerX - innerX, centerY - innerY, centerX + innerX, centerY + innerY);
        canvas.drawOval(innerCircleRect, circle30YardPaint);

        // 3. Draw Boundary Rope
        canvas.drawOval(boundaryRect, boundaryRopePaint);

        // 4. Draw Central 22-Yard Cricket Pitch
        float pitchWidth = radiusX * 0.14f;
        float pitchHeight = radiusY * 0.46f;
        pitchRect.set(centerX - pitchWidth / 2, centerY - pitchHeight / 2,
                centerX + pitchWidth / 2, centerY + pitchHeight / 2);
        canvas.drawRoundRect(pitchRect, 4f, 4f, pitchPaint);

        // Crease Lines (Striker end top, Non-striker end bottom)
        float strikerCreaseY = centerY - pitchHeight * 0.35f;
        float bowlerCreaseY = centerY + pitchHeight * 0.35f;
        canvas.drawLine(pitchRect.left + 4, strikerCreaseY, pitchRect.right - 4, strikerCreaseY, creasePaint);
        canvas.drawLine(pitchRect.left + 4, bowlerCreaseY, pitchRect.right - 4, bowlerCreaseY, creasePaint);

        // Wickets / Stumps (Striker end & Bowler end)
        drawStumps(canvas, centerX, centerY - pitchHeight * 0.42f);
        drawStumps(canvas, centerX, centerY + pitchHeight * 0.42f);

        // Batsman & Bowler indicator text
        Paint labelPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        labelPaint.setColor(Color.parseColor("#D0FFFFFF"));
        labelPaint.setTextSize(18f);
        labelPaint.setTextAlign(Paint.Align.CENTER);
        canvas.drawText("BATSMAN 🏏", centerX, centerY - pitchHeight * 0.48f, labelPaint);
        canvas.drawText("BOWLER ⬆️", centerX, centerY + pitchHeight * 0.56f, labelPaint);

        // 5. Dynamic Off-Side and Leg-Side Watermarks
        String leftLabel = isLeftHandBatsman ? "LEG SIDE" : "OFF SIDE";
        String rightLabel = isLeftHandBatsman ? "OFF SIDE" : "LEG SIDE";
        canvas.drawText(leftLabel, centerX - radiusX * 0.65f, centerY, textSidePaint);
        canvas.drawText(rightLabel, centerX + radiusX * 0.65f, centerY, textSidePaint);

        // 6. Draw Standard Infield & Outfield Faint Dots (Contextual 11-player field)
        drawDefaultFielders(canvas, centerX, centerY, radiusX, radiusY);

        // 7. Draw the Highlighted Recommended Position & Fielder Pin
        if (recommendedPosition != null) {
            float targetX = centerX + (recommendedPosition.getXRatio() * radiusX * 0.85f);
            float targetY = centerY + (recommendedPosition.getYRatio() * radiusY * 0.85f);

            // Pulsing / Glowing Halo Rings
            canvas.drawCircle(targetX, targetY, 32f, targetHaloPaint);
            canvas.drawCircle(targetX, targetY, 22f, targetHaloPaint);

            // Center Pin Marker
            canvas.drawCircle(targetX, targetY, 13f, targetPinPaint);

            Paint pinCorePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            pinCorePaint.setColor(Color.BLACK);
            canvas.drawCircle(targetX, targetY, 5f, pinCorePaint);

            // Floating Name & Position Label Box above or below pin
            float boxWidth = Math.max(160f, Math.max(targetTextNamePaint.measureText(fielderName),
                    targetTextPosPaint.measureText(recommendedPosition.getPositionName())) + 24f);
            float boxHeight = 52f;

            float boxLeft = targetX - boxWidth / 2;
            float boxTop = (targetY > centerY) ? targetY - boxHeight - 20f : targetY + 20f;
            badgeRect.set(boxLeft, boxTop, boxLeft + boxWidth, boxTop + boxHeight);

            // Ensure badge stays inside canvas
            if (badgeRect.left < 10) badgeRect.offset(10 - badgeRect.left, 0);
            if (badgeRect.right > width - 10) badgeRect.offset(width - 10 - badgeRect.right, 0);

            canvas.drawRoundRect(badgeRect, 10f, 10f, targetBadgeBgPaint);

            // Badge border
            Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            strokePaint.setColor(Color.parseColor("#FFD600"));
            strokePaint.setStyle(Paint.Style.STROKE);
            strokePaint.setStrokeWidth(2f);
            canvas.drawRoundRect(badgeRect, 10f, 10f, strokePaint);

            canvas.drawText("👤 " + fielderName, badgeRect.centerX(), badgeRect.top + 24f, targetTextNamePaint);
            canvas.drawText(recommendedPosition.getPositionName(), badgeRect.centerX(), badgeRect.top + 44f, targetTextPosPaint);
        }
    }

    private void drawStumps(Canvas canvas, float cx, float cy) {
        float stumpSpacing = 4f;
        float stumpWidth = 2.5f;
        float stumpHeight = 6f;
        canvas.drawRect(cx - stumpSpacing - stumpWidth / 2, cy - stumpHeight / 2, cx - stumpSpacing + stumpWidth / 2, cy + stumpHeight / 2, stumpsPaint);
        canvas.drawRect(cx - stumpWidth / 2, cy - stumpHeight / 2, cx + stumpWidth / 2, cy + stumpHeight / 2, stumpsPaint);
        canvas.drawRect(cx + stumpSpacing - stumpWidth / 2, cy - stumpHeight / 2, cx + stumpSpacing + stumpWidth / 2, cy + stumpHeight / 2, stumpsPaint);
    }

    private void drawDefaultFielders(Canvas canvas, float cx, float cy, float rx, float ry) {
        // Standard fielding nodes in subtle dots
        float[][] positions = {
                {0.0f, -0.62f},   // Wicketkeeper
                {-0.22f, -0.52f}, // First Slip / Gully
                {-0.44f, -0.22f}, // Point
                {-0.38f, 0.12f},  // Cover
                {-0.18f, 0.42f},  // Mid-Off
                {0.18f, 0.42f},   // Mid-On
                {0.38f, 0.15f},   // Mid-Wicket
                {0.45f, -0.22f},  // Square Leg
                {0.32f, -0.65f},  // Fine Leg
                {-0.55f, -0.65f}, // Third Man
        };

        for (float[] p : positions) {
            float fx = cx + (p[0] * rx * 0.85f);
            float fy = cy + (p[1] * ry * 0.85f);
            canvas.drawCircle(fx, fy, 4f, otherFielderPaint);
        }
    }
}
