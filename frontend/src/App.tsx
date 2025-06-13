import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

type Transaction = {
  date: string;
  desc: string;
  amount: number;
  type: 'income' | 'expense';
};

function formatRupiah(amount: number | string) {
  let num = typeof amount === 'number' ? amount : Number(String(amount).replace(/\D/g, ''));
  if (isNaN(num)) num = 0;
  return (
    'Rp ' +
    num
      .toLocaleString('id-ID', { minimumFractionDigits: 0 })
      .replace(/,/g, '.')
  );
}

function Topbar() {
  return (
    <header style={{
      width: '100%',
      height: 64,
      background: '#fff',
      borderBottom: '1px solid #e3e3e3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
    }}>
      <div style={{ fontWeight: 700, fontSize: 22, color: '#2f80ed', letterSpacing: 1 }}>
        💸 Finance Tracker
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ color: '#222', fontWeight: 500 }}>Hi, User</span>
        <img
          src="https://ui-avatars.com/api/?name=User&background=2f80ed&color=fff"
          alt="avatar"
          style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #e3e3e3' }}
        />
      </div>
    </header>
  );
}

function Dashboard({ transactions }: { transactions: Transaction[] }) {
  const { t } = useTranslation();
  const income = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const balance = income - expense;
  const chartMap: Record<string, { income: number; expense: number }> = {};
  transactions.forEach(tx => {
    const month = tx.date.slice(0, 7);
    if (!chartMap[month]) chartMap[month] = { income: 0, expense: 0 };
    if (tx.type === 'income') chartMap[month].income += tx.amount;
    else chartMap[month].expense += Math.abs(tx.amount);
  });
  const chartData = Object.entries(chartMap).map(([month, v]) => ({
    month,
    ...v,
  }));
  return (
    <div>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="card card-metric" style={{ flex: 1, minWidth: 220 }}>
          <div className="card-metric-label">{t('balance') || 'Balance'}</div>
          <div className="card-metric-value" style={{ color: '#2f80ed', fontSize: 28, fontWeight: 700 }}>
            {formatRupiah(balance)}
          </div>
        </div>
        <div className="card card-metric" style={{ flex: 1, minWidth: 220 }}>
          <div className="card-metric-label">{t('income') || 'Income'}</div>
          <div className="card-metric-value" style={{ color: '#27ae60', fontSize: 28, fontWeight: 700 }}>
            +{formatRupiah(income)}
          </div>
        </div>
        <div className="card card-metric" style={{ flex: 1, minWidth: 220 }}>
          <div className="card-metric-label">{t('expense') || 'Expense'}</div>
          <div className="card-metric-value" style={{ color: '#eb5757', fontSize: 28, fontWeight: 700 }}>
            -{formatRupiah(expense)}
          </div>
        </div>
      </div>
      <div className="card" style={{ minHeight: 320 }}>
        <h2 style={{ marginBottom: 0 }}>{t('dashboard') || 'Dashboard'}</h2>
        <p style={{ marginTop: 4, color: '#888', fontSize: 15 }}>{t('dashboard_desc') || 'Overview of your monthly income and expenses.'}</p>
        <div style={{ width: '100%', height: 250, marginTop: 24 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#27ae60" name={t('income') || 'Income'} />
              <Bar dataKey="expense" fill="#eb5757" name={t('expense') || 'Expense'} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Transactions({ transactions, onAdd, onDelete }: { transactions: Transaction[]; onAdd: (tx: Transaction) => void; onDelete: (idx: number) => void; }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    desc: '',
    amount: '',
    type: 'expense',
  });
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === 'amount') {
      const raw = value.replace(/\D/g, '');
      setForm(f => ({ ...f, amount: raw }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.desc || !form.amount || !form.date) return;
    const amountNum = Number(form.amount.replace(/\D/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) return;
    onAdd({
      date: form.date,
      desc: form.desc,
      amount: amountNum,
      type: form.type as 'income' | 'expense',
    });
    setForm(f => ({ ...f, desc: '', amount: '' }));
  }
  return (
    <div className="card" style={{ minHeight: 420, maxWidth: 900, margin: '0 auto' }}>
      <h2>{t('transactions') || 'Transactions'}</h2>
      <p style={{ color: '#888', fontSize: 15 }}>{t('transactions_desc') || 'Add and manage your transactions.'}</p>
      <form onSubmit={handleSubmit} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
        alignItems: 'end'
      }}>
        <div>
          <label style={{ fontWeight: 500, color: '#555' }}>{t('date') || 'Date'}</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 500, color: '#555' }}>{t('description') || 'Description'}</label>
          <input type="text" name="desc" placeholder={t('description') || 'Description'} value={form.desc} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 500, color: '#555' }}>{t('amount') || 'Amount'}</label>
          <input type="text" name="amount" placeholder={t('amount') || 'Amount'} value={form.amount ? formatRupiah(form.amount) : ''} onChange={handleChange} required inputMode="numeric" style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', width: '100%' }} />
        </div>
        <div>
          <label style={{ fontWeight: 500, color: '#555' }}>{t('type') || 'Type'}</label>
          <select name="type" value={form.type} onChange={handleChange} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', width: '100%' }}>
            <option value="expense">{t('expense') || 'Expense'}</option>
            <option value="income">{t('income') || 'Income'}</option>
          </select>
        </div>
        <div>
          <button type="submit" style={{
            padding: '0.7rem 1.5rem',
            borderRadius: 8,
            border: 'none',
            background: '#2f80ed',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            width: '100%',
            boxShadow: '0 2px 8px rgba(47,128,237,0.08)',
            marginTop: 22
          }}>
            {t('add') || 'Add'}
          </button>
        </div>
      </form>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: 15 }}>
          <thead>
            <tr style={{ background: '#f7f6f3' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>{t('date') || 'Date'}</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>{t('description') || 'Description'}</th>
              <th style={{ textAlign: 'right', padding: '0.5rem' }}>{t('amount') || 'Amount'}</th>
              <th style={{ textAlign: 'center', padding: '0.5rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f2f6fc')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: '0.5rem' }}>{tx.date}</td>
                <td style={{ padding: '0.5rem' }}>{tx.desc}</td>
                <td style={{
                  padding: '0.5rem',
                  textAlign: 'right',
                  color: tx.type === 'income' ? '#27ae60' : '#eb5757',
                  fontWeight: 500
                }}>
                  {tx.type === 'income' ? '+' : '-'}
                  {formatRupiah(Math.abs(tx.amount))}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => setDeleteIdx(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#eb5757',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      borderRadius: 4,
                      padding: '2px 10px',
                      transition: 'background 0.15s'
                    }}
                    title="Delete"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '1rem' }}>
            {t('no_transactions') || 'No transactions yet.'}
          </div>
        )}
      </div>
      {/* Modal for delete confirmation */}
      {deleteIdx !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', padding: '2rem 2.5rem', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 320, textAlign: 'center'
          }}>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>{t('delete_transaction') || 'Delete Transaction?'}</div>
            <div style={{ color: '#888', marginBottom: 24 }}>{t('delete_confirm') || 'Are you sure you want to delete this transaction?'}</div>
            <button
              onClick={() => { onDelete(deleteIdx); setDeleteIdx(null); }}
              style={{
                background: '#eb5757', color: '#fff', border: 'none', borderRadius: 6,
                padding: '0.6rem 1.5rem', fontWeight: 600, marginRight: 12, fontSize: 15
              }}
            >{t('delete') || 'Delete'}</button>
            <button
              onClick={() => setDeleteIdx(null)}
              style={{
                background: '#f7f6f3', color: '#222', border: 'none', borderRadius: 6,
                padding: '0.6rem 1.5rem', fontWeight: 600, fontSize: 15
              }}
            >{t('cancel') || 'Cancel'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Backup({ onImport }: { onImport: (data: Transaction[]) => void }) {
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  // Export backup
  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/backup/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'backup.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      setError('Failed to export backup.');
    }
    setLoading(false);
  };
  // Import backup
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setImporting(true);
    setError(null);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('/api/backup/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      // Optionally, fetch the imported data (simulate)
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          onImport(data);
        } catch {
          // ignore
        }
      };
      reader.readAsText(file);
    } catch (e) {
      setError('Failed to import backup.');
    }
    setImporting(false);
    if (fileInput.current) fileInput.current.value = '';
  };
  return (
    <div className="card" style={{ maxWidth: 500, margin: '0 auto', minHeight: 220 }}>
      <h2>{t('backup') || 'Backup & Restore'}</h2>
      <p style={{ color: '#888', fontSize: 15 }}>{t('backup_desc') || 'Export or import your data as a backup.'}</p>
      <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        <button onClick={handleExport} disabled={loading} style={{ background: '#2f80ed', color: '#fff', border: 'none', borderRadius: 6, padding: '0.7rem 1.5rem', fontWeight: 600, fontSize: 16, minWidth: 120 }}>
          {loading ? t('exporting') || 'Exporting...' : t('export') || 'Export'}
        </button>
        <label style={{ background: '#27ae60', color: '#fff', borderRadius: 6, padding: '0.7rem 1.5rem', fontWeight: 600, fontSize: 16, cursor: 'pointer', minWidth: 120 }}>
          {importing ? t('importing') || 'Importing...' : t('import') || 'Import'}
          <input type="file" accept="application/json" ref={fileInput} onChange={handleImport} style={{ display: 'none' }} disabled={importing} />
        </label>
      </div>
      {error && <div style={{ color: '#eb5757', marginTop: 16 }}>{error}</div>}
    </div>
  );
}

function ActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin/activity').then(res => {
      setLogs(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  return (
    <div className="card" style={{ maxWidth: 700, margin: '0 auto', minHeight: 220 }}>
      <h2>{t('activity_log') || 'Activity Log'}</h2>
      <p style={{ color: '#888', fontSize: 15 }}>{t('activity_log_desc') || 'Recent admin activities.'}</p>
      {loading ? <div style={{ color: '#888', marginTop: 24 }}>Loading...</div> : (
        <div style={{ marginTop: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr style={{ background: '#f7f6f3' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>User</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Action</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={3} style={{ color: '#888', textAlign: 'center', padding: 16 }}>No activity yet.</td></tr>
              ) : logs.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>{log.user}</td>
                  <td style={{ padding: '0.5rem' }}>{log.action}</td>
                  <td style={{ padding: '0.5rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function About() {
  const { t } = useTranslation();
  return (
    <div className="card" style={{ minHeight: 220, maxWidth: 600, margin: '0 auto' }}>
      <h2>{t('about') || 'About'}</h2>
      <p style={{ color: '#888', fontSize: 15 }}>{t('about_desc') || 'Personal finance tracker built with React & Spring Boot.'}</p>
      <div style={{
        marginTop: 32,
        background: '#f7f6f3',
        borderRadius: 8,
        padding: '1.5rem 2rem',
        color: '#2f80ed',
        fontWeight: 500,
        fontSize: 16,
        boxShadow: '0 2px 8px rgba(47,128,237,0.04)'
      }}>
        <span>Enterprise-ready. Secure. Fast. Built with ❤️ using React & Spring Boot.</span>
      </div>
    </div>
  );
}

function App() {
  const { i18n, t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  function handleAdd(tx: Transaction) {
    setTransactions(prev => [tx, ...prev]);
  }
  function handleDelete(idx: number) {
    setTransactions(prev => prev.filter((_, i) => i !== idx));
  }
  function handleImport(data: Transaction[]) {
    if (Array.isArray(data)) setTransactions(data as Transaction[]);
  }
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f6f3' }}>
        <aside className="sidebar" style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.03)',
          borderRight: '1px solid #e3e3e3',
          zIndex: 20
        }}>
          <div className="logo" style={{ marginBottom: 32, fontSize: 22, color: '#2f80ed', fontWeight: 700 }}>
            <span style={{ marginRight: 8 }}>💸</span>Finance Tracker
          </div>
          <div style={{ marginBottom: 24, color: '#888', fontWeight: 600, fontSize: 13, letterSpacing: 1 }}>MENU</div>
          <nav style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>{t('dashboard') || 'Dashboard'}</NavLink>
            <NavLink to="/transactions" className={({ isActive }) => isActive ? 'active' : ''}>{t('transactions') || 'Transactions'}</NavLink>
            <NavLink to="/backup" className={({ isActive }) => isActive ? 'active' : ''}>{t('backup') || 'Backup'}</NavLink>
            <NavLink to="/activity" className={({ isActive }) => isActive ? 'active' : ''}>{t('activity_log') || 'Activity Log'}</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>{t('about') || 'About'}</NavLink>
          </nav>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ color: '#888', fontWeight: 600, fontSize: 13, letterSpacing: 1, marginBottom: 8 }}>LANGUAGE</div>
            <div className="lang-switch" style={{ gap: 8 }}>
              <button
                className={i18n.language === 'en' ? 'active' : ''}
                onClick={() => i18n.changeLanguage('en')}
              >EN</button>
              <button
                className={i18n.language === 'id' ? 'active' : ''}
                onClick={() => i18n.changeLanguage('id')}
              >ID</button>
            </div>
          </div>
        </aside>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Topbar />
          <main className="main-content" style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            <Routes>
              <Route path="/" element={<Dashboard transactions={transactions} />} />
              <Route path="/transactions" element={
                <Transactions
                  transactions={transactions}
                  onAdd={handleAdd}
                  onDelete={handleDelete}
                />
              } />
              <Route path="/backup" element={<Backup onImport={handleImport} />} />
              <Route path="/activity" element={<ActivityLog />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
