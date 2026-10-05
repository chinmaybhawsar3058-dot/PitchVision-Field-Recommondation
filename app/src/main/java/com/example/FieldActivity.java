package com.example;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

/**
 * FieldActivity displays the 2D visual cricket ground with the recommended
 * fielding position pinned directly on the grass, alongside tactical analysis
 * and position breakdown.
 */
public class FieldActivity extends AppCompatActivity {

    private CricketFieldView cricketFieldView;
    private TextView tvRecommendedPosition;
    private TextView tvZoneBadge;
    private TextView tvSideBadge;
    private TextView tvSummaryFielder;
    private TextView tvSummaryAbility;
    private TextView tvSummaryBowler;
    private TextView tvSummaryBatsman;
    private TextView tvTacticalReasoning;
    private TextView tvGroundMatchInfo;
    private TextView tvHeaderSubtitle;
    private Button btnTryAnother;
    private ImageView btnBackFromField;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_field);

        initializeViews();
        loadDataAndRender();
        setupListeners();
    }

    private void initializeViews() {
        cricketFieldView = findViewById(R.id.cricketFieldView);
        tvRecommendedPosition = findViewById(R.id.tvRecommendedPosition);
        tvZoneBadge = findViewById(R.id.tvZoneBadge);
        tvSideBadge = findViewById(R.id.tvSideBadge);
        tvSummaryFielder = findViewById(R.id.tvSummaryFielder);
        tvSummaryAbility = findViewById(R.id.tvSummaryAbility);
        tvSummaryBowler = findViewById(R.id.tvSummaryBowler);
        tvSummaryBatsman = findViewById(R.id.tvSummaryBatsman);
        tvTacticalReasoning = findViewById(R.id.tvTacticalReasoning);
        tvGroundMatchInfo = findViewById(R.id.tvGroundMatchInfo);
        tvHeaderSubtitle = findViewById(R.id.tvHeaderSubtitle);
        btnTryAnother = findViewById(R.id.btnTryAnother);
        btnBackFromField = findViewById(R.id.btnBackFromField);
    }

    private void loadDataAndRender() {
        Intent intent = getIntent();
        String fielderName = intent.getStringExtra(HomeActivity.EXTRA_FIELDER_NAME);
        String ability = intent.getStringExtra(HomeActivity.EXTRA_FIELDER_ABILITY);
        String bowler = intent.getStringExtra(HomeActivity.EXTRA_BOWLER_TYPE);
        String hand = intent.getStringExtra(HomeActivity.EXTRA_BATSMAN_HAND);
        String style = intent.getStringExtra(HomeActivity.EXTRA_BATSMAN_STYLE);

        if (fielderName == null || fielderName.trim().isEmpty()) {
            fielderName = "Fielder";
        }
        if (ability == null) ability = "All Round Fielder";
        if (bowler == null) bowler = "Fast Bowler";
        if (hand == null) hand = "Right Hand";
        if (style == null) style = "Aggressive";

        // Calculate recommendation using tactical PositionEngine
        FieldPosition recommendation = PositionEngine.recommendPosition(fielderName, ability, bowler, hand, style);

        boolean isLeftHand = "Left Hand".equalsIgnoreCase(hand);

        // Update Ground Canvas View
        cricketFieldView.setFielderData(fielderName, recommendation, isLeftHand);

        // Update Information UI Cards
        tvRecommendedPosition.setText(recommendation.getPositionName());
        tvZoneBadge.setText(recommendation.getZone());
        tvSideBadge.setText(recommendation.getSide());

        tvSummaryFielder.setText(fielderName);
        tvSummaryAbility.setText(ability);
        tvSummaryBowler.setText(bowler);
        tvSummaryBatsman.setText(hand + " (" + style + ")");

        tvTacticalReasoning.setText(recommendation.getTacticalReason());
        tvGroundMatchInfo.setText(hand + " Batsman • " + bowler);
        tvHeaderSubtitle.setText(fielderName + " assigned to " + recommendation.getPositionName());
    }

    private void setupListeners() {
        btnBackFromField.setOnClickListener(v -> finish());
        btnTryAnother.setOnClickListener(v -> finish());
    }
}
