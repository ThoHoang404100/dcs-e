import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
};

export const navData: NavSectionProps['data'] = [
  /**
   * Overview
   */
  {
    items: [
      {
        title: 'Tổng quan',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
        allowedRoles: ['TOANQUYEN.VIEW', 'THONGKE.VIEW'],
      }
    ],
  },
  /**
   * Management
   */
  {
    items: [
      {
        title: 'Nghiệp vụ khách hàng',
        path: paths.dashboard.customerServices.contract,
        icon: <Iconify icon={'lsicon:contract-filled'} />,
        allowedRoles: ['TOANQUYEN.VIEW', 'BAOGIA.VIEW', 'HOPDONG.VIEW', 'PHIEUTHU.VIEW', 'PHIEUXUATKHO.VIEW'],
        children: [
          {
            title: 'Báo giá',
            path: paths.dashboard.customerServices.quotation,
            icon: <Iconify icon={'streamline-cyber-color:megaphone-1'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'BAOGIA.VIEW'],
          },
          {
            title: 'Hợp đồng',
            path: paths.dashboard.customerServices.contract,
            icon: <Iconify icon={'streamline-cyber-color:new-document-layer'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'HOPDONG.VIEW'],
          },
          {
            title: 'Phiếu thu', path: paths.dashboard.customerServices.receipt,
            icon: <Iconify icon={'streamline-cyber-color:piggy-bank'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'PHIEUTHU.VIEW'],
          },
          // {
          //   title: 'Phiếu chi',
          //   path: paths.dashboard.customerServices.spend,
          //   icon: <Iconify icon={'streamline-cyber-color:bank-notes-stack'} />,
          //   allowedRoles: ['TOANQUYEN.VIEW', 'PHIEUCHI.VIEW'],
          // },
          {
            title: 'Phiếu xuất kho', path: paths.dashboard.customerServices.warehouseExport,
            icon: <Iconify icon={'streamline-cyber-color:delivery-package-2'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'PHIEUXUATKHO.VIEW'],
          },
        ]
      },
      {
        title: 'Nghiệp vụ nhà cung cấp',
        path: paths.dashboard.supplierServices.contractSupplier,
        icon: <Iconify icon={'lsicon:contract-outline'} />,
        allowedRoles: ['TOANQUYEN.VIEW', 'HOPDONG.VIEW', 'PHIEUCHI.VIEW'],
        children: [
          {
            title: 'Đặt hàng',
            path: paths.dashboard.supplierServices.orderSupplier,
            icon: <Iconify icon={'streamline-cyber-color:shopping-basket-star'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'HOPDONG.VIEW'],
          },
          {
            title: 'Hợp đồng',
            path: paths.dashboard.supplierServices.contractSupplier,
            icon: <Iconify icon={'streamline-cyber-color:new-document-layer'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'HOPDONG.VIEW'],
          },
          {
            title: 'Phiếu chi',
            path: paths.dashboard.supplierServices.spend,
            icon: <Iconify icon={'streamline-cyber-color:bank-notes-stack'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'PHIEUCHI.VIEW'],
          },
          {
            title: 'Phiếu nhập kho',
            path: paths.dashboard.supplierServices.warehouseImport,
            icon: <Iconify icon={'streamline-cyber-color:delivery-package-open'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'PHIEUNHAPKHO.VIEW'],
          },
        ]
      },
    ]
  },
  {
    items: [
      {
        title: 'Quản lý danh mục',
        path: paths.dashboard.product.root,
        icon: <Iconify icon={'material-symbols:category-rounded'} />,
        allowedRoles: [
          'TOANQUYEN.VIEW',
          'NHOMSANPHAM.VIEW',
          'SANPHAM.VIEW',
          'DONVITINH.VIEW',
          'KHACHHANG.VIEW',
          'PHONGBAN.VIEW',
          'CHUCVU.VIEW',
          'NHANVIEN.VIEW',
          'NHACUNGCAP.VIEW',
          'TAIKHOAN.VIEW'
        ],
        children: [
          {
            title: 'Sản phẩm', path: paths.dashboard.product.root,
            icon: <Iconify icon={'streamline-cyber-color:shopping-product'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'SANPHAM.VIEW'],
            hiddenChild: [
              paths.dashboard.category.root,
              paths.dashboard.unit
            ]
          },
          {
            title: 'Khách hàng', path: paths.dashboard.customer.root,
            icon: <Iconify icon={'streamline-cyber-color:businessman'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'KHACHHANG.VIEW'],
            hiddenChild: [
              paths.dashboard.suppliers.root,
            ]
          },
          {
            title: 'Nhân viên', path: paths.dashboard.employees.root,
            icon: <Iconify icon={'streamline-cyber-color:account-group'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'NHANVIEN.VIEW'],
            hiddenChild: [
              paths.dashboard.employeeType,
              paths.dashboard.department
            ]
          },
          {
            title: 'Tài khoản ngân hàng',
            path: paths.dashboard.general.banking,
            icon: <Iconify icon={'streamline-cyber-color:bank-1'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'TAIKHOAN.VIEW'],
          },
        ],
      },
      {
        title: 'Quản lý nội bộ',
        path: paths.dashboard.user.root,
        icon: <Iconify icon={'carbon:id-management'} />,
        allowedRoles: [
          'TOANQUYEN.VIEW',
          'PHIEUTHU.VIEW',
          'PHIEUCHI.VIEW',
          'PHIEUXUATKHO.VIEW'
        ],
        children: [
          {
            title: 'Phiếu thu', path: paths.dashboard.receipt.root,
            icon: <Iconify icon={'streamline-cyber-color:piggy-bank'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'PHIEUTHU.VIEW'],
          },
          {
            title: 'Phiếu chi',
            path: paths.dashboard.spend.root,
            icon: <Iconify icon={'streamline-cyber-color:bank-notes-stack'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'PHIEUCHI.VIEW'],
          },
          {
            title: 'Chuyển khoản nội bộ',
            path: paths.dashboard.transfer.root,
            icon: <Iconify icon={'streamline-cyber-color:credit-card-payment-machine'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'CHUYENKHOANNOIBO.VIEW'],
          },
          // {
          //   title: 'Phiếu xuất kho', path: paths.dashboard.warehouseExport.root,
          //   icon: <Iconify icon={'streamline-cyber-color:delivery-package-2'} />,
          //   allowedRoles: ['TOANQUYEN.VIEW', 'PHIEUXUATKHO.VIEW'],
          // },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: 'Cài đặt',
        path: paths.dashboard.settings.root,
        icon: <Iconify icon={'uil:setting'} />,
        allowedRoles: ['TOANQUYEN.VIEW', 'PHANQUYEN.VIEW'],
        children: [
          {
            title: 'Phân quyền',
            path: paths.dashboard.permission,
            icon: <Iconify icon={'streamline-cyber-color:lock-shield'} />,
            allowedRoles: ['TOANQUYEN.VIEW', 'PHANQUYEN.VIEW'],
            // caption: 'Chỉ tài khoản cấp super mới xem được trang này.',
          },
          {
            title: 'Thông tin công ty',
            path: paths.dashboard.user.root,
            icon: <Iconify icon={'streamline-cyber-color:id-card'} />,
            allowedRoles: ['TOANQUYEN.VIEW'],
          },
          {
            title: 'Dữ liệu mặc định',
            path: paths.dashboard.defaultSettingKey,
            icon: <Iconify icon={'streamline-cyber-color:id-card'} />,
            allowedRoles: ['TOANQUYEN.VIEW'],
          }
        ]
      },
    ]
  },
  /**
   * Item state
   */
  // {
  //   subheader: 'Misc',
  //   items: [
  //     {
  //       title: 'Permission',
  //       path: paths.dashboard.permission,
  //       icon: ICONS.lock,
  //       allowedRoles: ['admin', 'manager'],
  //       caption: 'Only admin can see this item.',
  //     },
  //     {
  //       title: 'Level',
  //       path: '#/dashboard/menu_level',
  //       icon: ICONS.menuItem,
  //       children: [
  //         {
  //           title: 'Level 1a',
  //           path: '#/dashboard/menu_level/menu_level_1a',
  //           children: [
  //             { title: 'Level 2a', path: '#/dashboard/menu_level/menu_level_1a/menu_level_2a' },
  //             {
  //               title: 'Level 2b',
  //               path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b',
  //               children: [
  //                 {
  //                   title: 'Level 3a',
  //                   path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b/menu_level_3a',
  //                 },
  //                 {
  //                   title: 'Level 3b',
  //                   path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b/menu_level_3b',
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //         { title: 'Level 1b', path: '#/dashboard/menu_level/menu_level_1b' },
  //       ],
  //     },
  //     {
  //       title: 'Disabled',
  //       path: '#disabled',
  //       icon: ICONS.disabled,
  //       disabled: true,
  //     },
  //     {
  //       title: 'Label',
  //       path: '#label',
  //       icon: ICONS.label,
  //       info: (
  //         <Label
  //           color="info"
  //           variant="inverted"
  //           startIcon={<Iconify icon="solar:bell-bing-bold-duotone" />}
  //         >
  //           NEW
  //         </Label>
  //       ),
  //     },
  //     {
  //       title: 'Caption',
  //       path: '#caption',
  //       icon: ICONS.menuItem,
  //       caption:
  //         'Quisque malesuada placerat nisl. In hac habitasse platea dictumst. Cras id dui. Pellentesque commodo eros a enim. Morbi mollis tellus ac sapien.',
  //     },
  //     {
  //       title: 'Params',
  //       path: '/dashboard/params?id=e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
  //       icon: ICONS.parameter,
  //     },
  //     {
  //       title: 'External link',
  //       path: 'https://www.google.com/',
  //       icon: ICONS.external,
  //       info: <Iconify width={18} icon="eva:external-link-fill" />,
  //     },
  //     { title: 'Blank', path: paths.dashboard.blank, icon: ICONS.blank },
  //   ],
  // },
];
