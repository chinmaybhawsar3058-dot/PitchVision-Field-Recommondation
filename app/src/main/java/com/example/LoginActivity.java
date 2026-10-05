package com.example;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

/**
 * LoginActivity provides user authentication for PitchVision.
 * Features validation, session persistence, and instant demo account population.
 */
public class LoginActivity extends AppCompatActivity {

    private EditText etEmail;
    private EditText etPassword;
    private Button btnLogin;
    private Button btnRegister;
    private Button btnQuickDemo;
    private UserSessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        sessionManager = new UserSessionManager(this);

        // Auto-navigate to Home if already logged in
        if (sessionManager.isLoggedIn()) {
            startActivity(new Intent(LoginActivity.this, HomeActivity.class));
            finish();
            return;
        }

        initializeViews();
        setupListeners();
    }

    private void initializeViews() {
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        btnRegister = findViewById(R.id.btnRegister);
        btnQuickDemo = findViewById(R.id.btnQuickDemo);
    }

    private void setupListeners() {
        btnLogin.setOnClickListener(v -> performLogin());

        btnRegister.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            startActivity(intent);
        });

        btnQuickDemo.setOnClickListener(v -> {
            etEmail.setText("coach@pitchvision.com");
            etPassword.setText("cricket123");
            Toast.makeText(LoginActivity.this, "Demo credentials filled!", Toast.LENGTH_SHORT).show();
        });
    }

    private void performLogin() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (TextUtils.isEmpty(email)) {
            etEmail.setError("Please enter your email");
            etEmail.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(password)) {
            etPassword.setError("Please enter your password");
            etPassword.requestFocus();
            return;
        }

        boolean success = sessionManager.login(email, password);
        if (success) {
            Toast.makeText(this, "Welcome " + sessionManager.getCurrentUserName() + "!", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(LoginActivity.this, HomeActivity.class);
            startActivity(intent);
            finish();
        } else {
            Toast.makeText(this, "Invalid email or password. Use demo account or register.", Toast.LENGTH_LONG).show();
        }
    }
}
