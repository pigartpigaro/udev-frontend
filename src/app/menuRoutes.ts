const menuRoutes: Record<string, string> = {
  'master.customers.index': '/master/customers',
  'master.project-types.index': '/master/project-types',
  'projects.index': '/projects',
  'projects.invoices.index': '/projects/invoices',
  'projects.payments.index': '/projects/payments',
  'projects.expenses.index': '/projects/expenses',
  'finance.team-loans.index': '/finance/team-loans',
  'reports.financial.index': '/reports/financial',
  'settings.workspace.index': '/settings/workspace',
  'settings.users.index': '/settings/users',
  'settings.access-control.index': '/settings/roles',
  'settings.roles.index': '/settings/roles',
}

export function frontendRouteFor(routeName: string | null): string | null {
  return routeName ? menuRoutes[routeName] || null : null
}
