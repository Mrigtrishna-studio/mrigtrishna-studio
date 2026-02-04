'use client';

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Welcome Back, Niraj.</h1>
      <p className="text-slate mb-12">Here is what's happening in your studio.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stat Cards */}
        <div className="bg-navy-light border border-taupe/20 p-6 rounded-xl">
          <h3 className="text-slate text-sm uppercase tracking-widest mb-2">Portfolio Items</h3>
          <p className="text-4xl font-bold text-white">Manage →</p>
        </div>
        
        <div className="bg-navy-light border border-taupe/20 p-6 rounded-xl">
          <h3 className="text-slate text-sm uppercase tracking-widest mb-2">Journal Entries</h3>
          <p className="text-4xl font-bold text-white">Write →</p>
        </div>

        <div className="bg-navy-light border border-taupe/20 p-6 rounded-xl">
          <h3 className="text-slate text-sm uppercase tracking-widest mb-2">Shop Products</h3>
          <p className="text-4xl font-bold text-white">Sell →</p>
        </div>
      </div>
    </div>
  );
}