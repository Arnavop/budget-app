import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Receipts from './pages/Receipts';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ExpenseDetail from './pages/ExpenseDetail';
import UserProfile from './pages/UserProfile';

const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    exact: true,
    name: 'Dashboard',
    icon: 'dashboard'
  },
  {
    path: '/dashboard/groups',
    component: Groups,
    exact: true,
    name: 'Groups',
    icon: 'group'
  },
  {
    path: '/dashboard/groups/:id',
    component: GroupDetail,
    exact: true,
    name: 'Group Detail',
    hidden: true
  },
  {
    path: '/history',
    component: History,
    exact: true,
    name: 'History',
    icon: 'history'
  },
  {
    path: '/analytics',
    component: Analytics,
    exact: true,
    name: 'Analytics',
    icon: 'pie_chart'
  },
  {
    path: '/receipts',
    component: Receipts,
    exact: true,
    name: 'Receipts',
    icon: 'receipt'
  },
  {
    path: '/settings',
    component: Settings,
    exact: true,
    name: 'Settings',
    icon: 'settings'
  },
  {
    path: '/login',
    component: Login,
    exact: true,
    name: 'Login',
    hidden: true
  },
  {
    path: '/register',
    component: Register,
    exact: true,
    name: 'Register',
    hidden: true
  },
  {
    path: '/expenses/:id',
    component: ExpenseDetail,
    exact: true,
    name: 'Expense Detail',
    hidden: true
  },
  {
    path: '/profile',
    component: UserProfile,
    exact: true,
    name: 'User Profile',
    hidden: true
  },
  {
    path: '*',
    component: NotFound,
    name: 'Not Found',
    hidden: true
  }
];

export default routes;
