# Dronacharya R&D Lab Management Portal (द्रोणाचार्य आर&डी लैब मैनेजमेंट)

An advanced web application tailored for college R&D and Hardware Innovation Labs. Built with **React 18, Tailwind CSS, Lucide Icons, and jsPDF**.

---

## 🚀 Live Access
The application server is actively running! You can open it right in your browser:
- **Local URL**: [http://localhost:5173/](http://localhost:5173/)
- **One-Click Windows Launcher**: Double-click [`run_app.bat`](file:///c:/Users/Rohit/Downloads/DRONACHARYA%20R%26D%20LAB%20MANAGMENT/run_app.bat)

---

## 🌟 Key Features & Requirements Implementation

### 1. Multi-Role Authentication & Personas
- **Group Leader**: Full project setup, team member management, component additions/replacements, lab attendance check-in/out, video showcase, and PDF generation.
- **Group Member**: Can add components, replace components, and check-in to lab.
- **Faculty Member & HOD**: Special administrative privileges to **Eliminate Groups** and **Eliminate Components** with documented justification.
- **Campus Student / Public**: Transparent read-only access to explore all projects, components, real-life problems, and attendance records.
- **Quick Persona Switcher**: Top-right menu allows instant 1-click role switching between HOD Dr. Sandeep, Faculty Prof. Verma, Group Leader Rohit, Group Leader Priya, and custom roll number logins.

### 2. Project Registration Wizard (कदम दर कदम रजिस्ट्रेशन)
Strictly implemented as requested:
1. **Leader Identification**: Full Name and **Compulsory Roll Number** (अनिवार्य).
2. **Project Title & Group Name**: Name of the innovation and team name.
3. **Real-Life Problem Statement**: What concrete real-life human/industrial problem is being solved.
4. **Real-Life Applications**: Specific industry deployment, societal impact, and practical use cases.
5. **Team Roster**: Dynamic team size (increase/decrease members). **Every member must provide their Roll Number**.
6. **Initial Components Requisition**: Hardware modules and sensors with protocol warning.

### 3. Strict Component Lifecycle & Audit Protocol
- **Students & Group Leaders CANNOT delete components!** Once registered, a component stays on the lab register.
- **Replace Component**: If a component burns or fails, students can replace it with an upgraded component, logging a clear reason.
- **Faculty / HOD Elimination**: Only Faculty or HOD have the authority to eliminate a component from a group.
- **Transparent Audit Trail**: Every action (ADDED, REPLACED, ELIMINATED) is stamped with author name, roll number/title, and timestamp, viewable by everyone in the college.

### 4. R&D Lab Entry & Exit Tracker (आने और जाने का समय)
- **Check-In to Lab**: Records date, live entry timestamp, active member checklist, and task activity plan.
- **Check-Out from Lab**: Records exit time, calculates hours spent, and logs work done/findings.
- **Active Prototyping Gate**: Attendance tracking is active until the project is officially marked complete or eliminated.
- **Live Lab Board**: Dedicated dashboard widget displaying which groups are currently inside the lab right now.

### 5. Final Completion, Video Showcase & PDF Summary Report
- **Project Completion**: Mark project as completed when hardware testing is finished.
- **Demo Video**: Upload or link a showcase video (YouTube / MP4) with an embedded player inside the app.
- **Professional PDF Summary Report**: One-click generation of high-grade official college report containing:
  - College letterhead and R&D lab seal
  - Project Title & Group Details
  - Real-Life Problem & Applications
  - Team roster with compulsory roll numbers
  - Bill of materials (active, replaced, eliminated)
  - Full lab attendance history and hours spent
  - Sign-off blocks for Group Leader, Faculty Guide, and HOD.

---

## 📂 Project Structure
- [`src/App.jsx`](file:///c:/Users/Rohit/Downloads/DRONACHARYA%20R%26D%20LAB%20MANAGMENT/src/App.jsx): Main dashboard with stats, search, filters, and cards
- [`src/components/CreateGroupWizard.jsx`](file:///c:/Users/Rohit/Downloads/DRONACHARYA%20R%26D%20LAB%20MANAGMENT/src/components/CreateGroupWizard.jsx): Step-by-step registration wizard
- [`src/components/GroupDetailModal.jsx`](file:///c:/Users/Rohit/Downloads/DRONACHARYA%20R%26D%20LAB%20MANAGMENT/src/components/GroupDetailModal.jsx): Comprehensive hub for components, attendance, editing, and video
- [`src/components/LabAttendanceBoard.jsx`](file:///c:/Users/Rohit/Downloads/DRONACHARYA%20R%26D%20LAB%20MANAGMENT/src/components/LabAttendanceBoard.jsx): Real-time monitor of active lab sessions
- [`src/components/Navbar.jsx`](file:///c:/Users/Rohit/Downloads/DRONACHARYA%20R%26D%20LAB%20MANAGMENT/src/components/Navbar.jsx): Navigation with quick persona switcher and search
- [`src/services/pdfGenerator.js`](file:///c:/Users/Rohit/Downloads/DRONACHARYA%20R%26D%20LAB%20MANAGMENT/src/services/pdfGenerator.js): jsPDF automated summary report generator
- [`src/services/storage.js`](file:///c:/Users/Rohit/Downloads/DRONACHARYA%20R%26D%20LAB%20MANAGMENT/src/services/storage.js): LocalStorage persistence with full mock dataset
- [`server.js`](file:///c:/Users/Rohit/Downloads/DRONACHARYA%20R%26D%20LAB%20MANAGMENT/server.js): Built-in zero-dependency production HTTP server
- [`run_app.bat`](file:///c:/Users/Rohit/Downloads/DRONACHARYA%20R%26D%20LAB%20MANAGMENT/run_app.bat): Double-click Windows launcher
