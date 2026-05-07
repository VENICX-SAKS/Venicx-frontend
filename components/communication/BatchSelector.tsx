'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { api } from '../../lib/api';

interface CompletedBatch {
  id: string;
  filename: string;
  partner_name: string | null;
  record_type: string;
  total_rows: number;
  created_at: string;
  contactable_sms: number;
  contactable_email: number;
}

interface BatchSelectorProps {
  channel: 'sms' | 'email';
  selectedBatchIds: string[];
  onSelectionChange: (batchIds: string[]) => void;
  onContactableCountChange: (count: number) => void;
  messageContent?: string;
  emailSubject?: string;
}

export function BatchSelector({ 
  channel, 
  selectedBatchIds, 
  onSelectionChange, 
  onContactableCountChange,
  messageContent,
  emailSubject
}: BatchSelectorProps) {
  const [batches, setBatches] = useState<CompletedBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'batches' | 'partners'>('batches');

  useEffect(() => {
    const loadBatches = async () => {
      try {
        setLoading(true);
        const response = await api.get<CompletedBatch[]>('/api/v1/ingestion/batches/completed');
        setBatches(response);
      } catch (err) {
        setError('Failed to load batches');
        console.error('Error loading batches:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, []);

  useEffect(() => {
    const totalContactable = batches
      .filter(batch => selectedBatchIds.includes(batch.id))
      .reduce((sum, batch) => {
        return sum + (channel === 'sms' ? batch.contactable_sms : batch.contactable_email);
      }, 0);
    
    onContactableCountChange(totalContactable);
  }, [selectedBatchIds, batches, channel, onContactableCountChange]);

  const partners = Array.from(new Set(
    batches
      .map(b => b.partner_name)
      .filter(Boolean)
  )) as string[];

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (batch.partner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesPartner = partnerFilter === 'all' || batch.partner_name === partnerFilter;
    return matchesSearch && matchesPartner;
  });

  const batchesByPartner = partners.reduce((acc, partner) => {
    acc[partner] = batches.filter(b => b.partner_name === partner);
    return acc;
  }, {} as Record<string, CompletedBatch[]>);

  const handleBatchToggle = (batchId: string) => {
    const newSelection = selectedBatchIds.includes(batchId)
      ? selectedBatchIds.filter(id => id !== batchId)
      : [...selectedBatchIds, batchId];
    onSelectionChange(newSelection);
  };

  const handlePartnerToggle = (partner: string) => {
    const partnerBatchIds = batchesByPartner[partner].map(b => b.id);
    const allSelected = partnerBatchIds.every(id => selectedBatchIds.includes(id));
    
    if (allSelected) {
      const newSelection = selectedBatchIds.filter(id => !partnerBatchIds.includes(id));
      onSelectionChange(newSelection);
    } else {
      const newSelection = [...new Set([...selectedBatchIds, ...partnerBatchIds])];
      onSelectionChange(newSelection);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getContactableCount = (batch: CompletedBatch) => {
    return channel === 'sms' ? batch.contactable_sms : batch.contactable_email;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Spinner className="mr-2" />
          Loading batches...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600">{error}</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Select Batches to Target</h3>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'batches' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('batches')}
            >
              By Batch
            </Button>
            <Button
              variant={viewMode === 'partners' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('partners')}
            >
              By Partner
            </Button>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search batches or partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {viewMode === 'batches' && (
            <div>
              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Partners</option>
                {partners.map(partner => (
                  <option key={partner} value={partner}>{partner}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedBatchIds.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              {selectedBatchIds.length} batch{selectedBatchIds.length !== 1 ? 'es' : ''} selected • 
              {batches
                .filter(b => selectedBatchIds.includes(b.id))
                .reduce((sum, b) => sum + getContactableCount(b), 0).toLocaleString()
              } contactable recipients ({channel.toUpperCase()})
            </p>
          </div>
        )}

        <div className="max-h-96 overflow-y-auto space-y-2">
          {viewMode === 'batches' ? (
            filteredBatches.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No batches found</p>
            ) : (
              filteredBatches.map(batch => {
                const isSelected = selectedBatchIds.includes(batch.id);
                const contactableCount = getContactableCount(batch);
                
                return (
                  <div
                    key={batch.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleBatchToggle(batch.id)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleBatchToggle(batch.id)}
                        className="mr-3"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{batch.filename}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              batch.record_type === 'customer'
                                ? 'bg-blue-50 text-blue-600'
                                : batch.record_type === 'business'
                                ? 'bg-purple-50 text-purple-600'
                                : 'bg-green-50 text-green-600'
                            }`}>
                              {batch.record_type || 'Customer'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(batch.created_at)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {batch.partner_name && (
                            <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-2">
                              {batch.partner_name}
                            </span>
                          )}
                          <span>{batch.total_rows.toLocaleString()} total</span>
                          <span className="mx-2">•</span>
                          <span className="font-medium text-green-600">
                            {contactableCount.toLocaleString()} contactable
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            partners.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No partners found</p>
            ) : (
              partners.map(partner => {
                const partnerBatches = batchesByPartner[partner];
                const totalContactable = partnerBatches.reduce((sum, b) => sum + getContactableCount(b), 0);
                const partnerBatchIds = partnerBatches.map(b => b.id);
                const allSelected = partnerBatchIds.every(id => selectedBatchIds.includes(id));
                const someSelected = partnerBatchIds.some(id => selectedBatchIds.includes(id));
                
                return (
                  <div key={partner} className="border rounded-md">
                    <div
                      className={`p-3 cursor-pointer transition-colors ${
                        allSelected 
                          ? 'bg-blue-50 border-blue-500' 
                          : someSelected 
                          ? 'bg-blue-25 border-blue-300'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handlePartnerToggle(partner)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = someSelected && !allSelected;
                          }}
                          onChange={() => handlePartnerToggle(partner)}
                          className="mr-3"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{partner}</h4>
                            <span className="text-sm text-gray-500">
                              {partnerBatches.length} batch{partnerBatches.length !== 1 ? 'es' : ''}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium text-green-600">
                              {totalContactable.toLocaleString()} contactable ({channel.toUpperCase()})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>

      {/* Message Preview */}
      {messageContent && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Message Preview
          </p>
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            {messageContent.length > 160
              ? `${messageContent.slice(0, 160)}...`
              : messageContent}
          </p>
          {messageContent.length > 0 && (
            <p className="text-xs text-slate-400 mt-2">
              {messageContent.length} characters ·{' '}
              {messageContent.length <= 160 ? '1 SMS' : `${Math.ceil(messageContent.length / 153)} SMS`}
            </p>
          )}
        </div>
      )}

      {/* Email Subject Preview */}
      {emailSubject && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Subject Preview
          </p>
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            {emailSubject}
          </p>
        </div>
      )}
    </Card>
  );
}
