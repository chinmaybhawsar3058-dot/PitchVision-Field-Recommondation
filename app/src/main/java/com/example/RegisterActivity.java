package com.example;

import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

/**
 * RegisterActivity facilitates new coach/user registration with validation
 * and persistent storage using SharedPreferences.
 */
public class RegisterActivity extends AppCompatActivity {

    private EditText etName;
    private EditText etEmail;
    private EditText etPassword;
    private EditText etConfirmPassword;
    private Button btnRegisterSubmit;
    private Button btnBackToLogin;
    private ImageView btnBack;
    private UserSessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        sessionManager = new UserSessionManager(this);

        initializeViews();
        setupListeners();
    }

    private void initializeViews() {
        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etRegisterEmail);
        etPassword = findViewById(R.id.etRegisterPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        btnRegisterSubmit = findViewById(R.id.btnRegisterSubmit);
        btnBackToLogin = findViewById(R.id.btnBackToLogin);
        btnBack = findViewById(R.id.btnBack);
    }

    private void setupListeners() {
        btnRegisterSubmit.setOnClickListener(v -> performRegistration());
        btnBackToLogin.setOnClickListener(v -> finish());
        btnBack.setOnClickListener(v -> finish());
    }

    private void performRegistration() {
        String name = etName.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();

        if (TextUtils.isEmpty(name)) {
            etName.setError("Please enter your name");
            etName.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(email) || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            etEmail.setError("Please enter a valid email address");
            etEmail.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(password) || password.length() < 6) {
            etPassword.setError("Password must be at least 6 characters");
            etPassword.requestFocus();
            return;
        }

        if (!password.equals(confirmPassword)) {
            etConfirmPassword.setError("Passwords do not match");
            etConfirmPassword.requestFocus();
            return;
        }

        boolean registered = sessionManager.register(name, email, password);
        if (registered) {
            Toast.makeText(this, "Registration successful! Please sign in.", Toast.LENGTH_SHORT).show();
            finish();
        } else {
            Toast.makeText(this, "An account with this email already exists.", Toast.LENGTH_LONG).show();
        }
    }
}
