import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { apiService } from '../../services/apiService';

const CertificateFilter = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        dateFrom: null,
        dateTo: null,
        certificateType: '',
        channel: '' // **NEW**: Added channel filter
    });

    const [certificateTypes, setCertificateTypes] = useState([]);
    const [expanded, setExpanded] = useState(false);

    // **UPDATED**: Status options based on API responses
    const statusOptions = [
        { label: 'All Status', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Sent to Storage', value: 'sent_to_storage' }, // **NEW**
        { label: 'Not Sent to Storage', value: 'not_sent_to_storage' } // **NEW**
    ];

    // **NEW**: Channel options
    const channelOptions = [
        { label: 'All Channels', value: '' },
        { label: 'Web', value: 'web' },
        { label: 'API', value: 'api' }
    ];

    // **UPDATED**: Certificate types based on API enum values
    const mockCertificateTypes = [
        { label: 'All Types', value: '' },
        { label: 'CIMA', value: 'cima' },
        { label: 'POOLTPV', value: 'pooltpv' },
        { label: 'MATCA', value: 'matca' },
        { label: 'POOLTPV BLEU', value: 'pooltpvbleu' }
    ];

    useEffect(() => {
        fetchCertificateTypes();
    }, []);

    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    const fetchCertificateTypes = async () => {
        try {
            const response = await apiService.getCertificateTypes();
            const types = response.data?.map(type => ({
                label: type.name || type.label,
                value: type.code || type.id || type.value
            })) || [];

            setCertificateTypes([
                { label: 'All Types', value: '' },
                ...types
            ]);
        } catch (error) {
            // Use mock data if API fails
            setCertificateTypes(mockCertificateTypes);
        }
    };

    const handleInputChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            status: '',
            dateFrom: null,
            dateTo: null,
            certificateType: '',
            channel: '' // **NEW**
        });
    };

    const hasActiveFilters = () => {
        return filters.search ||
            filters.status ||
            filters.dateFrom ||
            filters.dateTo ||
            filters.certificateType ||
            filters.channel; // **NEW**
    };

    const cardHeader = (
        <div className="flex justify-content-between align-items-center">
            <div className="flex align-items-center">
                <i className="pi pi-filter mr-2 text-primary"></i>
                <span className="font-semibold">Filters</span>
                {hasActiveFilters() && (
                    <span className="ml-2 p-badge p-badge-info">
            {Object.values(filters).filter(v => v).length}
          </span>
                )}
            </div>
            <div className="flex gap-2">
                {hasActiveFilters() && (
                    <Button
                        icon="pi pi-times"
                        className="p-button-text p-button-sm"
                        onClick={handleClearFilters}
                        tooltip="Clear all filters"
                    />
                )}
                <Button
                    icon={expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'}
                    className="p-button-text p-button-sm"
                    onClick={() => setExpanded(!expanded)}
                    tooltip={expanded ? 'Collapse filters' : 'Expand filters'}
                />
            </div>
        </div>
    );

    return (
        <Card header={cardHeader} className="filter-card">
            {/* Always visible: Search bar */}
            <div className="filter-search mb-3">
                <div className="p-inputgroup">
          <span className="p-inputgroup-addon">
            <i className="pi pi-search"></i>
          </span>
                    <InputText
                        placeholder="Search by reference, organization, office, or user name..." // **UPDATED**: Changed placeholder to match API data structure
                        value={filters.search}
                        onChange={(e) => handleInputChange('search', e.target.value)}
                        className="w-full"
                    />
                    {filters.search && (
                        <Button
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => handleInputChange('search', '')}
                        />
                    )}
                </div>
            </div>

            {/* Expandable filters */}
            {expanded && (
                <>
                    <Divider />
                    <div className="grid">
                        <div className="col-12 md:col-6 lg:col-3">
                            <div className="field">
                                <label htmlFor="status" className="block text-900 font-medium mb-2">
                                    Status
                                </label>
                                <Dropdown
                                    id="status"
                                    value={filters.status}
                                    options={statusOptions}
                                    onChange={(e) => handleInputChange('status', e.value)}
                                    placeholder="Select status"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6 lg:col-3">
                            <div className="field">
                                <label htmlFor="certificateType" className="block text-900 font-medium mb-2">
                                    Certificate Type
                                </label>
                                <Dropdown
                                    id="certificateType"
                                    value={filters.certificateType}
                                    options={certificateTypes}
                                    onChange={(e) => handleInputChange('certificateType', e.value)}
                                    placeholder="Select type"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* **NEW**: Channel filter */}
                        <div className="col-12 md:col-6 lg:col-3">
                            <div className="field">
                                <label htmlFor="channel" className="block text-900 font-medium mb-2">
                                    Channel
                                </label>
                                <Dropdown
                                    id="channel"
                                    value={filters.channel}
                                    options={channelOptions}
                                    onChange={(e) => handleInputChange('channel', e.value)}
                                    placeholder="Select channel"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6 lg:col-3">
                            <div className="field">
                                <label htmlFor="dateFrom" className="block text-900 font-medium mb-2">
                                    From Date
                                </label>
                                <Calendar
                                    id="dateFrom"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleInputChange('dateFrom', e.value)}
                                    placeholder="Select start date"
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6 lg:col-3">
                            <div className="field">
                                <label htmlFor="dateTo" className="block text-900 font-medium mb-2">
                                    To Date
                                </label>
                                <Calendar
                                    id="dateTo"
                                    value={filters.dateTo}
                                    onChange={(e) => handleInputChange('dateTo', e.value)}
                                    placeholder="Select end date"
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="w-full"
                                    minDate={filters.dateFrom}
                                />
                            </div>
                        </div>
                    </div>

                    {/* **UPDATED**: Quick filter buttons */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        <small className="text-600 mr-2 align-self-center">Quick filters:</small>
                        <Button
                            label="Sent to Storage"
                            size="small"
                            className={`p-button-outlined ${filters.status === 'sent_to_storage' ? 'p-button-success' : ''}`}
                            onClick={() => handleInputChange('status', filters.status === 'sent_to_storage' ? '' : 'sent_to_storage')}
                        />
                        <Button
                            label="Not Sent"
                            size="small"
                            className={`p-button-outlined ${filters.status === 'not_sent_to_storage' ? 'p-button-warning' : ''}`}
                            onClick={() => handleInputChange('status', filters.status === 'not_sent_to_storage' ? '' : 'not_sent_to_storage')}
                        />
                        <Button
                            label="Web Channel"
                            size="small"
                            className={`p-button-outlined ${filters.channel === 'web' ? 'p-button-info' : ''}`}
                            onClick={() => handleInputChange('channel', filters.channel === 'web' ? '' : 'web')}
                        />
                        <Button
                            label="This Month"
                            size="small"
                            className="p-button-outlined"
                            onClick={() => {
                                const now = new Date();
                                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                                handleInputChange('dateFrom', firstDay);
                                handleInputChange('dateTo', lastDay);
                            }}
                        />
                        <Button
                            label="Today"
                            size="small"
                            className="p-button-outlined"
                            onClick={() => {
                                const today = new Date();
                                handleInputChange('dateFrom', today);
                                handleInputChange('dateTo', today);
                            }}
                        />
                    </div>
                </>
            )}
        </Card>
    );
};

export default CertificateFilter;