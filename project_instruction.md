You are an expert full-stack developer and UI/UX designer. I want you to build a fully functional mobile application called "[Gym Tracker]". 

### 1. Vision & Target User
- App Type: Mobile gym app
- Target Audience: Personal use
- Core Objective: The main outcome users need to achieve is cCreate workouts, log completed workouts, and view completed workouts and PRs by exercise. 

### 2. User Roles & Permissions
- In this project we'll not work with roles or permissions

### 3. Key Features & Screens
Please generate an application with the following distinct views/screens:
- Dashboard / Home: Page consolidating progress on completed training sessions for the week, the suggested workout for the day, and monthly statistics.
- Workouts: Page for creating, editing, viewing, and deleting workouts.
- History: Report of training sessions performed by date, and report of PRs

### 4. Data Model (Entities & Relationships)
Use the Google Drive API (or Google Sheets API) to read/write a JSON file or spreadsheet with your workout data.

### 5. Design, Vibe, & UI Constraints
- Aesthetic: Let's incorporate gamification; we can use Duolingo as a product reference, and we'll focus on a minimalist approach.
- Color Palette: Some colors that you can look (#9618D1, #9618D1, #5A376B, #332838, #312D33)
- Frameworks: Build this using modern frontend components (like Tailwind CSS and Shadcn UI).

### 6. Guardrails & Edge Cases
- State Handling: If a list or dashboard is empty, display a clean "Empty State" component with an actionable call-to-action button to add the first item.
- Interactions: Standardize error/success alerts via toast notifications when a user creates, edits, or deletes an item.

### 7. Stack
- React Native + Expo — Use Expo to simplifie builds, OTA updates, and because has good libraries for auth/storage out of the box. Use Expo Router for navigation.
- TypeScript — For modeling Projects/Tasks-style relational data in JSON.

### 8. Deliverables

Divide the project among three roles: the Product Owner (PO) is responsible for product and system design—this phase must be executed first and submitted for approval. Once the design is approved, the task moves to the developer, who handles implementation based on the requirements gathered by the PO and the proposed design. Finally, the QA specialist tests the system to confirm functionality and verify that the design was faithfully implemented.

PO: Project documentation covering business rules and design; initiate the CLAUDE.md file with the PO-related section.

DEV: Responsible for executing the project plan, developing all features, and updating the CLAUDE.md file.

QA: Evaluate the system to verify compliance with all rules defined by the PO; if any rule is not met, create a task for the DEV to fix it.
