import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import CertificateFilter from '../Certificate/CertificateFilter';
import CertificateDetails from '../Certificate/CertificateDetails';
import StatisticsCards from '../Statistics/StatisticsCards';
import { apiService } from '../../services/apiService';
import { useToast } from '../../contexts/ToastContext';
import './Dashboard.css';

const Dashboard = () => {
    const [certificates, setCertificates] = useState([]);
    const [filteredCertificates, setFilteredCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        dateFrom: null,
        dateTo: null,
        certificateType: '',
        channel: '' // **NEW**: Added channel filter
    });

    const { showError, showSuccess } = useToast();

    // Fetch dashboard data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Apply filters when certificates or filters change
    useEffect(() => {
        applyFilters();
    }, [certificates, filters]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // **UPDATED**: Fetch productions instead of certificates and statistics in parallel
            const [certsResponse, statsResponse] = await Promise.allSettled([
                apiService.getCertificates(), // This now calls /productions endpoint
                fetchStatistics()
            ]);

            if (certsResponse.status === 'fulfilled') {
                const certsData = certsResponse.value.data;
                // **UPDATED**: Handle the new API response structure
                setCertificates(Array.isArray(certsData) ? certsData : certsData.data || []);
            } else {
                // Use mock data if API fails
                setCertificates(generateMockCertificates());
            }

            if (statsResponse.status === 'fulfilled') {
                setStatistics(statsResponse.value);
                generateChartData(statsResponse.value);
            }

        } catch (error) {
            showError('Failed to load dashboard data');
            // Use mock data as fallback
            setCertificates(generateMockCertificates());
            setStatistics(generateMockStatistics());
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const [usage, available, used] = await Promise.all([
                apiService.getCertificateStats().catch(() => null),
                apiService.getAvailableStats().catch(() => null),
                apiService.getUsedStats().catch(() => null)
            ]);

            return {
                usage: usage?.data || { total: 0, thisMonth: 0 },
                available: available?.data || { total: 0 },
                used: used?.data || { total: 0, thisMonth: 0 }
            };
        } catch (error) {
            return generateMockStatistics();
        }
    };

    const generateMockStatistics = () => ({
        usage: { total: 1245, thisMonth: 89 },
        available: { total: 456 },
        used: { total: 789, thisMonth: 123 }
    });

    // **UPDATED**: Generate mock data based on new API structure
    const generateMockCertificates = () => [
        {
            id: 'pro_jD6z3EdvdG7yV',
            reference: 'PROD-072025-F70BF81A1E',
            sent_to_storage: false,
            channel: 'web',
            download_link: 'https://example.com/download/1',
            created_at: '2025-07-02T13:16:01.000000Z',
            quantity: 1,
            formatted_created_at: '02/07/2025 13:16',
            user: {
                id: 'user_123',
                email: 'admin@example.com',
                name: 'Admin User',
                telephone: '237640154'
            },
            organization: {
                id: 'org_123',
                code: 'TEST_ORG',
                name: 'Test Organization',
                email: 'test@org.com'
            },
            office: {
                id: 'off_123',
                code: 'TEST_OFFICE_001',
                name: 'Main Office',
                address: 'Test Address'
            }
        }
    ];

    const generateChartData = (stats) => {
        const data = {
            labels: ['Available', 'Used', 'Pending'],
            datasets: [
                {
                    data: [
                        stats?.available?.total || 456,
                        stats?.used?.total || 789,
                        100
                    ],
                    backgroundColor: [
                        '#36A2EB',
                        '#4BC0C0',
                        '#FFCE56'
                    ],
                    hoverBackgroundColor: [
                        '#36A2EB',
                        '#4BC0C0',
                        '#FFCE56'
                    ]
                }
            ]
        };
        setChartData(data);
    };

    const applyFilters = () => {
        let filtered = certificates;

        // **UPDATED**: Apply search filter based on new data structure
        if (filters.search) {
            filtered = filtered.filter(cert =>
                cert.reference?.toLowerCase().includes(filters.search.toLowerCase()) ||
                cert.user?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                cert.user?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
                cert.organization?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                cert.organization?.code?.toLowerCase().includes(filters.search.toLowerCase()) ||
                cert.office?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                cert.office?.code?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        // **UPDATED**: Apply status filter based on storage status
        if (filters.status) {
            if (filters.status === 'sent_to_storage') {
                filtered = filtered.filter(cert => cert.sent_to_storage === true);
            } else if (filters.status === 'not_sent_to_storage') {
                filtered = filtered.filter(cert => cert.sent_to_storage === false);
            }
        }

        // **NEW**: Apply channel filter
        if (filters.channel) {
            filtered = filtered.filter(cert => cert.channel === filters.channel);
        }

        // Apply date filters
        if (filters.dateFrom) {
            filtered = filtered.filter(cert => new Date(cert.created_at) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            filtered = filtered.filter(cert => new Date(cert.created_at) <= new Date(filters.dateTo));
        }

        setFilteredCertificates(filtered);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleViewCertificate = (certificate) => {
        setSelectedCertificate(certificate);
        setShowDetails(true);
    };

    // **UPDATED**: Download certificate with new API structure
    const handleDownloadCertificate = async (certificate) => {
        try {
            const response = await apiService.downloadCertificateExternal(certificate.reference);
            // Create blob and download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Certificate-${certificate.reference}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            showSuccess('Certificate downloaded successfully');
        } catch (error) {
            showError('Failed to download certificate');
        }
    };

    // **UPDATED**: Status template based on storage status
    const statusBodyTemplate = (rowData) => {
        const severity = rowData.sent_to_storage ? 'success' : 'warning';
        const value = rowData.sent_to_storage ? 'SENT TO STORAGE' : 'NOT SENT TO STORAGE';

        return (
            <Tag
                value={value}
                severity={severity}
            />
        );
    };

    // **NEW**: Channel template
    const channelBodyTemplate = (rowData) => {
        const severity = rowData.channel === 'web' ? 'info' : 'secondary';

        return (
            <Tag
                value={rowData.channel?.toUpperCase()}
                severity={severity}
            />
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-text p-button-sm"
                    onClick={() => handleViewCertificate(rowData)}
                    tooltip="View Details"
                />
                <Button
                    icon="pi pi-download"
                    className="p-button-rounded p-button-text p-button-sm"
                    onClick={() => handleDownloadCertificate(rowData)}
                    tooltip="Download Certificate"
                />
            </div>
        );
    };

    // **UPDATED**: Date template using created_at
    const dateBodyTemplate = (rowData) => {
        return rowData.formatted_created_at || new Date(rowData.created_at).toLocaleDateString('fr-CM');
    };

    // **NEW**: User template
    const userBodyTemplate = (rowData) => {
        return (
            <div>
                <div className="font-medium">{rowData.user?.name || 'N/A'}</div>
                <small className="text-500">{rowData.user?.email || ''}</small>
            </div>
        );
    };

    // **NEW**: Organization template
    const organizationBodyTemplate = (rowData) => {
        return (
            <div>
                <div className="font-medium">{rowData.organization?.name || 'N/A'}</div>
                <small className="text-500">{rowData.organization?.code || ''}</small>
            </div>
        );
    };

    // **NEW**: Office template
    const officeBodyTemplate = (rowData) => {
        return (
            <div>
                <div className="font-medium">{rowData.office?.name || 'N/A'}</div>
                <small className="text-500">{rowData.office?.code || ''}</small>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="grid">
                    <div className="col-12">
                        <Card>
                            <div className="flex justify-content-center">
                                <ProgressSpinner />
                            </div>
                            <p className="text-center mt-3">Loading dashboard...</p>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Statistics Cards */}
            <StatisticsCards statistics={statistics} />

            {/* Charts Section */}
            <div className="grid mt-4">
                <div className="col-12 lg:col-6">
                    <Card title="Production Distribution" className="h-full"> {/* **UPDATED**: Changed title */}
                        {chartData ? (
                            <Chart type="pie" data={chartData} className="w-full md:w-30rem" />
                        ) : (
                            <Skeleton height="300px" />
                        )}
                    </Card>
                </div>
                <div className="col-12 lg:col-6">
                    <Card title="Recent Activity" className="h-full">
                        <div className="flex flex-column gap-3">
                            <div className="flex align-items-center">
                                <i className="pi pi-file-pdf text-blue-500 mr-3"></i>
                                <div>
                                    <p className="m-0 font-medium">New production created</p> {/* **UPDATED** */}
                                    <small className="text-500">2 hours ago</small>
                                </div>
                            </div>
                            <div className="flex align-items-center">
                                <i className="pi pi-check-circle text-green-500 mr-3"></i>
                                <div>
                                    <p className="m-0 font-medium">Production sent to storage</p> {/* **UPDATED** */}
                                    <small className="text-500">4 hours ago</small>
                                </div>
                            </div>
                            <div className="flex align-items-center">
                                <i className="pi pi-clock text-orange-500 mr-3"></i>
                                <div>
                                    <p className="m-0 font-medium">Production pending</p>
                                    <small className="text-500">6 hours ago</small>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Filters */}
            <div className="mt-4">
                <CertificateFilter onFilterChange={handleFilterChange} />
            </div>

            {/* **UPDATED**: Productions Table */}
            <div className="mt-4">
                <Card title="Productions" className="certificate-table-card"> {/* **UPDATED**: Changed title */}
                    <DataTable
                        value={filteredCertificates}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="p-datatable-gridlines"
                        emptyMessage="No productions found." // **UPDATED**
                    >
                        <Column field="reference" header="Reference" sortable />
                        <Column field="quantity" header="Quantity" sortable /> {/* **NEW** */}
                        <Column field="channel" header="Channel" body={channelBodyTemplate} sortable /> {/* **NEW** */}
                        <Column header="User" body={userBodyTemplate} sortable /> {/* **NEW** */}
                        <Column header="Organization" body={organizationBodyTemplate} sortable /> {/* **NEW** */}
                        <Column header="Office" body={officeBodyTemplate} sortable /> {/* **NEW** */}
                        <Column field="sent_to_storage" header="Storage Status" body={statusBodyTemplate} sortable /> {/* **UPDATED** */}
                        <Column
                            field="created_at"
                            header="Created At" // **UPDATED**
                            body={dateBodyTemplate}
                            sortable
                        />
                        <Column body={actionBodyTemplate} header="Actions" style={{width: '120px'}} />
                    </DataTable>
                </Card>
            </div>

            {/* Certificate Details Dialog */}
            <CertificateDetails
                certificate={selectedCertificate}
                visible={showDetails}
                onHide={() => setShowDetails(false)}
            />
        </div>
    );
};

export default Dashboard;