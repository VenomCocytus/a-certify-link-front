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
        certificateType: ''
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
            // Fetch certificates and statistics in parallel
            const [certsResponse, statsResponse] = await Promise.allSettled([
                apiService.getCertificates(),
                fetchStatistics()
            ]);

            if (certsResponse.status === 'fulfilled') {
                const certsData = certsResponse.value.data;
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

    const generateMockCertificates = () => [
        {
            id: '1',
            reference: 'CERT-2025-001',
            policyNumber: 'POL-456789',
            holderName: 'Jean Dupont',
            vehicleRegistration: 'CM-123-ABC',
            status: 'active',
            issueDate: '2025-01-15',
            expiryDate: '2025-12-15',
            certificateType: 'CIMA',
            premium: 125000
        },
        {
            id: '2',
            reference: 'CERT-2025-002',
            policyNumber: 'POL-456790',
            holderName: 'Marie Kouam',
            vehicleRegistration: 'CM-124-DEF',
            status: 'pending',
            issueDate: '2025-01-16',
            expiryDate: '2025-12-16',
            certificateType: 'POOLTPV',
            premium: 89000
        },
        {
            id: '3',
            reference: 'CERT-2025-003',
            policyNumber: 'POL-456791',
            holderName: 'Paul Mbarga',
            vehicleRegistration: 'CM-125-GHI',
            status: 'suspended',
            issueDate: '2025-01-14',
            expiryDate: '2025-12-14',
            certificateType: 'MATCA',
            premium: 156000
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

        // Apply search filter
        if (filters.search) {
            filtered = filtered.filter(cert =>
                cert.reference?.toLowerCase().includes(filters.search.toLowerCase()) ||
                cert.policyNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
                cert.holderName?.toLowerCase().includes(filters.search.toLowerCase()) ||
                cert.vehicleRegistration?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        // Apply status filter
        if (filters.status) {
            filtered = filtered.filter(cert => cert.status === filters.status);
        }

        // Apply certificate type filter
        if (filters.certificateType) {
            filtered = filtered.filter(cert => cert.certificateType === filters.certificateType);
        }

        // Apply date filters
        if (filters.dateFrom) {
            filtered = filtered.filter(cert => new Date(cert.issueDate) >= new Date(filters.dateFrom));
        }

        if (filters.dateTo) {
            filtered = filtered.filter(cert => new Date(cert.issueDate) <= new Date(filters.dateTo));
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

    const handleDownloadCertificate = async (certificate) => {
        try {
            const response = await apiService.downloadCertificate(certificate.reference);
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

    const statusBodyTemplate = (rowData) => {
        const severity = {
            active: 'success',
            pending: 'warning',
            suspended: 'danger',
            cancelled: 'secondary'
        };

        return (
            <Tag
                value={rowData.status?.toUpperCase()}
                severity={severity[rowData.status] || 'info'}
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

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF'
        }).format(value);
    };

    const premiumBodyTemplate = (rowData) => {
        return formatCurrency(rowData.premium);
    };

    const dateBodyTemplate = (rowData, field) => {
        return new Date(rowData[field.field]).toLocaleDateString('fr-CM');
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
                    <Card title="Certificate Distribution" className="h-full">
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
                                    <p className="m-0 font-medium">New certificate issued</p>
                                    <small className="text-500">2 hours ago</small>
                                </div>
                            </div>
                            <div className="flex align-items-center">
                                <i className="pi pi-check-circle text-green-500 mr-3"></i>
                                <div>
                                    <p className="m-0 font-medium">Order approved</p>
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

            {/* Certificates Table */}
            <div className="mt-4">
                <Card title="Certificates" className="certificate-table-card">
                    <DataTable
                        value={filteredCertificates}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="p-datatable-gridlines"
                        emptyMessage="No certificates found."
                        responsiveLayout="scroll"
                    >
                        <Column field="reference" header="Reference" sortable />
                        <Column field="policyNumber" header="Policy Number" sortable />
                        <Column field="holderName" header="Holder Name" sortable />
                        <Column field="vehicleRegistration" header="Vehicle" sortable />
                        <Column field="certificateType" header="Type" sortable />
                        <Column
                            field="premium"
                            header="Premium"
                            body={premiumBodyTemplate}
                            sortable
                        />
                        <Column field="status" header="Status" body={statusBodyTemplate} sortable />
                        <Column
                            field="issueDate"
                            header="Issue Date"
                            body={(rowData) => dateBodyTemplate(rowData, { field: 'issueDate' })}
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