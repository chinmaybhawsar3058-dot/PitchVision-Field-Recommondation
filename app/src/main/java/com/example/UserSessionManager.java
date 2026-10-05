package com.example;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * UserSessionManager handles user registration, login credentials,
 * and current session state using Android SharedPreferences.
 * Pre-configured with demo coach credentials for seamless college project testing.
 */
public class UserSessionManager {

    private static final String PREF_NAME = "PitchVisionUserPrefs";
    private static final String KEY_IS_LOGGED_IN = "is_logged_in";
    private static final String KEY_CURRENT_NAME = "current_name";
    private static final String KEY_CURRENT_EMAIL = "current_email";

    private final SharedPreferences prefs;

    public UserSessionManager(Context context) {
        prefs = context.getApplicationContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        seedDefaultCoachAccount();
    }

    /**
     * Seeds a default coach account so teachers and students can test instantly without manual signup.
     */
    private void seedDefaultCoachAccount() {
        if (!prefs.contains("user_coach@pitchvision.com_pass")) {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("user_coach@pitchvision.com_name", "Coach Sharma");
            editor.putString("user_coach@pitchvision.com_pass", "cricket123");
            editor.apply();
        }
    }

    public boolean register(String name, String email, String password) {
        String cleanEmail = email.trim().toLowerCase();
        if (prefs.contains("user_" + cleanEmail + "_pass")) {
            return false; // User already exists
        }

        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("user_" + cleanEmail + "_name", name.trim());
        editor.putString("user_" + cleanEmail + "_pass", password);
        editor.apply();
        return true;
    }

    public boolean login(String email, String password) {
        String cleanEmail = email.trim().toLowerCase();
        String storedPass = prefs.getString("user_" + cleanEmail + "_pass", null);

        if (storedPass != null && storedPass.equals(password)) {
            String userName = prefs.getString("user_" + cleanEmail + "_name", "Coach");
            SharedPreferences.Editor editor = prefs.edit();
            editor.putBoolean(KEY_IS_LOGGED_IN, true);
            editor.putString(KEY_CURRENT_NAME, userName);
            editor.putString(KEY_CURRENT_EMAIL, cleanEmail);
            editor.apply();
            return true;
        }
        return false;
    }

    public boolean isLoggedIn() {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false);
    }

    public String getCurrentUserName() {
        return prefs.getString(KEY_CURRENT_NAME, "Coach");
    }

    public String getCurrentUserEmail() {
        return prefs.getString(KEY_CURRENT_EMAIL, "");
    }

    public void logout() {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean(KEY_IS_LOGGED_IN, false);
        editor.remove(KEY_CURRENT_NAME);
        editor.remove(KEY_CURRENT_EMAIL);
        editor.apply();
    }
}
