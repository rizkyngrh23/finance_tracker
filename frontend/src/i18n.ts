import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        dashboard: 'Dashboard',
        dashboard_desc: 'Welcome to your finance dashboard. Track your spending, income, and more.',
        transactions: 'Transactions',
        transactions_desc: 'View and manage your financial transactions here.',
        about: 'About',
        about_desc: 'Finance Tracker helps you manage your personal finances with ease.',
        balance: 'Balance',
        income: 'Income',
        expense: 'Expense',
        date: 'Date',
        description: 'Description',
        amount: 'Amount',
      },
    },
    id: {
      translation: {
        dashboard: 'Dasbor',
        dashboard_desc: 'Selamat datang di dasbor keuangan Anda. Pantau pengeluaran, pemasukan, dan lainnya.',
        transactions: 'Transaksi',
        transactions_desc: 'Lihat dan kelola transaksi keuangan Anda di sini.',
        about: 'Tentang',
        about_desc: 'Finance Tracker membantu Anda mengelola keuangan pribadi dengan mudah.',
        balance: 'Saldo',
        income: 'Pemasukan',
        expense: 'Pengeluaran',
        date: 'Tanggal',
        description: 'Deskripsi',
        amount: 'Jumlah',
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
