
import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Users,
  Calendar,
  Home,
  Shield,
  ClipboardList,
  LogOut,
  Menu,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  RefreshCw,
  FileText,
  Activity,
  Sun,
  Moon,
  ArrowRightLeft
} from 'lucide-react';
import { Personnel, LeaveRecord, DutyAssignment, User, DutyType, Rank, Section, Shift } from './types';
import { mockLeaves, mockDuties } from './mockData';
import { getPersonnel } from './api';
import { generateSmartRoster } from './geminiService';

const ThemeContext = createContext({ isDarkMode: false, toggleTheme: () => { } });

// --- Sub-components ---

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active
      ? 'bg-[#00A859] text-white shadow-md'
      : 'text-[#D1D3D4] hover:bg-[#333333] hover:text-white'
      }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#333333] border-[#333333]' : 'bg-white border-[#D1D3D4]'} ${className}`}>
      <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-[#D1D3D4]/10' : 'border-[#D1D3D4]/50'}`}>
        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

// --- Views ---

const HomeView: React.FC = () => {
  const slides = [
    {
      id: 1,
      title: "Welcome to Sentinels OPS",
      desc: "Advanced Personnel & Duty Management System",
      color: "bg-[#1A1A1B]"
    },
    {
      id: 2,
      title: "Operational Readiness",
      desc: "Real-time tracking of active units and personnel status",
      color: "bg-[#00A859]"
    },
    {
      id: 3,
      title: "AI-Powered Scheduling",
      desc: "Automated duty rosters powered by Gemini AI",
      color: "bg-[#EF2B33]"
    }
  ];

  const [current, setCurrent] = useState(0);
  const { isDarkMode } = useContext(ThemeContext);

  const next = () => setCurrent((curr) => (curr === slides.length - 1 ? 0 : curr + 1));
  const prev = () => setCurrent((curr) => (curr === 0 ? slides.length - 1 : curr - 1));

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg group">
        {/* Slides */}
        <div className="absolute inset-0 transition-transform duration-500 ease-out flex" style={{ transform: `translateX(-${current * 100}%)` }}>
          {slides.map((slide) => (
            <div key={slide.id} className={`min-w-full h-full flex flex-col items-center justify-center text-white ${slide.color} p-10 text-center`}>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{slide.title}</h1>
              <p className="text-xl md:text-2xl opacity-90 max-w-2xl">{slide.desc}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors text-white">
          <ChevronLeft size={24} />
        </button>
        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors text-white">
          <ChevronRight size={24} />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${current === idx ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="System Status">
          <div className="flex items-center space-x-2 text-[#00A859]">
            <Activity size={20} />
            <span className="font-medium">All Systems Operational</span>
          </div>
        </Card>
        <Card title="Pending Actions">
          <div className={`${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/70'}`}>No pending approvals required.</div>
        </Card>
        <Card title="Announcements">
          <div className={`${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/70'}`}>Weekly briefing at 0900 hours.</div>
        </Card>
      </div>
    </div>
  );
};

const PersonnelDetailView: React.FC<{ personnel: Personnel; onBack: () => void }> = ({ personnel, onBack }) => {
  const { isDarkMode } = useContext(ThemeContext);
  if (!personnel) return <div>Personnel not found</div>;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className={`flex items-center space-x-2 hover:text-[#00A859] transition-colors ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}`}>
        <ChevronLeft size={20} />
        <span className="font-medium">Back to Personnel List</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className={`rounded-xl shadow-sm border p-6 flex flex-col items-center text-center ${isDarkMode ? 'bg-[#333333] border-[#333333]' : 'bg-white border-[#D1D3D4]'}`}>
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold mb-4 ${isDarkMode ? 'bg-[#1A1A1B] text-white' : 'bg-[#D1D3D4]/30 text-[#333333]'}`}>
              {personnel.firstName[0]}{personnel.lastName[0]}
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{personnel.rank} {personnel.lastName}</h2>
            <p className={`font-medium ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/60'}`}>{personnel.serviceId}</p>
            <div className={`mt-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${personnel.status === 'Active' ? 'bg-[#EF2B33]/10 text-[#EF2B33]' :
              personnel.status === 'On Leave' ? 'bg-[#FDE910]/20 text-[#333333]' : 'bg-[#D1D3D4]/30 text-[#333333]'
              }`}>
              {personnel.status}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <Card title="Service Record">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-[#D1D3D4]/60' : 'text-[#333333]/60'}`}>First Name</label>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{personnel.firstName}</p>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-[#D1D3D4]/60' : 'text-[#333333]/60'}`}>Last Name</label>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{personnel.lastName}</p>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-[#D1D3D4]/60' : 'text-[#333333]/60'}`}>Section</label>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{personnel.section}</p>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-[#D1D3D4]/60' : 'text-[#333333]/60'}`}>Joined Date</label>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{personnel.joinedDate}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const mockTransfers = [
  { id: 't1', name: 'John Doe', from: 'Operations', to: 'Logistics', date: '2024-05-18', reason: 'Requested transfer for career development' },
  { id: 't2', name: 'Sarah Taylor', from: 'Training', to: 'Intelligence', date: '2024-05-15', reason: 'Skillset alignment with Intel requirements' },
  { id: 't3', name: 'Mike Chen', from: 'Logistics', to: 'Operations', date: '2024-05-10', reason: 'Operational shortage fill' },
  { id: 't4', name: 'Jessica Jones', from: 'Administration', to: 'Communications', date: '2024-05-01', reason: 'Promotion and reassignment' },
  { id: 't5', name: 'David Kim', from: 'Operations', to: 'Training', date: '2024-04-28', reason: 'Instructor assignment' },
];

const TransfersView: React.FC = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransfers = mockTransfers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>Personnel Transfer History</h2>
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-[#D1D3D4]/50' : 'text-[#D1D3D4]'}`} size={18} />
          <input
            type="text"
            placeholder="Search transfers..."
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A859] outline-none ${isDarkMode ? 'bg-[#333333] border-[#333333] text-white placeholder-[#D1D3D4]/50' : 'bg-white border-[#D1D3D4]'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#333333] border-[#333333]' : 'bg-white border-[#D1D3D4]'}`}>
        <table className="w-full text-left">
          <thead className={`border-b ${isDarkMode ? 'bg-[#1A1A1B]/30 border-[#D1D3D4]/10' : 'bg-[#D1D3D4]/20 border-[#D1D3D4]'}`}>
            <tr>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Personnel Name</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>From Section</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>To Section</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Date</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Reason</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-[#D1D3D4]/10' : 'divide-[#D1D3D4]/50'}`}>
            {filteredTransfers.map((t) => (
              <tr key={t.id} className={`transition-colors ${isDarkMode ? 'hover:bg-[#1A1A1B]/30' : 'hover:bg-[#D1D3D4]/10'}`}>
                <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{t.name}</td>
                <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/80'}`}>{t.from}</td>
                <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/80'}`}>{t.to}</td>
                <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-[#D1D3D4]/50' : 'text-[#D1D3D4]'}`}>{t.date}</td>
                <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/80'}`}>{t.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DashboardView: React.FC<{
  personnel: Personnel[],
  leaves: LeaveRecord[],
  duties: DutyAssignment[],
  onViewTransfers: () => void
}> = ({ personnel, leaves, duties, onViewTransfers }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const activePersonnel = personnel.filter(p => p.status === 'Active').length;
  const onLeave = leaves.filter(l => l.status === 'Approved').length;
  const today = new Array(24).fill(0); // mock distribution

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl border shadow-sm ${isDarkMode ? 'bg-[#333333] border-[#333333]' : 'bg-white border-[#D1D3D4]'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-[#00A859]/10 p-2 rounded-lg text-[#00A859]">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-[#EF2B33] bg-[#EF2B33]/10 px-2 py-1 rounded">Active</span>
          </div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/70'}`}>Total Personnel</p>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{personnel.length}</h2>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm ${isDarkMode ? 'bg-[#333333] border-[#333333]' : 'bg-white border-[#D1D3D4]'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#FDE910]/20 text-[#FDE910]' : 'bg-[#FDE910]/20 text-[#333333]'}`}>
              <Calendar size={20} />
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${isDarkMode ? 'text-[#FDE910] bg-[#FDE910]/20' : 'text-[#333333] bg-[#FDE910]/20'}`}>Current</span>
          </div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/70'}`}>Personnel on Leave</p>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{onLeave}</h2>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm ${isDarkMode ? 'bg-[#333333] border-[#333333]' : 'bg-white border-[#D1D3D4]'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#1A1A1B]/50 text-[#D1D3D4]' : 'bg-[#1A1A1B]/10 text-[#1A1A1B]'}`}>
              <Shield size={20} />
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${isDarkMode ? 'text-[#D1D3D4] bg-[#1A1A1B]/50' : 'text-[#1A1A1B] bg-[#1A1A1B]/10'}`}>24h Ops</span>
          </div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/70'}`}>Active Duty Posts</p>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>12</h2>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm ${isDarkMode ? 'bg-[#333333] border-[#333333]' : 'bg-white border-[#D1D3D4]'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-[#EF2B33]/10 p-2 rounded-lg text-[#EF2B33]">
              <Activity size={20} />
            </div>
          </div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/70'}`}>Readiness Level</p>
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>94%</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Current Shift Deployment">
          <div className="space-y-4">
            {Object.values(DutyType).map((type, i) => (
              <div key={type} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-[#1A1A1B]/50' : 'bg-[#D1D3D4]/20'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-[#00A859]"></div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}`}>{type}</span>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2].map(n => (
                    <div key={n} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${isDarkMode ? 'bg-[#1A1A1B] border-[#333333] text-[#D1D3D4]' : 'bg-[#D1D3D4] border-white text-[#333333]'}`}>
                      ID
                    </div>
                  ))}
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-[#00A859] ${isDarkMode ? 'bg-[#00A859]/10 border-[#333333]' : 'bg-[#00A859]/10 border-white'}`}>
                    +1
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent Transfers">
          <div className={`divide-y ${isDarkMode ? 'divide-[#D1D3D4]/10' : 'divide-[#D1D3D4]/50'}`}>
            {mockTransfers.slice(0, 2).map((t, i) => (
              <div key={i} className="py-4 flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{t.name}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>{t.from} → {t.to}</p>
                </div>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-[#D1D3D4]/50' : 'text-[#D1D3D4]'}`}>{t.date}</p>
              </div>
            ))}
            <button onClick={onViewTransfers} className="w-full pt-4 text-sm text-[#00A859] font-medium hover:underline text-center">View All Transfers</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const PersonnelView: React.FC<{ personnel: Personnel[]; onView: (id: string) => void }> = ({ personnel, onView }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = personnel.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.serviceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-[#D1D3D4]/50' : 'text-[#D1D3D4]'}`} size={18} />
          <input
            type="text"
            placeholder="Search service ID or name..."
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A859] outline-none ${isDarkMode ? 'bg-[#333333] border-[#333333] text-white placeholder-[#D1D3D4]/50' : 'bg-white border-[#D1D3D4]'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center space-x-2 bg-[#00A859] text-white px-4 py-2 rounded-lg hover:bg-[#008547] transition-colors">
          <UserPlus size={18} />
          <span className="font-medium">Add Personnel</span>
        </button>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#333333] border-[#333333]' : 'bg-white border-[#D1D3D4]'}`}>
        <table className="w-full text-left">
          <thead className={`border-b ${isDarkMode ? 'bg-[#1A1A1B]/30 border-[#D1D3D4]/10' : 'bg-[#D1D3D4]/20 border-[#D1D3D4]'}`}>
            <tr>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Service ID</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Name</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Rank</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Section</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Status</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase text-right ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-[#D1D3D4]/10' : 'divide-[#D1D3D4]/50'}`}>
            {filtered.map(p => (
              <tr key={p.id} className={`transition-colors ${isDarkMode ? 'hover:bg-[#1A1A1B]/30' : 'hover:bg-[#D1D3D4]/10'}`}>
                <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/80'}`}>{p.serviceId}</td>
                <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{p.firstName} {p.lastName}</td>
                <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/80'}`}>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${isDarkMode ? 'bg-[#1A1A1B] text-[#D1D3D4]' : 'bg-[#D1D3D4]/30'}`}>{p.rank}</span>
                </td>
                <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/80'}`}>{p.section}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'Active' ? 'bg-[#EF2B33]/10 text-[#EF2B33]' :
                    p.status === 'On Leave' ? 'bg-[#FDE910]/20 text-[#333333]' : 'bg-[#D1D3D4]/30 text-[#333333]'
                    }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onView(p.id)} className="text-[#00A859] hover:text-[#008547] font-medium text-sm">View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LeavesView: React.FC<{ leaves: LeaveRecord[], personnel: Personnel[] }> = ({ leaves, personnel }) => {
  const { isDarkMode } = useContext(ThemeContext);

  const getPersonnel = (id: string) => personnel.find(p => p.id === id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>Leave Management</h2>
        <button className="flex items-center justify-center space-x-2 bg-[#00A859] text-white px-4 py-2 rounded-lg hover:bg-[#008547] transition-colors">
          <Plus size={18} />
          <span className="font-medium">New Leave Request</span>
        </button>
      </div>

      <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#333333] border-[#333333]' : 'bg-white border-[#D1D3D4]'}`}>
        <table className="w-full text-left">
          <thead className={`border-b ${isDarkMode ? 'bg-[#1A1A1B]/30 border-[#D1D3D4]/10' : 'bg-[#D1D3D4]/20 border-[#D1D3D4]'}`}>
            <tr>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Service ID</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Name</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Leave Type</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Start Date</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Resumption Date</th>
              <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Status</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-[#D1D3D4]/10' : 'divide-[#D1D3D4]/50'}`}>
            {leaves.map(leave => {
              const person = getPersonnel(leave.personnelId);
              return (
                <tr key={leave.id} className={`transition-colors ${isDarkMode ? 'hover:bg-[#1A1A1B]/30' : 'hover:bg-[#D1D3D4]/10'}`}>
                  <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/80'}`}>{person?.serviceId || 'N/A'}</td>
                  <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{person ? `${person.firstName} ${person.lastName}` : 'Unknown'}</td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/80'}`}>{leave.type}</td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/80'}`}>{leave.startDate}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-[#00A859]' : 'text-[#00A859]'}`}>{leave.endDate}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${leave.status === 'Approved' ? 'bg-[#00A859]/10 text-[#00A859]' :
                      leave.status === 'Completed' ? 'bg-[#D1D3D4]/30 text-[#333333]' : 'bg-[#EF2B33]/10 text-[#EF2B33]'
                      }`}>
                      {leave.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RosterView: React.FC<{ personnel: Personnel[], initialDuties: DutyAssignment[] }> = ({ personnel, initialDuties }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [duties, setDuties] = useState<DutyAssignment[]>(initialDuties);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateRoster = async () => {
    setIsGenerating(true);
    try {
      // In a real app, we'd pass active leaves and past history
      const newRoster = await generateSmartRoster({
        personnel: personnel,
        leaves: [], // mock empty for simplicity
        pastDuties: duties,
        weekStartDate: new Date().toISOString().split('T')[0]
      });
      setDuties(prev => [...prev, ...newRoster]);
      alert("Successfully generated 1 week roster!");
    } catch (err) {
      alert("Failed to generate roster. Check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>Operational Duty Roster</h2>
        <button
          onClick={handleGenerateRoster}
          disabled={isGenerating}
          className="flex items-center space-x-2 bg-[#00A859] text-white px-4 py-2 rounded-lg hover:bg-[#008547] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
          <span className="font-medium">{isGenerating ? 'Computing AI Roster...' : 'Auto-Generate Week'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {/* Simple visual calendar view would go here */}
        <div className={`md:col-span-7 rounded-xl border shadow-sm overflow-x-auto ${isDarkMode ? 'bg-[#333333] border-[#333333]' : 'bg-white border-[#D1D3D4]'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'bg-[#1A1A1B]/30 border-[#D1D3D4]/10' : 'bg-[#D1D3D4]/20 border-[#D1D3D4]'}`}>
                <th className={`px-4 py-3 text-xs font-bold uppercase sticky left-0 ${isDarkMode ? 'bg-[#333333] text-[#D1D3D4]/70' : 'bg-[#F5F5F5] text-[#333333]/70'}`}>Duty Type</th>
                <th className={`px-4 py-3 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Mon</th>
                <th className={`px-4 py-3 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Tue</th>
                <th className={`px-4 py-3 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Wed</th>
                <th className={`px-4 py-3 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Thu</th>
                <th className={`px-4 py-3 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Fri</th>
                <th className={`px-4 py-3 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Sat</th>
                <th className={`px-4 py-3 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Sun</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-[#D1D3D4]/10' : 'divide-[#D1D3D4]/50'}`}>
              {Object.values(DutyType).map(type => (
                <tr key={type} className={`transition-colors ${isDarkMode ? 'hover:bg-[#1A1A1B]/30' : 'hover:bg-[#D1D3D4]/10'}`}>
                  <td className={`px-4 py-4 text-sm font-bold sticky left-0 shadow-sm ${isDarkMode ? 'bg-[#333333] text-white' : 'bg-white text-[#333333]'}`}>{type}</td>
                  {[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <td key={day} className="px-2 py-2 min-w-[120px]">
                      <div className="space-y-1">
                        <div className="p-1 rounded bg-[#00A859]/5 border border-[#00A859]/20">
                          <p className="text-[10px] font-bold text-[#00A859] uppercase">Day</p>
                          <p className={`text-[11px] font-medium truncate ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}`}>Staff Assigned</p>
                        </div>
                        <div className="p-1 rounded bg-[#1A1A1B]/5 border border-[#1A1A1B]/10">
                          <p className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/50' : 'text-[#333333]/50'}`}>Night</p>
                          <p className={`text-[11px] font-medium truncate ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}`}>Staff Assigned</p>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'personnel' | 'personnel-detail' | 'leaves' | 'rosters' | 'reports' | 'transfers'>('home');
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User>({ id: 'u1', username: 'admin_ops', role: 'Administrator' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // State for data
  const [personnelData, setPersonnelData] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPersonnel();
      setPersonnelData(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleViewPersonnel = (id: string) => {
    setSelectedPersonnelId(id);
    setActiveTab('personnel-detail');
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <Shield size={20} /> },
    { id: 'personnel', label: 'Personnel', icon: <Users size={20} /> },
    { id: 'leaves', label: 'Leave Mgmt', icon: <Calendar size={20} /> },
    { id: 'transfers', label: 'Transfers', icon: <ArrowRightLeft size={20} /> },
    { id: 'rosters', label: 'Duty Rosters', icon: <ClipboardList size={20} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
  ];

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`bg-[#1A1A1B] transition-all duration-300 fixed inset-y-0 left-0 z-50 w-64 overflow-hidden flex flex-col shadow-2xl md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button
            onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }}
            className="p-6 flex items-center space-x-3 mb-8 w-full text-left hover:bg-white/5 transition-colors"
          >
            <img src="images/LOGO.png" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-white tracking-tight">SENTINELS OPS</span>
          </button>

          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
              />
            ))}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 flex flex-col min-h-0 overflow-auto transition-colors ${isDarkMode ? 'bg-[#1A1A1B]' : 'bg-gray-50'}`}>
          <header className={`h-16 border-b px-8 flex items-center justify-between sticky top-0 z-10 transition-colors ${isDarkMode ? 'bg-[#333333] border-[#333333]' : 'bg-white border-[#D1D3D4]'}`}>
            <div className="flex items-center">
              <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden transition-colors mr-4 ${isDarkMode ? 'text-white hover:text-[#D1D3D4]' : 'text-[#333333] hover:text-[#1A1A1B]'}`}>
                <Menu size={24} />
              </button>
              {/* Logo for Desktop */}
              <button
                onClick={() => setActiveTab('home')}
                className="hidden md:flex items-center space-x-2 mr-8 hover:opacity-80 transition-opacity"
              >
                <img src="images/LOGO.png" alt="Logo" className="w-8 h-8 object-contain" />
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>SENTINELS</span>
              </button>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`text-sm font-medium transition-colors flex items-center space-x-2 ${activeTab === item.id ? 'text-[#00A859]' : `${isDarkMode ? 'text-[#D1D3D4] hover:text-[#00A859]' : 'text-[#333333] hover:text-[#00A859]'}`
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-[#1A1A1B] text-[#FDE910]' : 'bg-[#F5F5F5] text-[#333333]'}`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="text-right hidden sm:block">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{currentUser.username}</p>
                <p className={`text-xs ${isDarkMode ? 'text-[#D1D3D4]/60' : 'text-[#333333]/60'}`}>{currentUser.role}</p>
              </div>
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold ${isDarkMode ? 'bg-[#1A1A1B] border-[#333333] text-white' : 'bg-[#D1D3D4]/30 border-[#D1D3D4] text-[#333333]'}`}>
                AD
              </div>
              <button className={`transition-colors ml-2 ${isDarkMode ? 'text-[#D1D3D4] hover:text-[#EF2B33]' : 'text-[#333333] hover:text-[#EF2B33]'}`} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </header>

          <div className="p-8">
            {activeTab === 'home' && <HomeView />}
            {activeTab === 'dashboard' && (
              <DashboardView
                personnel={personnelData}
                leaves={mockLeaves}
                duties={mockDuties}
                onViewTransfers={() => setActiveTab('transfers')}
              />
            )}
            {activeTab === 'personnel' && <PersonnelView personnel={personnelData} onView={handleViewPersonnel} />}
            {activeTab === 'personnel-detail' && selectedPersonnelId && (
              <PersonnelDetailView
                personnel={personnelData.find(p => p.id === selectedPersonnelId)!}
                onBack={() => setActiveTab('personnel')}
              />
            )}
            {activeTab === 'transfers' && <TransfersView />}
            {activeTab === 'rosters' && <RosterView personnel={personnelData} initialDuties={mockDuties} />}
            {activeTab === 'leaves' && <LeavesView leaves={mockLeaves} personnel={personnelData} />}
            {activeTab === 'reports' && (
              <div className={`flex items-center justify-center h-64 border-2 border-dashed rounded-xl font-medium ${isDarkMode ? 'bg-[#333333]/50 border-[#333333] text-[#D1D3D4]' : 'bg-[#D1D3D4]/10 border-[#D1D3D4] text-[#D1D3D4]'}`}>
                Intelligence & Operational Reports Coming Soon
              </div>
            )}
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
