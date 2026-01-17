import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'; 
import PrivateRoute from './authentication/PrivateRoute'; // O Guardião

import MainLayout from "./layouts/MainLayout";
import LoginPage from "./authentication/login";
import ForgotPassword from "./authentication/ForgotPassword";
import ResetPassword from "./authentication/ResetPassword";

import HomePage from "./pages/Inicio/HomePage";
import AlunosPage from "./pages/Alunos/AlunosPage";
import PlanosPage from "./pages/Planos/PlanosPage";
import FinanceiroPage from "./pages/Financeiro/FinanceiroPage";
import PatrimonioPage from "./pages/Patrimonio/PatrimonioPage";
import RelatoriosPage from "./pages/Relatorios/RelatoriosPage";
import ConfigPage from "./pages/Configuracoes/ConfigPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/esqueci-senha",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password", 
    element: <ResetPassword />, 
  },

  {
    element: <PrivateRoute />, 
    children: [
      {
        path: "/",
        element: <MainLayout />, 
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "alunos",
            element: <AlunosPage />,
          },
          {
            path: "planos",
            element: <PlanosPage />,
          },
          {
            path: "financeiro",
            element: <FinanceiroPage />,
          },
          {
            path: "patrimonio",
            element: <PatrimonioPage />,
          },
          {
            path: "relatorios",
            element: <RelatoriosPage />,
          },
          {
            path: "configuracoes",
            element: <ConfigPage />,
          },
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);