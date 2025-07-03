import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

//TODO: Update the datatable to show relevant data and filter based on it
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
        channel: ''
    });

    const { showError, showSuccess } = useToast();

    // Memoize the generateMockCertificates function to prevent recreation
    const generateMockCertificates = useCallback(() => [
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
    ], []);

    // Memoize the generateMockStatistics function
    const generateMockStatistics = useCallback(() => ({
        usage: { total: 1245, thisMonth: 89 },
        available: { total: 456 },
        used: { total: 789, thisMonth: 123 }
    }), []);

    // Memoize the fetchStatistics function
    const fetchStatistics = useCallback(async () => {
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
    }, [generateMockStatistics]);

    // Memoize the generateChartData function
    const generateChartData = useCallback((stats) => {
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
    }, []);

    // Memoize the fetchDashboardData function
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [certsResponse, statsResponse] = await Promise.allSettled([
                apiService.getCertificates(),
                fetchStatistics()
            ]);

            if (certsResponse.status === 'fulfilled') {
                const certsData = certsResponse.value.data;
                const certificatesData = Array.isArray(certsData) ? certsData : certsData.data || [];
                setCertificates(certificatesData);
            } else {
                setCertificates(generateMockCertificates());
            }

            if (statsResponse.status === 'fulfilled') {
                setStatistics(statsResponse.value);
                generateChartData(statsResponse.value);
            } else {
                const mockStats = generateMockStatistics();
                setStatistics(mockStats);
                generateChartData(mockStats);
            }

        } catch (error) {
            showError('Failed to load dashboard data');
            setCertificates(generateMockCertificates());
            const mockStats = generateMockStatistics();
            setStatistics(mockStats);
            generateChartData(mockStats);
        } finally {
            setLoading(false);
        }
    }, [fetchStatistics, generateMockCertificates, generateMockStatistics, generateChartData, showError]);

    // Memoize the applyFilters function
    const applyFilters = useCallback(() => {
        let filtered = certificates;

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(cert =>
                cert.reference?.toLowerCase().includes(searchLower) ||
                cert.user?.name?.toLowerCase().includes(searchLower) ||
                cert.user?.email?.toLowerCase().includes(searchLower) ||
                cert.organization?.name?.toLowerCase().includes(searchLower) ||
                cert.organization?.code?.toLowerCase().includes(searchLower) ||
                cert.office?.name?.toLowerCase().includes(searchLower) ||
                cert.office?.code?.toLowerCase().includes(searchLower)
            );
        }

        if (filters.status) {
            if (filters.status === 'sent_to_storage') {
                filtered = filtered.filter(cert => cert.sent_to_storage === true);
            } else if (filters.status === 'not_sent_to_storage') {
                filtered = filtered.filter(cert => cert.sent_to_storage === false);
            }
        }

        if (filters.channel) {
            filtered = filtered.filter(cert => cert.channel === filters.channel);
        }

        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            filtered = filtered.filter(cert => new Date(cert.created_at) >= fromDate);
        }

        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            filtered = filtered.filter(cert => new Date(cert.created_at) <= toDate);
        }

        setFilteredCertificates(filtered);
    }, [certificates, filters]);

    // Fetch dashboard data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Apply filters when certificates or filters change
    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    // Memoize event handlers
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    const handleViewCertificate = useCallback((certificate) => {
        setSelectedCertificate(certificate);
        setShowDetails(true);
    }, []);

    const handleDownloadCertificate = useCallback(async (certificate) => {
        try {
            const response = await apiService.downloadCertificateExternal(certificate.reference);
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
    }, [showSuccess, showError]);

    const handleHideDetails = useCallback(() => {
        setShowDetails(false);
    }, []);

    // Memoize template functions to prevent recreation on every render
    const statusBodyTemplate = useCallback((rowData) => {
        const severity = rowData.sent_to_storage ? 'success' : 'warning';
        const value = rowData.sent_to_storage ? 'SENT TO STORAGE' : 'NOT SENT TO STORAGE';

        return (
            <Tag
                value={value}
                severity={severity}
            />
        );
    }, []);

    const channelBodyTemplate = useCallback((rowData) => {
        const severity = rowData.channel === 'web' ? 'info' : 'secondary';

        return (
            <Tag
                value={rowData.channel?.toUpperCase()}
                severity={severity}
            />
        );
    }, []);

    const actionBodyTemplate = useCallback((rowData) => {
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
    }, [handleViewCertificate, handleDownloadCertificate]);

    const dateBodyTemplate = useCallback((rowData) => {
        return rowData.formatted_created_at || new Date(rowData.created_at).toLocaleDateString('fr-CM');
    }, []);

    const userBodyTemplate = useCallback((rowData) => {
        return (
            <div>
                <div className="font-medium">{rowData.user?.name || 'N/A'}</div>
                <small className="text-500">{rowData.user?.email || ''}</small>
            </div>
        );
    }, []);

    const organizationBodyTemplate = useCallback((rowData) => {
        return (
            <div>
                <div className="font-medium">{rowData.organization?.name || 'N/A'}</div>
                <small className="text-500">{rowData.organization?.code || ''}</small>
            </div>
        );
    }, []);

    const officeBodyTemplate = useCallback((rowData) => {
        return (
            <div>
                <div className="font-medium">{rowData.office?.name || 'N/A'}</div>
                <small className="text-500">{rowData.office?.code || ''}</small>
            </div>
        );
    }, []);

    // Create Statistics Cards Component directly in Dashboard for better control
    const renderStatisticsCards = () => {
        if (!statistics) return null;

        const statsConfig = [
            {
                title: 'TOTAL CERTIFICATES',
                value: statistics.usage?.total || 0,
                change: `${statistics.usage?.thisMonth || 0} this month`,
                icon: 'pi pi-file',
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                isPositive: true
            },
            {
                title: 'AVAILABLE STOCK',
                value: statistics.available?.total || 0,
                change: 'Ready for issuance',
                icon: 'pi pi-box',
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                isPositive: true
            },
            {
                title: 'USED CERTIFICATES',
                value: statistics.used?.total || 0,
                change: `${statistics.used?.thisMonth || 0} this month`,
                icon: 'pi pi-check-circle',
                gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                isPositive: true
            },
            {
                title: 'PENDING ORDERS',
                value: 24,
                change: 'Awaiting approval',
                icon: 'pi pi-clock',
                gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                isPositive: false
            }
        ];

        return (
            <div className="grid">
                {statsConfig.map((stat, index) => (
                    <div key={index} className="col-12 md:col-6 lg:col-3">
                        <div className="statistics-card" style={{ background: stat.gradient }}>
                            <div className="flex justify-content-between align-items-start mb-3">
                                <div>
                                    <div className="statistics-title">{stat.title}</div>
                                    <div className="statistics-value">{stat.value}</div>
                                </div>
                                <div className="statistics-icon">
                                    <i className={stat.icon}></i>
                                </div>
                            </div>
                            <div className={`statistics-change ${stat.isPositive ? 'positive' : 'negative'}`}>
                                <i className={`pi ${stat.isPositive ? 'pi-arrow-up' : 'pi-arrow-down'} mr-1`}></i>
                                {stat.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Memoize static data to prevent recreation
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false
    }), []);

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
            {renderStatisticsCards()}

            {/* Charts Section */}
            <div className="grid mt-4">
                <div className="col-12 lg:col-6">
                    <Card title="Production Distribution" className="h-full">
                        {chartData ? (
                            <Chart
                                type="pie"
                                data={chartData}
                                options={chartOptions}
                                className="w-full md:w-30rem"
                            />
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
                                    <p className="m-0 font-medium">New production created</p>
                                    <small className="text-500">2 hours ago</small>
                                </div>
                            </div>
                            <div className="flex align-items-center">
                                <i className="pi pi-check-circle text-green-500 mr-3"></i>
                                <div>
                                    <p className="m-0 font-medium">Production sent to storage</p>
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

            {/* Productions Table */}
            <div className="mt-4">
                <Card title="Productions" className="certificate-table-card">
                    <DataTable
                        value={filteredCertificates}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="p-datatable-gridlines custom-datatable"
                        emptyMessage="No productions found."
                        dataKey="id"
                        sortMode="single"
                        removableSort
                    >
                        <Column field="reference" header="Reference" sortable />
                        <Column field="quantity" header="Quantity" sortable />
                        <Column field="channel" header="Channel" body={channelBodyTemplate} sortable />
                        <Column header="User" body={userBodyTemplate} sortable />
                        <Column header="Organization" body={organizationBodyTemplate} sortable />
                        <Column header="Office" body={officeBodyTemplate} sortable />
                        <Column field="sent_to_storage" header="Storage Status" body={statusBodyTemplate} sortable />
                        <Column
                            field="created_at"
                            header="Created At"
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
                onHide={handleHideDetails}
            />
        </div>
    );
};

export default Dashboard;