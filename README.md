# FakeBaiduServer - Backend

The backend API server for the FakeBaidu web platform, providing RESTful services.

## Features
- **User Management**: Authentication and authorization using JWT.
- **Assignment Handling**: File uploads and storage with Multer.
- **Data Storage**: SQLite database for lightweight data management.
- **Input Validation**: Zod for schema validation.
- **Real-time Features**: Support for chat and announcements.

## Tech Stack
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite
- **Authentication**: JWT
- **File Uploads**: Multer
- **Validation**: Zod
- **Dependencies**: cors, body-parser, dayjs, uuid

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/lingyunmo/fakebaiduserver.git

2. Navigate to the project directory:
   ```bash
   cd fakebaiduserver

3. Install dependencies:
   ```bash
   npm install

4. Start the server:
   ```bash
   npm start

## Part of API Endpoints
### GET /api/assignments
- Retrieve available assignment types and their submission statuses.
- Response: { assignments: [{ assignment_name: string, submit_status: number }] }
- Example: { "assignments": [{ "assignment_name": "Homework 1", "submit_status": 1 }] }
### POST /api/assignments/toggle
- Update the submission status of an assignment.
- Request: { "assignmentName": string, "submitStatus": number }
- Response: { "message": "Status updated successfully" }
- Example: { "assignmentName": "Homework 1", "submitStatus": 1 }
### GET /api/assignments/status
- Fetch user assignment submission statuses.
- Response: { users: [{ name: string, assignment1: boolean, assignment2: boolean, ..., assignment5: boolean }] }
- Example: { "users": [{ "name": "lingyunmo", "assignment1": true, "assignment2": false, ... }] }
### POST /api/project/upload
- Upload project files and update submission status.
- Request: Form-data with name: string, project: "项目1" | "项目2", files: File[]
- Response: "File upload successful"
- Example: name: "lingyunmo", project: "项目1", files: [file1.zip]
### GET /api/project/all
- Retrieve all users’ project submission statuses.
- Response: { projects: [{ name: string, project1: boolean, project2: boolean }] }
- Example: { "projects": [{ "name": "lingyunmo", "project1": true, "project2": false }] }
### POST /api/project/check-project
- Check a user’s project submission status.
- Request: { "username": string }
- Response: { "projectStatus": [boolean, boolean] }
- Example: { "username": "lingyunmo" } → { "projectStatus": [true, false] }
### GET /api/greet
- Simple greeting endpoint for testing.
- Response: { "message": "Hello from Node.js server! (By TypeScript)" }

More API endpoints can be found in **routes/xxxRoutes.ts**.They are at the Notes section clearly.

## Database Setup
data/database using SQLite for lightweight data management.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
All Rights Reserved.