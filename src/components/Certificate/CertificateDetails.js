import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { apiService } from '../../services/apiService';
import { useToast } from '../../contexts/ToastContext';

const CertificateDetails = ({ certificate, visible, onHide }) => {
    const [loading, setLoading] = useState(false);
    const [actionReason, setActionReason] = useState('');
    const { showSuccess, showError } = useToast();

    if (!certificate) return null;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF'
        }).format(value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-CM', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusSeverity = (status) => {
        const severityMap = {
            active: 'success',
            pending: 'warning',
            suspended: 'danger',
            cancelled: 'secondary'
        };
        return severityMap[status] || 'info';
    };

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await apiService.downloadCertificate(certificate.reference);
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
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = () => {
        confirmDialog({
            message: 'Are you sure you want to suspend this certificate?',
            header: 'Suspend Certificate',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-warning',
            accept: async () => {
                try {
                    await apiService.suspendCertificate(certificate.reference, actionReason);
                    showSuccess('Certificate suspended successfully');
                    onHide();
                } catch (error) {
                    showError('Failed to suspend certificate');
                }
            }
        });
    };

    const handleCancel = () => {
        confirmDialog({
            message: 'Are you sure you want to cancel this certificate? This action cannot be undone.',
            header: 'Cancel Certificate',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await apiService.cancelCertificate(certificate.reference, actionReason);
                    showSuccess('Certificate cancelled successfully');
                    onHide();
                } catch (error) {
                    showError('Failed to cancel certificate');
                }
            }
        });
    };

    const dialogHeader = (
        <div className="flex align-items-center">
            <i className="pi pi-file-pdf text-2xl mr-3 text-primary"></i>
            <div>
                <h3 className="m-0">Certificate Details</h3>
                <small className="text-600">{certificate.reference}</small>
            </div>
        </div>
    );

    const dialogFooter = (
        <div className="flex justify-content-between">
            <div className="flex gap-2">
                <Button
                    label="Download PDF"
                    icon="pi pi-download"
                    onClick={handleDownload}
                    loading={loading}
                />
            </div>
            <div className="flex gap-2">
                {certificate.status === 'active' && (
                    <>
                        <Button
                            label="Suspend"
                            icon="pi pi-pause"
                            className="p-button-warning"
                            onClick={handleSuspend}
                        />
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-danger"
                            onClick={handleCancel}
                        />
                    </>
                )}
                <Button
                    label="Close"
                    icon="pi pi-times"
                    className="p-button-text"
                    onClick={onHide}
                />
            </div>
        </div>
    );

    return (
        <>
            <Dialog
                header={dialogHeader}
                visible={visible}
                onHide={onHide}
                footer={dialogFooter}
                style={{ width: '90vw', maxWidth: '800px' }}
                modal
                className="certificate-details-dialog"
            >
                <TabView>
                    <TabPanel header="General Information" leftIcon="pi pi-info-circle mr-2">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <Card title="Certificate Information" className="h-full">
                                    <div className="field-group">
                                        <div className="field">
                                            <label className="font-semibold text-900">Reference:</label>
                                            <p className="mt-1 mb-3">{certificate.reference}</p>
                                        </div>
                                        <div className="field">
                                            <label className="font-semibold text-900">Policy Number:</label>
                                            <p className="mt-1 mb-3">{certificate.policyNumber}</p>
                                        </div>
                                        <div className="field">
                                            <label className="font-semibold text-900">Certificate Type:</label>
                                            <p className="mt-1 mb-3">{certificate.certificateType}</p>
                                        </div>
                                        <div className="field">
                                            <label className="font-semibold text-900">Status:</label>
                                            <div className="mt-1">
                                                <Tag
                                                    value={certificate.status?.toUpperCase()}
                                                    severity={getStatusSeverity(certificate.status)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <div className="col-12 md:col-6">
                                <Card title="Dates & Premium" className="h-full">
                                    <div className="field-group">
                                        <div className="field">
                                            <label className="font-semibold text-900">Issue Date:</label>
                                            <p className="mt-1 mb-3">{formatDate(certificate.issueDate)}</p>
                                        </div>
                                        <div className="field">
                                            <label className="font-semibold text-900">Expiry Date:</label>
                                            <p className="mt-1 mb-3">{formatDate(certificate.expiryDate)}</p>
                                        </div>
                                        <div className="field">
                                            <label className="font-semibold text-900">Premium:</label>
                                            <p className="mt-1 mb-3 text-2xl font-bold text-primary">
                                                {formatCurrency(certificate.premium)}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header="Policyholder" leftIcon="pi pi-user mr-2">
                        <Card title="Policyholder Information">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-semibold text-900">Full Name:</label>
                                        <p className="mt-1 mb-3 text-lg">{certificate.holderName}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Email:</label>
                                        <p className="mt-1 mb-3">{certificate.holderEmail || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Phone:</label>
                                        <p className="mt-1 mb-3">{certificate.holderPhone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-semibold text-900">Address:</label>
                                        <p className="mt-1 mb-3">{certificate.holderAddress || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">ID Number:</label>
                                        <p className="mt-1 mb-3">{certificate.holderIdNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabPanel>

                    <TabPanel header="Vehicle" leftIcon="pi pi-car mr-2">
                        <Card title="Vehicle Information">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-semibold text-900">Registration Number:</label>
                                        <p className="mt-1 mb-3 text-lg font-semibold">
                                            {certificate.vehicleRegistration}
                                        </p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Make:</label>
                                        <p className="mt-1 mb-3">{certificate.vehicleMake || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Model:</label>
                                        <p className="mt-1 mb-3">{certificate.vehicleModel || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-semibold text-900">Year:</label>
                                        <p className="mt-1 mb-3">{certificate.vehicleYear || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Chassis Number:</label>
                                        <p className="mt-1 mb-3">{certificate.vehicleChassisNumber || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Engine Number:</label>
                                        <p className="mt-1 mb-3">{certificate.vehicleEngineNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabPanel>

                    <TabPanel header="Actions" leftIcon="pi pi-cog mr-2">
                        <Card title="Certificate Actions">
                            <div className="field">
                                <label htmlFor="actionReason" className="block text-900 font-medium mb-2">
                                    Reason for Action (Optional)
                                </label>
                                <InputTextarea
                                    id="actionReason"
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    rows={4}
                                    className="w-full"
                                    placeholder="Enter reason for suspension or cancellation..."
                                />
                            </div>

                            <Divider />

                            <div className="flex flex-column gap-3">
                                <div className="flex align-items-center justify-content-between p-3 border-round surface-100">
                                    <div>
                                        <h4 className="m-0 text-900">Download Certificate</h4>
                                        <p className="mt-1 mb-0 text-600">Download the PDF version of this certificate</p>
                                    </div>
                                    <Button
                                        label="Download"
                                        icon="pi pi-download"
                                        onClick={handleDownload}
                                        loading={loading}
                                    />
                                </div>

                                {certificate.status === 'active' && (
                                    <>
                                        <div className="flex align-items-center justify-content-between p-3 border-round surface-100">
                                            <div>
                                                <h4 className="m-0 text-900">Suspend Certificate</h4>
                                                <p className="mt-1 mb-0 text-600">Temporarily suspend this certificate</p>
                                            </div>
                                            <Button
                                                label="Suspend"
                                                icon="pi pi-pause"
                                                className="p-button-warning"
                                                onClick={handleSuspend}
                                            />
                                        </div>

                                        <div className="flex align-items-center justify-content-between p-3 border-round surface-100">
                                            <div>
                                                <h4 className="m-0 text-900">Cancel Certificate</h4>
                                                <p className="mt-1 mb-0 text-600">Permanently cancel this certificate</p>
                                            </div>
                                            <Button
                                                label="Cancel"
                                                icon="pi pi-times"
                                                className="p-button-danger"
                                                onClick={handleCancel}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    </TabPanel>
                </TabView>
            </Dialog>

            <ConfirmDialog />
        </>
    );
};

export default CertificateDetails;