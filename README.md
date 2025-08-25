# Onam Photo Hub 📸

<p align="center">
  <img src="public/pookalam-detailed.svg" alt="Onam Photo Hub Logo" width="150">
</p>

<h3 align="center">A vibrant, real-time community photo gallery for celebrating the Onam festival at the College of Engineering, Kottarakkara.</h3>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18.3.1-blue?logo=react">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-green?logo=supabase">
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind_CSS-3.4.11-38B2AC?logo=tailwind-css">
</p>

---

Onam Photo Hub is a lightweight, cultural hub where students can instantly capture and share their festival moments. The goal is to create a real-time gallery of celebration moments, from intricate Pookalams and traditional attire to energetic performances and delicious Sadhyas.

*Note: This application is exclusively for students with a `@cekottarakkara.ac.in` email address.*

## ✨ Features

- **Secure Authentication**: Sign-up and login restricted to the college's official email domain.
- **Community Gallery**: An infinitely scrolling gallery showcasing all shared photos.
- **Filtering & Sorting**: Easily filter photos by category (Pookalam, Attire, etc.) and sort by "Most Recent" or "Most Liked".
- **Photo Uploads**: Seamlessly upload multiple photos with captions, categories, and an option to allow downloads.
- **Interactive Engagement**: Like and unlike photos to show appreciation.
- **User Profiles**: View personal galleries, edit your profile (name, bio, avatar), and see what others have shared.
- **Admin Controls**: Designated admin users have the ability to moderate and delete any photo.
- **Responsive Design**: A beautiful and intuitive experience on both mobile and desktop devices.
- **Optimized Performance**: Fast image loading and smooth navigation powered by Cloudinary and virtualized scrolling.

## 🛠️ Tech Stack

| Category          | Technology                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| **Frontend**      | [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **Styling**       | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)                           |
| **State Mgmt**    | [TanStack Query](https://tanstack.com/query/latest), [Zustand](https://zustand-demo.pmnd.rs/)             |
| **Routing**       | [React Router](https://reactrouter.com/)                                                               |
| **Backend**       | [Supabase](https://supabase.io/) (Auth, Database, Edge Functions)                                        |
| **Image Hosting** | [Cloudinary](https://cloudinary.com/)                                                                  |

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/onam-photo-hub.git
    cd onam-photo-hub
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Set up environment variables:**
    -   Create a `.env` file in the root of the project by copying the example file:
        ```sh
        cp .env.example .env
        ```
    -   You will need to create a Supabase project and a Cloudinary account to get the necessary API keys and secrets.
    -   Fill in the `.env` file with your credentials.

4.  **Set up the Supabase backend:**
    -   In your Supabase project's SQL Editor, run the SQL commands found in the project's `supabase/` directory to set up the necessary tables, policies, and functions.

5.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application should now be running on `http://localhost:8080`.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## ❤️ Acknowledgements

Crafted with passion by **Acedreamer**.

-   GitHub: [@acedreamer](https://github.com/acedreamer)