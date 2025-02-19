import * as React from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layouts/MainLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../components/login";
import RegistrationForm from "../components/registration";
import ErrorPage from "../pages/ErrorPage";
import Dashboard from "../pages/Dashboard";
import PrivateRoute from "./PrivateRoute";


const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/dashboard",
                element: (
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                ),
            },
            {
                path: "/login",
                element: <LoginPage />,
            },
            {
                path: "/register",
                element: <RegistrationForm />,
            },
        ],
    },
    {
        path: "*",
        element: <ErrorPage />,
    },
]);

export default router;