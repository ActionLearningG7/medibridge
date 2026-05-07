import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Card, Button, Badge, Input } from '../../ui';
import { FileText, Download, Eye, Search, Calendar, Loader, AlertCircle, ShieldCheck, ChevronRight, Inbox, Filter, FileCheck, ArrowRight, User } from 'lucide-react';
import { useGetPatientReportsQuery } from '../../features/lab/labApi';
import { useFileDownload } from '../../hooks/useFileDownload';

export default function MyReports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const { downloadFile } = useFileDownload();

  const { data: reportsData = [], isLoading, error } = useGetPatientReportsQuery();

  const filteredReports = reportsData.filter(order =>
    (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.testName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDownload = async (result) => {
    try {
      setDownloadError(null);
      setDownloadingId(result.labOrderId || result.resultId);

      if (result.labOrderId) {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) throw new Error('Auth session expired');

        const response = await fetch(`/api/v1/reports/${result.labOrderId}/download`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf,image/*,*/*',
          },
        });

        if (!response.ok) throw new Error(`Download failed: ${response.status}`);
        const blob = await response.blob();
        if (blob.size === 0) throw new Error('File integrity check failed');

        const contentDisposition = response.headers.get('content-disposition');
        let filename = result.fileName || `report-${result.labOrderId}.pdf`;

        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) filename = match[1];
        }

        downloadFile(blob, filename);
      } else if (result.fileUrl) {
        window.open(result.fileUrl, '_blank');
      }
    } catch (err) {
      setDownloadError(err.message || 'Transmission error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = (result) => {
    if (result.fileUrl) {
      window.open(result.fileUrl, '_blank');
    } else if (result.labOrderId) {
      window.open(`/api/v1/reports/${result.labOrderId}/download`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-10 w-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Accessing Vault...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Card className="max-w-md w-full p-12 rounded-[3.5rem] border-none shadow-2xl text-center">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Security Breach</h2>
          <p className="text-gray-500 font-medium mb-10">We encountered an encryption error while accessing your records.</p>
          <Button onClick={() => window.location.reload()} className="w-full h-14 rounded-2xl bg-primary-600">Re-authenticate</Button>
        </Card>
      </div>
    );
  }

  const reportsCount = reportsData.reduce((sum, order) => sum + (order.results?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary-600 font-bold text-[10px] uppercase tracking-widest mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Medical Record Vault
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Diagnostic Results</h1>
              <p className="text-gray-500 font-medium mt-3">Verified clinical reports and analysis documents</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-gray-50 px-6 py-3 rounded-2xl border-2 border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Authenticated Records</p>
                <p className="text-xl font-black text-gray-900 leading-none">{reportsCount}</p>
              </div>
              <Button
                onClick={() => navigate('/patient/labs/orders')}
                variant="outline"
                className="h-12 border-2 border-gray-900 text-gray-900 font-black text-[10px] uppercase tracking-widest rounded-2xl px-6 hover:bg-gray-900 hover:text-white"
              >
                Track Live Orders
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Side Control */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <Filter className="w-4 h-4 text-primary-500" />
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Filter Vault</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ID or Test Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 bg-gray-50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div className="p-8 bg-primary-900 rounded-[2.5rem] text-white space-y-6 shadow-xl shadow-primary-900/10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black leading-tight tracking-tight">Report Integrity Verified</h4>
              <p className="text-[11px] font-medium text-primary-100 leading-relaxed opacity-70">
                All documents are cryptographically signed by our partner laboratories and meet global health data standards.
              </p>
            </div>
          </aside>

          {/* Main List */}
          <main className="lg:col-span-3">
            <div className="space-y-8">
              {filteredReports.map((order) => (
                <div key={order.id} className="bg-white rounded-[3rem] border-2 border-gray-50 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-500 group">
                  {/* Order Meta Header */}
                  <div className="px-10 py-8 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 group-hover:bg-primary-50/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Manifest: {order.orderNumber}</span>
                        <div className="w-1 h-1 rounded-full bg-primary-200" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formatDate(order.orderDate)}</span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">{order.testName}</h3>
                    </div>
                    <Badge variant="success" className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm">
                      {order.results?.length || 0} Documents Ready
                    </Badge>
                  </div>

                  {/* Files List */}
                  <div className="divide-y divide-gray-50">
                    {order.results?.map((result) => (
                      <div key={result.resultId} className="p-10 hover:bg-gray-50/30 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                          <div className="flex items-start gap-6 flex-1">
                            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-gray-50 shadow-sm flex items-center justify-center shrink-0 group/icon">
                              <FileText className="w-8 h-8 text-primary-600 transition-transform group-hover/icon:scale-110" />
                            </div>

                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <h4 className="font-black text-gray-900 tracking-tight text-lg">{result.fileName}</h4>
                                {result.isLatest ? (
                                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest">Authenticated</span>
                                ) : (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Version {result.version}</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                                <div className="flex items-center gap-2">
                                  <Inbox className="w-3.5 h-3.5 text-gray-300" />
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formatFileSize(result.fileSize)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-gray-300" />
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Released by {result.uploadedByName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formatDate(result.uploadedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => handleView(result)}
                              className="h-14 w-14 rounded-2xl border-2 border-gray-100 hover:border-primary-100 p-0 flex items-center justify-center shrink-0 group-hover:bg-white"
                            >
                              <Eye className="w-5 h-5 text-gray-400 hover:text-primary-600" />
                            </Button>
                            <Button
                              size="lg"
                              onClick={() => handleDownload(result)}
                              disabled={downloadingId === (result.labOrderId || result.resultId)}
                              className="h-14 px-8 rounded-2xl bg-gray-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-gray-900/10"
                            >
                              {downloadingId === (result.labOrderId || result.resultId) ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              Download
                            </Button>
                          </div>
                        </div>
                        {downloadError && downloadingId === (result.labOrderId || result.resultId) && (
                          <div className="mt-4 p-4 bg-red-50 rounded-xl flex items-center gap-3 text-red-600 text-[10px] font-black uppercase tracking-widest">
                            <AlertCircle className="w-4 h-4" />
                            {downloadError}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredReports.length === 0 && (
                <div className="bg-white rounded-[3.5rem] p-24 text-center border-2 border-gray-50 shadow-sm animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                    <Inbox className="w-12 h-12 text-gray-200" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Records Missing</h3>
                  <p className="text-gray-400 font-medium mb-12 max-w-sm mx-auto leading-relaxed">
                    {searchTerm
                      ? `No records found matching "${searchTerm}". Please verify your search parameters.`
                      : 'Your diagnostic repository is currently empty. Reports will appear here once laboratory analysis is completed.'}
                  </p>
                  <Button onClick={() => navigate('/patient/labs/orders')} className="h-16 px-12 rounded-2xl bg-primary-600 hover:bg-primary-700 font-black text-xs uppercase tracking-widest flex items-center gap-3 mx-auto shadow-xl shadow-primary-200">
                    Check Order Progress
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
