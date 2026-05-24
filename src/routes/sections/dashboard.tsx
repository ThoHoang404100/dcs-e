import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AccountLayout } from 'src/sections/account/account-layout';

import { AuthGuard } from 'src/auth/guard';
import { DefaultKeySettings } from 'src/sections/defaultSettingKey/view';
import { usePathname } from '../hooks';
import { paths } from '../paths';

// ----------------------------------------------------------------------

// Overview
const IndexPage = lazy(() => import('src/pages/dashboard'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/banking'));
// Product
const ProductDetailsPage = lazy(() => import('src/pages/dashboard/product/details'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));
// Category
const CategoryPage = lazy(() => import('src/pages/dashboard/category/list'));
// Customer
const CustomerPage = lazy(() => import('src/pages/dashboard/customer/list'));
// Suppliers
const SuppliersPage = lazy(() => import('src/pages/dashboard/suppliers/list'));
// Employees
const EmployeesPage = lazy(() => import('src/pages/dashboard/employee/list'));
// Quotation
const QuotationPage = lazy(() => import('src/pages/dashboard/quotation/list'));
// Booked ticket
const OrderPage = lazy(() => import('src/pages/dashboard/booked-ticket/list'));
//Contract
const ContractPage = lazy(() => import('src/pages/dashboard/contract/list'));
//Contract supplier
const ContractSupplierPage = lazy(() => import('src/pages/dashboard/contractSupplier/list'));
// Order
// Invoice
// User
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
// Account
const AccountGeneralPage = lazy(() => import('src/pages/dashboard/user/account/general'));
const AccountChangePasswordPage = lazy(
  () => import('src/pages/dashboard/user/account/change-password')
);
// Blog
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// Job
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));
// Tour
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));
// Test render page by role
const PermissionPage = lazy(() => import('src/pages/dashboard/permission'));
// Settings page
const UnitListPage = lazy(() => import('src/pages/dashboard/unit/list'));
const EmployeeTypeListPage = lazy(() => import('src/pages/dashboard/employeeType/list'));
const DepartmentListPage = lazy(() => import('src/pages/dashboard/department/list'));
// Receipt page
const ContractReceiptPage = lazy(() => import('src/pages/dashboard/receipt/list'));
// Spend page
const ContractCustomerSpendPage = lazy(() => import('src/pages/dashboard/spend/list-customer'));
const ContractSupplierSpendPage = lazy(() => import('src/pages/dashboard/spend/list-supplier'));
// Warehouse Export page
const ContractWarehouseExportPage = lazy(() => import('src/pages/dashboard/warehouse-export/list'));
// Warehouse Import page
const ContractWarehouseImportPage = lazy(() => import('src/pages/dashboard/warehouse-import/list'));

// Receipt internal page
const ReceiptPage = lazy(() => import('src/pages/dashboard/internal/recepit/list'));
// Spend internal page
const SpendPage = lazy(() => import('src/pages/dashboard/internal/spend/list'));
// Transfer internal page
const TransferPage = lazy(() => import('src/pages/dashboard/internal/transfer/list'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

const accountLayout = () => (
  <AccountLayout>
    <SuspenseOutlet />
  </AccountLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { index: true, element: <IndexPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      {
        path: 'user',
        children: [
          { index: true, element: <UserProfilePage /> },
          // { path: 'profile', element: <UserProfilePage /> },
          // { path: 'cards', element: <UserCardsPage /> },
          // { path: 'list', element: <UserListPage /> },
          // { path: 'new', element: <UserCreatePage /> },
          // { path: ':id/edit', element: <UserEditPage /> },
        ],
      },
      {
        path: 'account',
        element: accountLayout(),
        children: [
          { index: true, element: <AccountGeneralPage /> },
          { path: 'change-password', element: <AccountChangePasswordPage /> },
        ],
      },
      {
        path: 'product',
        children: [
          { index: true, element: <ProductListPage /> },
          { path: 'list', element: <ProductListPage /> },
          { path: ':id', element: <ProductDetailsPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> },
        ],
      },
      {
        path: 'customer-services',
        children: [
          { index: true, element: <QuotationPage /> },
          { path: 'contract', element: <ContractPage /> },
          {
            path: 'receipt',
            children: [
              { index: true, element: <ContractReceiptPage /> },
            ]
          },
          {
            path: 'spend',
            children: [
              { index: true, element: <ContractCustomerSpendPage /> },
            ]
          },
          {
            path: 'warehouse-export',
            children: [
              { index: true, element: <ContractWarehouseExportPage /> }
            ]
          },
        ]
      },
      {
        path: 'supplier-services',
        children: [
          { index: true, element: <OrderPage /> },
          { path: 'contract-supplier', element: <ContractSupplierPage /> },
          {
            path: 'spend',
            children: [
              { index: true, element: <ContractSupplierSpendPage /> },
            ]
          },
          {
            path: 'warehouse-import',
            children: [
              { index: true, element: <ContractWarehouseImportPage /> }
            ]
          },
        ]
      },
      {
        path: 'category',
        children: [
          { index: true, element: <CategoryPage /> },
        ],
      },
      {
        path: 'customer',
        children: [
          { index: true, element: <CustomerPage /> },
        ],
      },
      {
        path: 'suppliers',
        children: [
          { index: true, element: <SuppliersPage /> },
        ],
      },
      {
        path: 'receipt',
        children: [
          { index: true, element: <ReceiptPage /> },
        ],
      },
      {
        path: 'spend',
        children: [
          { index: true, element: <SpendPage /> },
        ],
      },
      {
        path: 'transfer',
        children: [
          { index: true, element: <TransferPage /> },
        ],
      },
      {
        path: 'employees',
        children: [
          { index: true, element: <EmployeesPage /> },
        ],
      },
      {
        path: 'post',
        children: [
          { index: true, element: <BlogPostsPage /> },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':title', element: <BlogPostPage /> },
          { path: ':title/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> },
        ],
      },
      {
        path: 'job',
        children: [
          { index: true, element: <JobListPage /> },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { path: 'new', element: <JobCreatePage /> },
          { path: ':id/edit', element: <JobEditPage /> },
        ],
      },
      {
        path: 'tour',
        children: [
          { index: true, element: <TourListPage /> },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> },
        ],
      },
      { path: 'permission', element: <PermissionPage /> },
      { path: 'defaultSettingKey', element: <DefaultKeySettings /> },
      { path: 'unit', element: <UnitListPage /> },
      { path: 'employee-type', element: <EmployeeTypeListPage /> },
      { path: 'department', element: <DepartmentListPage /> },
      {
        path: 'settings',
        children: [
          { index: true, element: <UnitListPage /> },

        ]
      }
    ],
  },
];
