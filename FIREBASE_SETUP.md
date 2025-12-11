# Firebase Setup Instructions

To enable authentication in your Habit Quest RPG app, you need to set up Firebase:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## 2. Enable Email/Password Authentication

1. In your Firebase project, go to **Authentication** from the left sidebar
2. Click on the **Sign-in method** tab
3. Enable **Email/Password** provider
4. Click **Save**

## 3. Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Habit Quest RPG")
5. Copy the `firebaseConfig` object

## 4. Update firebase.js

Open `src/firebase.js` and replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
}
```

## 5. Test Your App

1. Run `npm run dev`
2. You should see the login/signup screen
3. Create a new account to test
4. After login, you'll see your character dashboard

## Security Notes

- **Never commit your Firebase config to public repositories** if it contains sensitive keys
- For production, set up Firebase Security Rules
- Consider using environment variables for sensitive configuration

## Optional: Firestore Database (for cloud sync)

If you want to sync data across devices:

1. Enable **Firestore Database** in Firebase Console
2. Set up security rules to allow authenticated users to read/write their own data
3. Update the app to save habits and character data to Firestore instead of localStorage

## Troubleshooting

- **"Firebase not configured"**: Make sure you've updated `src/firebase.js` with your config
- **Authentication errors**: Check that Email/Password is enabled in Firebase Console
- **CORS errors**: Make sure your domain is authorized in Firebase Console > Authentication > Settings > Authorized domains
