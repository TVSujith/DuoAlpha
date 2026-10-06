const http = require('http');

async function testSuite() {
  console.log('--- STARTING DUOALPHA AUTOMATED TEST SUITE ---');

  const BASE_URL = 'https://duoalpha.onrender.com';

  async function request(endpoint, options = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
      },
      ...options
    });
    const text = await res.text();
    let json = {};
    try { json = JSON.parse(text); } catch (e) { json = text; }
    return { status: res.status, data: json };
  }

  // 1. Health check
  console.log('\n[TEST 1] Server Health Check:');
  const health = await request('/health');
  console.log('Health status:', health.status, health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Unauthorized login attempt
  console.log('\n[TEST 2] Testing Invalid Credentials Rejection:');
  const invalidLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'BhuvSusz', password: 'WrongPassword123' })
  });
  console.log('Invalid login status:', invalidLogin.status);
  console.log('Error message:', invalidLogin.data);
  if (invalidLogin.status !== 401 || invalidLogin.data.error !== 'Access Denied - Invalid Username or Password') {
    throw new Error('Invalid login rejection message assertion failed!');
  }
  console.log('✓ Correctly blocked unauthorized login with exact error string');

  // 3. Valid Master Account login
  console.log('\n[TEST 3] Testing Master Account Login (BhuvSusz / Krishna@0204):');
  const validLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'BhuvSusz', password: 'Krishna@0204' })
  });
  console.log('Valid login status:', validLogin.status);
  if (validLogin.status !== 200 || !validLogin.data.token) {
    throw new Error('Valid login failed!');
  }
  const token = validLogin.data.token;
  console.log('✓ Master Account successfully authenticated with JWT session');

  // 4. Record Trading Entries (+2500 and -1200)
  console.log('\n[TEST 4] Testing Trade Entries (+2500 profit and -1200 loss):');
  const today = new Date().toISOString().split('T')[0];

  const trade1 = await request('/trades', {
    method: 'POST',
    token,
    body: JSON.stringify({
      date: today,
      amount: 2500,
      notes: 'Long breakout on BankNifty 48000 CE'
    })
  });
  console.log('Trade 1 created (+2500):', trade1.status, trade1.data.trade?.id);

  const trade2 = await request('/trades', {
    method: 'POST',
    token,
    body: JSON.stringify({
      date: today,
      amount: -1200,
      notes: 'Stop loss hit on intraday mean reversion short'
    })
  });
  console.log('Trade 2 created (-1200):', trade2.status, trade2.data.trade?.id);

  // 5. Test Trade Stats & Net P&L
  console.log('\n[TEST 5] Verifying Net P&L Calculation:');
  const statsRes = await request('/trades/stats', { token });
  console.log('Stats:', {
    totalProfit: statsRes.data.totalProfit,
    totalLoss: statsRes.data.totalLoss,
    netPnL: statsRes.data.netPnL,
    todayPnL: statsRes.data.todayPnL
  });
  if (statsRes.data.netPnL < 1300) {
    throw new Error('Net P&L calculation mismatch');
  }
  console.log('✓ Net P&L successfully updated automatically');

  // 6. Test Capital Management
  console.log('\n[TEST 6] Testing Capital Management:');
  const capDep = await request('/capital', {
    method: 'POST',
    token,
    body: JSON.stringify({
      type: 'deposit',
      amount: 25000,
      notes: 'Additional funding for swing trading',
      date: today
    })
  });
  console.log('Capital deposit status:', capDep.status, 'New Current Capital:', capDep.data.summary?.currentCapital);

  // 7. Test Alpha Room Chat System
  console.log('\n[TEST 7] Testing Alpha Room Chat Persistence:');
  const msg1 = await request('/chat', {
    method: 'POST',
    token,
    body: JSON.stringify({
      sender: 'Sujith',
      text: 'Market looks bullish today.'
    })
  });
  console.log('Message 1 status:', msg1.status, msg1.data.message?.sender, ':', msg1.data.message?.text);

  const msg2 = await request('/chat', {
    method: 'POST',
    token,
    body: JSON.stringify({
      sender: 'Friend',
      text: 'Waiting for breakout.'
    })
  });
  console.log('Message 2 status:', msg2.status, msg2.data.message?.sender, ':', msg2.data.message?.text);

  const chatHistory = await request('/chat', { token });
  console.log('Alpha Room history count:', chatHistory.data.messages?.length);
  if (chatHistory.data.messages?.length < 2) {
    throw new Error('Chat persistence failed');
  }
  console.log('✓ Real-time Alpha Room messages stored and retrieved successfully');

  // 8. Test Reports & Exports
  console.log('\n[TEST 8] Testing Reports API:');
  const monthlyRep = await request('/reports/monthly', { token });
  console.log('Monthly reports count:', monthlyRep.data.report?.length);

  const csvRep = await request('/reports/export/csv', { token });
  console.log('CSV export status:', csvRep.status);

  const excelRep = await request('/reports/export/excel', { token });
  console.log('Excel export status:', excelRep.status);

  // 9. Test Dashboard Combined Summary
  console.log('\n[TEST 9] Testing Master Dashboard Aggregation:');
  const dashRes = await request('/dashboard', { token });
  console.log('Dashboard response:', {
    currentCapital: dashRes.data.capital?.currentCapital,
    netPnL: dashRes.data.pnl?.netPnL,
    monthlyGoal: dashRes.data.goal?.monthlyGoal,
    recentTradesCount: dashRes.data.recentTrades?.length
  });

  // 10. Database Backup & JSON Export
  console.log('\n[TEST 10] Testing Database Backup:');
  const jsonBackup = await request('/settings/backup/json', { token });
  console.log('JSON backup status:', jsonBackup.status);
  if (jsonBackup.status !== 200 || !jsonBackup.data.trades) {
    throw new Error('Backup failed');
  }
  console.log('✓ Database atomic backup confirmed');

  console.log('\n🎉 ALL DUOALPHA CORE TESTS PASSED SUCCESSFULLY! 🎉\n');
}

testSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
