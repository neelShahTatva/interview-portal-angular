import { Routes } from "@angular/router";
export const questionBankRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./components/question-bank/question-bank.component").then(
        (m) => m.QuestionBankComponent
      ),
  },
  {
    path: "add",
    loadComponent: () =>
      import("./components/question-bank-form/question-bank-form.component").then(
        (m) => m.QuestionBankFormComponent
      )
  },
  {
    path: "edit/:questionId",
    loadComponent: () =>
      import("./components/question-bank-form/question-bank-form.component").then(
        (m) => m.QuestionBankFormComponent
      )
  },
];
