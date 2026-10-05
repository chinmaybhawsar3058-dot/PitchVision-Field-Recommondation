package com.example;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

/**
 * HomeActivity allows the coach/user to enter fielder attributes,
 * bowler delivery classification, and batsman profile to calculate
 * the optimal cricket field position.
 */
public class HomeActivity extends AppCompatActivity {

    public static final String EXTRA_FIELDER_NAME = "extra_fielder_name";
    public static final String EXTRA_FIELDER_ABILITY = "extra_fielder_ability";
    public static final String EXTRA_BOWLER_TYPE = "extra_bowler_type";
    public static final String EXTRA_BATSMAN_HAND = "extra_batsman_hand";
    public static final String EXTRA_BATSMAN_STYLE = "extra_batsman_style";

    private EditText etFielderName;
    private Spinner spFielderAbility;
    private Spinner spBowlerType;
    private Spinner spBatsmanHand;
    private Spinner spBatsmanStyle;
    private Button btnRecommendPosition;
    private Button btnReset;
    private ImageView btnLogout;
    private TextView tvWelcomeUser;

    // Quick Preset Chips
    private TextView chipKohli;
    private TextView chipJadeja;
    private TextView chipStokes;
    private TextView chipSmith;

    private UserSessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        sessionManager = new UserSessionManager(this);

        initializeViews();
        setupUserHeader();
        setupQuickPresetChips();
        setupListeners();
    }

    private void initializeViews() {
        etFielderName = findViewById(R.id.etFielderName);
        spFielderAbility = findViewById(R.id.spFielderAbility);
        spBowlerType = findViewById(R.id.spBowlerType);
        spBatsmanHand = findViewById(R.id.spBatsmanHand);
        spBatsmanStyle = findViewById(R.id.spBatsmanStyle);
        btnRecommendPosition = findViewById(R.id.btnRecommendPosition);
        btnReset = findViewById(R.id.btnReset);
        btnLogout = findViewById(R.id.btnLogout);
        tvWelcomeUser = findViewById(R.id.tvWelcomeUser);

        chipKohli = findViewById(R.id.chipKohli);
        chipJadeja = findViewById(R.id.chipJadeja);
        chipStokes = findViewById(R.id.chipStokes);
        chipSmith = findViewById(R.id.chipSmith);
    }

    private void setupUserHeader() {
        String userName = sessionManager.getCurrentUserName();
        tvWelcomeUser.setText("Welcome, " + userName);
    }

    private void setupQuickPresetChips() {
        // Quick presets allow rapid testing during evaluation/viva demonstrations
        chipKohli.setOnClickListener(v -> {
            etFielderName.setText("Virat Kohli");
            spFielderAbility.setSelection(0); // Fast Runner
            spBowlerType.setSelection(0);     // Fast Bowler
            spBatsmanHand.setSelection(0);    // Right Hand
            spBatsmanStyle.setSelection(0);   // Aggressive
            Toast.makeText(this, "Preset: V. Kohli (Fast Runner)", Toast.LENGTH_SHORT).show();
        });

        chipJadeja.setOnClickListener(v -> {
            etFielderName.setText("Ravindra Jadeja");
            spFielderAbility.setSelection(3); // Good Thrower
            spBowlerType.setSelection(2);     // Spinner
            spBatsmanHand.setSelection(0);    // Right Hand
            spBatsmanStyle.setSelection(0);   // Aggressive
            Toast.makeText(this, "Preset: R. Jadeja (Good Thrower)", Toast.LENGTH_SHORT).show();
        });

        chipStokes.setOnClickListener(v -> {
            etFielderName.setText("Ben Stokes");
            spFielderAbility.setSelection(4); // All Round Fielder
            spBowlerType.setSelection(0);     // Fast Bowler
            spBatsmanHand.setSelection(1);    // Left Hand
            spBatsmanStyle.setSelection(0);   // Aggressive
            Toast.makeText(this, "Preset: B. Stokes (All Round)", Toast.LENGTH_SHORT).show();
        });

        chipSmith.setOnClickListener(v -> {
            etFielderName.setText("Steve Smith");
            spFielderAbility.setSelection(1); // Good Catcher
            spBowlerType.setSelection(0);     // Fast Bowler
            spBatsmanHand.setSelection(0);    // Right Hand
            spBatsmanStyle.setSelection(1);   // Defensive
            Toast.makeText(this, "Preset: S. Smith (Good Catcher)", Toast.LENGTH_SHORT).show();
        });
    }

    private void setupListeners() {
        btnRecommendPosition.setOnClickListener(v -> onRecommendClicked());

        btnReset.setOnClickListener(v -> {
            etFielderName.setText("");
            spFielderAbility.setSelection(0);
            spBowlerType.setSelection(0);
            spBatsmanHand.setSelection(0);
            spBatsmanStyle.setSelection(0);
            Toast.makeText(this, "Fields cleared", Toast.LENGTH_SHORT).show();
        });

        btnLogout.setOnClickListener(v -> {
            sessionManager.logout();
            Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(HomeActivity.this, LoginActivity.class);
            startActivity(intent);
            finish();
        });
    }

    private void onRecommendClicked() {
        String fielderName = etFielderName.getText().toString().trim();

        if (TextUtils.isEmpty(fielderName)) {
            etFielderName.setError("Please enter the fielder's name");
            etFielderName.requestFocus();
            Toast.makeText(this, "Fielder name is required", Toast.LENGTH_SHORT).show();
            return;
        }

        String ability = spFielderAbility.getSelectedItem().toString();
        String bowler = spBowlerType.getSelectedItem().toString();
        String hand = spBatsmanHand.getSelectedItem().toString();
        String style = spBatsmanStyle.getSelectedItem().toString();

        Intent intent = new Intent(HomeActivity.this, FieldActivity.class);
        intent.putExtra(EXTRA_FIELDER_NAME, fielderName);
        intent.putExtra(EXTRA_FIELDER_ABILITY, ability);
        intent.putExtra(EXTRA_BOWLER_TYPE, bowler);
        intent.putExtra(EXTRA_BATSMAN_HAND, hand);
        intent.putExtra(EXTRA_BATSMAN_STYLE, style);
        startActivity(intent);
    }
}
