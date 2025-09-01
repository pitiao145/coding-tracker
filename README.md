# 30-Day Coding Challenge Tracker

A minimal web app to track daily progress during a 30-day coding challenge. Built with Next.js, Firebase, and Tailwind CSS.

## Features

- 🔐 Firebase Authentication (email/password)
- 📊 Dashboard with progress tracking and metrics
- 📝 Daily entry logging with languages, tools, and learnings
- 🎉 Celebration animations on successful submissions
- 📱 Responsive design with indie hacker aesthetic
- 🔄 Edit today's entry or view previous entries

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Animations**: Framer Motion + canvas-confetti
- **Date handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase project (you'll need to create this)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Get your Firebase config from Project Settings

4. Create a `.env.local` file with your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. Set up Firestore security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isSignedIn() { return request.auth != null; }
       function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }

       match /users/{uid} {
         allow read, write: if isOwner(uid);
       }

       match /entries/{entryId} {
         allow read, update, delete: if isSignedIn() && resource.data.uid == request.auth.uid;
         allow create: if isSignedIn() && request.resource.data.uid == request.auth.uid &&
                       request.resource.data.date is string &&
                       request.resource.data.minutes is number && request.resource.data.minutes >= 0;
       }
     }
   }
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Sign up/Login**: Create an account or sign in with email/password
2. **Dashboard**: View your progress, streak, and recent entries
3. **Log Today**: Click "Log Today" to record your daily coding session
4. **Track Progress**: Monitor your 30-day challenge progress with visual metrics

## Data Model

### Users Collection
```javascript
{
  displayName: string,
  email: string,
  createdAt: timestamp,
  timezone: string,
  goalDays: number (default: 30)
}
```

### Entries Collection
```javascript
{
  uid: string,
  date: string (YYYY-MM-DD),
  minutes: number,
  workedOn: string,
  languages: string[],
  tools: string[],
  learned: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your Firebase environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js. Just make sure to:
- Set all Firebase environment variables
- Configure your Firebase project for production

## Contributing

This is a personal project, but feel free to fork and modify for your own use!

## License

MIT License - feel free to use this code for your own projects.
