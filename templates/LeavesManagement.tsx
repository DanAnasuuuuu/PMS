import React, { useState, useEffect, useContext } from 'react';
import { Plus, Check, X, Calendar, User, FileText, Filter } from 'lucide-react';
import { Personnel, LeaveRecord, LeaveFormData } from './types';
import { getLeaves, createLeave, approveLeave, rejectLeave, cancelLeave } from './api';

// Theme context (you'll need to import this from your App.tsx or pass it as prop)
const ThemeContext = React.createContext({ isDarkMode: false });

// AddLeaveModal Component
export const AddLeaveModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    personnel: Personnel[];
}> = ({ isOpen, onClose, onSuccess, personnel }) => {
    const { isDarkMode } = useContext(ThemeContext);
    const [formData, setFormData] = useState<LeaveFormData>({
        personnelId: '',
        leaveType: 'ANNUAL',
        startDate: '',
        endDate: '',
        resumptionDate: '',
        reason: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const leaveTypes = [
        { value: 'ANNUAL', label: 'Annual Leave' },
        { value: 'CASUAL', label: 'Casual Leave' },
        { value: 'SICK', label: 'Sick Leave' },
        { value: 'MATERNITY', label: 'Maternity Leave' },
        { value: 'PATERNITY', label: 'Paternity Leave' },
        { value: 'COMPASSIONATE', label: 'Compassionate Leave' },
        { value: 'STUDY', label: 'Study Leave' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await createLeave(formData);
            setFormData({
                personnelId: '',
                leaveType: 'ANNUAL',
                startDate: '',
                endDate: '',
                resumptionDate: '',
                reason: ''
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create leave request');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-[#1A1A1B]' : 'bg-white'}`}>
                <div className={`px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10 ${isDarkMode ? 'bg-[#1A1A1B] border-[#333333]' : 'bg-white border-[#D1D3D4]'}`}>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>New Leave Request</h3>
                    <button onClick={onClose} className={`${isDarkMode ? 'text-[#D1D3D4] hover:text-white' : 'text-[#333333] hover:text-[#EF2B33]'}`}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-[#EF2B33]/10 border border-[#EF2B33] text-[#EF2B33] px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}`}>Personnel *</label>
                        <select
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A859] outline-none ${isDarkMode ? 'bg-[#333333] border-[#333333] text-white' : 'bg-white border-[#D1D3D4]'}`}
                            value={formData.personnelId}
                            onChange={(e) => setFormData({ ...formData, personnelId: e.target.value })}
                        >
                            <option value="">Select Personnel</option>
                            {personnel.map(p => (
                                <option key={p.id} value={p.serviceId}>
                                    {p.serviceId} - {p.firstName} {p.lastName} ({p.rank})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}`}>Leave Type *</label>
                        <select
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A859] outline-none ${isDarkMode ? 'bg-[#333333] border-[#333333] text-white' : 'bg-white border-[#D1D3D4]'}`}
                            value={formData.leaveType}
                            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                        >
                            {leaveTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}`}>Start Date *</label>
                            <input
                                type="date"
                                required
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A859] outline-none ${isDarkMode ? 'bg-[#333333] border-[#333333] text-white' : 'bg-white border-[#D1D3D4]'}`}
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}`}>End Date *</label>
                            <input
                                type="date"
                                required
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A859] outline-none ${isDarkMode ? 'bg-[#333333] border-[#333333] text-white' : 'bg-white border-[#D1D3D4]'}`}
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}`}>Resumption Date (Optional)</label>
                        <input
                            type="date"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A859] outline-none ${isDarkMode ? 'bg-[#333333] border-[#333333] text-white' : 'bg-white border-[#D1D3D4]'}`}
                            value={formData.resumptionDate}
                            onChange={(e) => setFormData({ ...formData, resumptionDate: e.target.value })}
                        />
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#D1D3D4]/50' : 'text-[#333333]/50'}`}>Leave blank to auto-calculate</p>
                    </div>

                    <div>
                        <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}`}>Reason *</label>
                        <textarea
                            required
                            rows={4}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A859] outline-none resize-none ${isDarkMode ? 'bg-[#333333] border-[#333333] text-white' : 'bg-white border-[#D1D3D4]'}`}
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Enter reason for leave..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-[#333333] text-white hover:bg-[#1A1A1B]' : 'bg-[#D1D3D4]/30 text-[#333333] hover:bg-[#D1D3D4]/50'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-[#00A859] text-white rounded-lg font-medium hover:bg-[#008547] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Enhanced LeavesView Component
export const LeavesView: React.FC<{ personnel: Personnel[] }> = ({ personnel }) => {
    const { isDarkMode } = useContext(ThemeContext);
    const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [rejectingLeaveId, setRejectingLeaveId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchLeaves = async () => {
        setIsLoading(true);
        try {
            const filters = statusFilter ? { status: statusFilter } : undefined;
            const data = await getLeaves(filters);
            setLeaves(data);
        } catch (error) {
            console.error('Failed to fetch leaves:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [statusFilter]);

    const handleApprove = async (leaveId: number) => {
        try {
            await approveLeave(leaveId);
            fetchLeaves(); // Refresh list
        } catch (error: any) {
            alert(error.message || 'Failed to approve leave');
        }
    };

    const handleReject = async (leaveId: number) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        try {
            await rejectLeave(leaveId, rejectionReason);
            setRejectingLeaveId(null);
            setRejectionReason('');
            fetchLeaves(); // Refresh list
        } catch (error: any) {
            alert(error.message || 'Failed to reject leave');
        }
    };

    const handleCancel = async (leaveId: number) => {
        if (!confirm('Are you sure you want to cancel this leave?')) return;
        try {
            await cancelLeave(leaveId);
            fetchLeaves(); // Refresh list
        } catch (error: any) {
            alert(error.message || 'Failed to cancel leave');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-600';
            case 'APPROVED': return 'bg-[#00A859]/10 text-[#00A859]';
            case 'REJECTED': return 'bg-[#EF2B33]/10 text-[#EF2B33]';
            case 'CANCELLED': return 'bg-gray-500/10 text-gray-600';
            case 'COMPLETED': return 'bg-blue-500/10 text-blue-600';
            default: return 'bg-gray-500/10 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>Leave Management</h2>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A859] outline-none ${isDarkMode ? 'bg-[#333333] border-[#333333] text-white' : 'bg-white border-[#D1D3D4]'}`}
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="COMPLETED">Completed</option>
                    </select>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center space-x-2 bg-[#00A859] text-white px-4 py-2 rounded-lg hover:bg-[#008547] transition-colors"
                    >
                        <Plus size={18} />
                        <span className="font-medium">New Leave Request</span>
                    </button>
                </div>
            </div>

            {/* Leaves Table */}
            <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-[#333333] border-[#333333]' : 'bg-white border-[#D1D3D4]'}`}>
                {isLoading ? (
                    <div className="p-8 text-center">
                        <p className={isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}>Loading leaves...</p>
                    </div>
                ) : leaves.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className={isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}>No leave records found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={`border-b ${isDarkMode ? 'bg-[#1A1A1B]/30 border-[#D1D3D4]/10' : 'bg-[#D1D3D4]/20 border-[#D1D3D4]'}`}>
                                <tr>
                                    <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Personnel</th>
                                    <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Leave Type</th>
                                    <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Dates</th>
                                    <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Days</th>
                                    <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Status</th>
                                    <th className={`px-6 py-4 text-xs font-bold uppercase ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-[#D1D3D4]/10' : 'divide-[#D1D3D4]/50'}`}>
                                {leaves.map(leave => (
                                    <tr key={leave.id} className={`transition-colors ${isDarkMode ? 'hover:bg-[#1A1A1B]/30' : 'hover:bg-[#D1D3D4]/10'}`}>
                                        <td className={`px-6 py-4 ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>
                                            <div className="font-bold">{leave.personnelName}</div>
                                            <div className={`text-xs ${isDarkMode ? 'text-[#D1D3D4]/70' : 'text-[#333333]/70'}`}>{leave.personnelId}</div>
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/80'}`}>{leave.leaveType}</td>
                                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]/80'}`}>
                                            <div>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</div>
                                            <div className="text-xs text-[#00A859]">Resume: {new Date(leave.resumptionDate).toLocaleDateString()}</div>
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>{leave.daysCount}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(leave.status)}`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {leave.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(leave.id)}
                                                            className="p-2 bg-[#00A859] text-white rounded-lg hover:bg-[#008547] transition-colors"
                                                            title="Approve"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectingLeaveId(leave.id)}
                                                            className="p-2 bg-[#EF2B33] text-white rounded-lg hover:bg-[#d02029] transition-colors"
                                                            title="Reject"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {(leave.status === 'PENDING' || leave.status === 'APPROVED') && (
                                                    <button
                                                        onClick={() => handleCancel(leave.id)}
                                                        className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-[#333333] text-white hover:bg-[#1A1A1B]' : 'bg-[#D1D3D4]/30 text-[#333333] hover:bg-[#D1D3D4]/50'}`}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {rejectingLeaveId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`rounded-xl shadow-xl max-w-md w-full ${isDarkMode ? 'bg-[#1A1A1B]' : 'bg-white'}`}>
                        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-[#333333]' : 'border-[#D1D3D4]'}`}>
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#333333]'}`}>Reject Leave Request</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-[#D1D3D4]' : 'text-[#333333]'}`}>Reason for Rejection *</label>
                                <textarea
                                    rows={4}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A859] outline-none resize-none ${isDarkMode ? 'bg-[#333333] border-[#333333] text-white' : 'bg-white border-[#D1D3D4]'}`}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setRejectingLeaveId(null);
                                        setRejectionReason('');
                                    }}
                                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-[#333333] text-white hover:bg-[#1A1A1B]' : 'bg-[#D1D3D4]/30 text-[#333333] hover:bg-[#D1D3D4]/50'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleReject(rejectingLeaveId)}
                                    className="px-6 py-2 bg-[#EF2B33] text-white rounded-lg font-medium hover:bg-[#d02029] transition-colors"
                                >
                                    Reject Leave
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Leave Modal */}
            <AddLeaveModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchLeaves}
                personnel={personnel}
            />
        </div>
    );
};
