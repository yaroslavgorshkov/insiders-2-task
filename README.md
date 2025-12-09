# Meeting Room Booking App. Horshkov Yaroslav Insiders 2 Task

A web application for booking meeting rooms with role-based access control.

## Features

- User registration and login (Firebase Authentication)
- Persistent auth state with tokens
- Meeting rooms:
    - Create, edit, delete
    - Only room owner can edit room details
- Bookings:
    - Create, edit, delete
    - Conflict detection (no overlapping bookings)
- Roles:
    - **Owner** – full control, can promote users to admin
    - **Admin** – can manage bookings and users (except admins)
    - **User** – view-only access
- Firestore database for all data storage

---

## Tech Stack

- **Next.js (App Router)**
- **React + TypeScript**
- **Tailwind CSS**
- **Firebase Authentication**
- **Firebase Firestore**
- **Zustand** (auth store)
- **React Hook Form**

---

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Firebase

Create `lib/firebase.ts` and paste your Firebase config:

```ts
const firebaseConfig = {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...',
};
```

⚠ **Important:**  
Anyone who runs the project locally using your Firebase config will read/write data into _your_ Firebase project.  
If you share the code, you should create a **separate Firebase project** for testing or remove the config before sharing.

### 4. Enable Firebase services

In Firebase Console:

- Authentication → Enable **Email/Password**
- Firestore Database → Create database
- Create collections automatically by interacting with the app:
    - `users`
    - `rooms`
    - `members`
    - `bookings`

---

## Run the project

```bash
npm run dev
# or
yarn dev
```

App will run at:

```
http://localhost:3000
```

---
