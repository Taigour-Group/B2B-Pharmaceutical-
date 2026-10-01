import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatters';
import { Search } from 'lucide-react';
export const AuditLogViewer = () => {
    const { auditLogs } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entityId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'ALL' || log.role === selectedRole;
        return matchesSearch && matchesRole;
    });
    return (<div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">
          Regulatory Operational Audit Trail
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable logging of critical administrative decisions, batch inventory modifications, and customer approvals.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
          <input type="text" placeholder="Search audit trail by user, action (e.g. ADJUST_STOCK, APPROVE), or entity..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"/>
        </div>

        <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none">
          <option value="ALL">All Staff Roles</option>
          <option value="admin">Super Admin</option>
          <option value="verification_officer">Verification Officer</option>
          <option value="inventory_staff">Inventory Staff</option>
          <option value="accountant">Accountant</option>
          <option value="pharmacy">Pharmacy Customer</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity & Reference</th>
                <th className="py-3 px-4">Previous Value</th>
                <th className="py-3 px-4">Updated Value</th>
                <th className="py-3 px-4 font-mono">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (<tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-slate-400 font-mono capitalize">{log.role.replace('_', ' ')}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{log.entity}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate max-w-xs">{log.entityId}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                    {log.oldValue || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] font-medium text-cyan-900 max-w-xs truncate">
                    {log.newValue || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {log.ipAddress || '103.119.144.1'}
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>

    </div>);
};
