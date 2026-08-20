import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: "",
        loadChildren: () => import("./core/core.route").then((m) => m.coreRoutes),
    },
    {
        path: "auth",
        loadChildren: () =>
            import("./core/auth/auth.route").then((x) => x.authRoutes),
    }
];
