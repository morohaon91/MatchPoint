# MatchPoint - Sports Team Organizer

MatchPoint is a web application that helps friends organize recreational sports activities. It solves the common problem of coordinating pickup games, managing teams, and keeping track of who's playing when.

## Features

### Group Management
- Create private sports groups for different activities (basketball, soccer, tennis, etc.)
- Invite friends using shareable links or codes
- Manage members and assign organizer roles
- Choose whether groups are private or discoverable by others

### Game Scheduling
- Schedule one-time games with date, time, and location
- Set up recurring games (weekly Monday night basketball, etc.)
- Define player limits and manage waitlists automatically
- Allow members to sign up or mark absences in advance

### Team Organization
- Track who's coming to each game
- Divide players into balanced teams
- Record game results and basic statistics
- Communicate through game-specific chats

### Smart Registration
- Automatic waitlist promotion when spots open up
- Priority registration for regular players in recurring games
- Easy RSVP and reminder system
- Option to bring occasional guests to open games

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Firebase (Authentication, Firestore, Storage, Functions)
- **Deployment**: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase CLI
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/matchpoint.git
   cd matchpoint
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your Firebase configuration:
   ```
   # Firebase Client side required props
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"

   # Firebase Server side required props (Firebase Admin)
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n"

   # Config
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

4. Initialize Firebase:
   ```bash
   firebase login
   firebase init
   ```
   Select the following Firebase services:
   - Firestore
   - Functions
   - Hosting
   - Storage

### Running Locally

1. Start the Firebase emulators:
   ```bash
   firebase emulators:start
   ```

2. In a separate terminal, start the Next.js development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Deployment

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

## Project Structure

```
Project Structure
matchpoint/
├── .github/                       # GitHub workflows
├── .husky/                        # Git hooks
├── functions/                     # Firebase Cloud Functions
│   ├── src/                       # Functions source code
│   └── package.json               # Functions dependencies
├── public/                        # Static assets
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── admin/                 # Admin pages
│   │   ├── api/                   # API routes
│   │   │   ├── auth/              # Auth API endpoints
│   │   │   ├── groups/            # Group management API
│   │   │   └── games/             # Game management API
│   │   ├── app/                   # Main app pages
│   │   │   ├── dashboard/         # Dashboard page
│   │   │   ├── groups/            # Group pages
│   │   │   └── games/             # Game pages
│   │   ├── login/                 # Login page
│   │   ├── password-reset/        # Password reset page
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Home page
│   ├── components/                # React components
│   │   ├── admin/                 # Admin components
│   │   ├── auth/                  # Authentication components
│   │   ├── games/                 # Game-related components
│   │   ├── groups/                # Group-related components
│   │   ├── nav/                   # Navigation components
│   │   ├── sections/              # Page section components
│   │   └── shared/                # Shared UI components
│   ├── lib/                       # Utility libraries
│   │   ├── auth/                  # Auth utilities
│   │   ├── context/               # React contexts
│   │   ├── firebase/              # Firebase configuration
│   │   ├── games/                 # Game helpers
│   │   └── groups/                # Group helpers
│   ├── posts/                     # Blog posts (if used)
│   └── test/                      # Test files
├── firebase/                      # Firebase configuration files
│   ├── firestore.rules            # Firestore security rules
│   ├── firestore.indexes.json     # Firestore indexes
│   └── storage.rules              # Storage security rules
├── .env.local                     # Environment variables (not in repo)
├── .eslintrc.json                 # ESLint configuration
├── .firebaserc                    # Firebase project configuration
├── firebase.json                  # Firebase configuration
├── next.config.mjs                # Next.js configuration
├── package.json                   # Project dependencies
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.ts             # Tailwind CSS configuration
└── tsconfig.json                  # TypeScript configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Firebase](https://firebase.google.com/)
- Based on the [Fire-SaaS](https://github.com/coffeebeantech/fire-saas) template
- UI components styled with [TailwindCSS](https://tailwindcss.com/)