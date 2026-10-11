import type { RouteRecordRaw } from 'vue-router'
import LoginPage from '../modules/auth/LoginPage.vue'
import HomePage from '../modules/home/HomePage.vue'
import WorkspaceLayout from './WorkspaceLayout.vue'
import CustomersPage from '../modules/master/customers/pages/CustomersPage.vue'
import ProjectTypesPage from '../modules/master/project-types/pages/ProjectTypesPage.vue'
import ProjectPage from '../modules/projects/project/pages/ProjectPage.vue'
import InvoicesPage from '../modules/projects/invoice/pages/InvoicesPage.vue'
import PaymentsPage from '../modules/projects/payment/pages/PaymentsPage.vue'
import ExpensesPage from '../modules/projects/expense/pages/ExpensesPage.vue'
import ProjectFinancialReportPage from '../modules/projects/financial-report/pages/ProjectFinancialReportPage.vue'
import WorkspaceSettingsPage from '../modules/settings/workspace/pages/WorkspaceSettingsPage.vue'
import RolePermissionsPage from '../modules/access-control/roles/pages/RolePermissionsPage.vue'
import UsersPage from '../modules/settings/users/pages/UsersPage.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/login', component: LoginPage, meta: { guestOnly: true } },
  {
    path: '/',
    component: WorkspaceLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: HomePage, meta: { searchPlaceholder: 'Cari menu di UDev' } },
      { path: 'master/customers', component: CustomersPage, meta: { searchPlaceholder: 'Cari nama, email, telepon pelanggan...' } },
      { path: 'master/project-types', component: ProjectTypesPage, meta: { searchPlaceholder: 'Cari kode atau nama tipe proyek...' } },
      { path: 'projects', component: ProjectPage, meta: { searchPlaceholder: 'Cari kode, project, pelanggan, atau jenis...' } },
      { path: 'projects/invoices', component: InvoicesPage, meta: { searchPlaceholder: 'Cari kode invoice, project, atau pelanggan...' } },
      { path: 'projects/payments', component: PaymentsPage, meta: { searchPlaceholder: 'Cari kode penerimaan, invoice, project, atau pelanggan...' } },
      { path: 'projects/payments/:id/receipt', component: () => import('../modules/projects/payment/pages/PaymentReceiptPage.vue'), meta: { printLayout: true, searchPlaceholder: 'Cari kuitansi...' } },
      { path: 'projects/expenses', component: ExpensesPage, meta: { searchPlaceholder: 'Cari kode pengeluaran, penerima, project, atau referensi...' } },
      { path: 'finance/team-loans', component: () => import('../modules/projects/expense/pages/TeamLoansPage.vue'), meta: { searchPlaceholder: 'Cari kode kasbon, nama anggota, atau keterangan...' } },
      { path: 'reports/financial', component: ProjectFinancialReportPage, meta: { searchPlaceholder: 'Cari menu di UDev' } },
      { path: 'settings/workspace', component: WorkspaceSettingsPage, meta: { searchPlaceholder: 'Cari menu di UDev' } },
      { path: 'settings/users', component: UsersPage, meta: { searchPlaceholder: 'Cari nama, username, atau email pengguna...' } },
      { path: 'settings/roles', component: RolePermissionsPage, meta: { searchPlaceholder: 'Cari menu di UDev' } },
      { path: 'projects/invoices/:id/print', component: () => import('../modules/projects/invoice/pages/InvoicePrintPage.vue'), meta: { printLayout: true, searchPlaceholder: 'Cari invoice...' } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]
