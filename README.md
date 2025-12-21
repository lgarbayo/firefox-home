# firefox-home 🦊✨

Custom **Firefox Homepage / New Tab** built with **Angular**, designed to be used as the frontend of a **Firefox WebExtension**.

<img width="2560" height="1440" alt="imagen" src="https://github.com/user-attachments/assets/f15f0d40-02f9-489e-a0d0-8fe8bd9c8c45" />

This repository contains the **complete Angular source code** of the application rendered as the Firefox New Tab.  
The project is open source and intentionally documented so developers can easily navigate and understand the codebase.

---

## 🎯 Project Goals

- Replace Firefox’s **New Tab** with a custom homepage
- Use **Angular** as the main frontend framework
- Provide a clear and explicit structure for contributors
- Serve as an educational and experimental project

---

## 🧱 Project Structure

The following tree represents the **actual structure of the repository**, included so developers know exactly where to navigate:

.
├── app
│   ├── app.config.server.ts     # Angular server-side configuration
│   ├── app.config.ts            # Global application configuration
│   ├── app.css                  # Root component styles
│   ├── app.html                 # Root component template
│   ├── app.routes.server.ts     # Server-side routing
│   ├── app.spec.ts              # Root component tests
│   ├── app.ts                   # Root Angular component
│   └── page
│       └── home_page             # Main page (Firefox New Tab)
│           ├── home_page.css
│           ├── home_page.html
│           └── home_page.ts
├── index.html                    # Base HTML document
├── main.server.ts                # Angular SSR entry point
├── main.ts                       # Angular client bootstrap
├── server.ts                     # Node.js server (SSR support)
└── styles.css                    # Global styles

---

## 🧭 Code Navigation Guide

- **app/**  
  Core Angular application logic.

- **app/page/home_page/**  
  Main page rendered as the Firefox homepage / new tab.  
  Most UI and functional changes will happen here.

- **main.ts**  
  Client-side Angular bootstrap.

- **main.server.ts & server.ts**  
  Server-side rendering (SSR) support.

- **index.html**  
  Base HTML container used by Angular.

---

## 🛠️ Technologies Used

- Angular (standalone + SSR)
- TypeScript
- HTML5 / CSS3
- Node.js
- Firefox WebExtensions API

---

## 🚀 Development & Setup

Install dependencies:

npm install

Build the project to generate `dist/` folder:

npm run build

Run the project in development mode:

npm run start

This starts the Angular development environment for local testing.

---

## 📦 Usage as Firefox New Tab

This application is intended to be **built and used as the content of a Firefox extension**.

Typical workflow:

1. Build the Angular application
2. Use the generated `dist/` output as the New Tab content
3. Load the extension manually via `about:debugging` in Firefox

(The WebExtension wrapper can live in a separate folder or repository.)

---

## 🧠 Project Philosophy

- Explicit structure over hidden conventions
- Learn Firefox customization by doing
- Code meant to be read, explored, and extended
- Open source as a learning tool

---

## 📄 License

This project is licensed under the **MIT License**.  
See the [LICENSE.md](./LICENSE.md) file for details.
