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
    const [downloadLoading, setDownloadLoading] = useState({
        external: false,
        database: false
    });
    const [actionReason, setActionReason] = useState('');
    const { showSuccess, showError } = useToast();

    if (!certificate) {
        return null;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-CM', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // **UPDATED**: Get status severity based on API structure
    const getStatusSeverity = (sentToStorage) => {
        return sentToStorage ? 'success' : 'warning';
    };

    const getStatusLabel = (sentToStorage) => {
        return sentToStorage ? 'SENT TO STORAGE' : 'NOT SENT TO STORAGE';
    };

    // **NEW**: Download from external API using production reference
    const handleDownloadExternal = async () => {
        setDownloadLoading(prev => ({ ...prev, external: true }));
        try {
            const response = await apiService.downloadCertificateExternal(certificate.reference);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Certificate-${certificate.reference}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            showSuccess('Certificate downloaded successfully from external API');
        } catch (error) {
            showError('Failed to download certificate from external API');
        } finally {
            setDownloadLoading(prev => ({ ...prev, external: false }));
        }
    };

    // **NEW**: Download from database (gets download link first)
    const handleDownloadFromDatabase = async () => {
        setDownloadLoading(prev => ({ ...prev, database: true }));
        try {
            // First get the download link from database
            const linkResponse = await apiService.downloadCertificateLinkFromDb(certificate.reference);

            if (linkResponse.data?.data?.downloadLink) {
                // Use the provided download link
                const link = document.createElement('a');
                link.href = linkResponse.data.data.downloadLink;
                link.download = `Certificate-${certificate.reference}.pdf`;
                link.click();
                showSuccess('Certificate downloaded successfully from database');
            } else {
                showError('Download link not available in database');
            }
        } catch (error) {
            // Fallback to direct certificate download
            try {
                const response = await apiService.downloadCertificateByReference(certificate.reference);
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Certificate-${certificate.reference}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
                showSuccess('Certificate downloaded successfully');
            } catch (fallbackError) {
                showError('Failed to download certificate from database');
            }
        } finally {
            setDownloadLoading(prev => ({ ...prev, database: false }));
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
                <h3 className="m-0">Production Details</h3> {/* **UPDATED**: Changed from Certificate to Production */}
                <small className="text-600">{certificate.reference}</small>
            </div>
        </div>
    );

    const dialogFooter = (
        <div className="flex justify-content-between">
            <div className="flex gap-2">
                {/* **NEW**: Two download options */}
                <Button
                    label="Download from API"
                    icon="pi pi-download"
                    onClick={handleDownloadExternal}
                    loading={downloadLoading.external}
                    tooltip="Download directly from external API"
                />
                <Button
                    label="Download from DB"
                    icon="pi pi-database"
                    className="p-button-outlined"
                    onClick={handleDownloadFromDatabase}
                    loading={downloadLoading.database}
                    tooltip="Download from database (if available)"
                />
            </div>
            <div className="flex gap-2">
                {!certificate.sent_to_storage && ( // **UPDATED**: Only show actions if not sent to storage
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
                                <Card title="Production Information" className="h-full"> {/* **UPDATED**: Changed title */}
                                    <div className="field-group">
                                        <div className="field">
                                            <label className="font-semibold text-900">Reference:</label>
                                            <p className="mt-1 mb-3">{certificate.reference}</p>
                                        </div>
                                        <div className="field">
                                            <label className="font-semibold text-900">Quantity:</label> {/* **NEW** */}
                                            <p className="mt-1 mb-3">{certificate.quantity}</p>
                                        </div>
                                        <div className="field">
                                            <label className="font-semibold text-900">Channel:</label> {/* **NEW** */}
                                            <p className="mt-1 mb-3">
                                                <Tag value={certificate.channel?.toUpperCase()}
                                                     severity={certificate.channel === 'web' ? 'info' : 'secondary'} />
                                            </p>
                                        </div>
                                        <div className="field">
                                            <label className="font-semibold text-900">Storage Status:</label> {/* **UPDATED** */}
                                            <div className="mt-1">
                                                <Tag
                                                    value={getStatusLabel(certificate.sent_to_storage)}
                                                    severity={getStatusSeverity(certificate.sent_to_storage)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <div className="col-12 md:col-6">
                                <Card title="Creation Details" className="h-full"> {/* **UPDATED**: Changed title */}
                                    <div className="field-group">
                                        <div className="field">
                                            <label className="font-semibold text-900">Created At:</label> {/* **UPDATED** */}
                                            <p className="mt-1 mb-3">{formatDate(certificate.created_at)}</p>
                                        </div>
                                        <div className="field">
                                            <label className="font-semibold text-900">Formatted Date:</label> {/* **NEW** */}
                                            <p className="mt-1 mb-3">{certificate.formatted_created_at}</p>
                                        </div>
                                        <div className="field">
                                            <label className="font-semibold text-900">Download Link:</label> {/* **NEW** */}
                                            <p className="mt-1 mb-3">
                                                {certificate.download_link ? (
                                                    <span className="text-green-500">✓ Available</span>
                                                ) : (
                                                    <span className="text-red-500">✗ Not Available</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabPanel>

                    {/* **NEW**: User Information Tab */}
                    <TabPanel header="User Information" leftIcon="pi pi-user mr-2">
                        <Card title="Created By">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-semibold text-900">Full Name:</label>
                                        <p className="mt-1 mb-3 text-lg">{certificate.user?.name || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Email:</label>
                                        <p className="mt-1 mb-3">{certificate.user?.email || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Phone:</label>
                                        <p className="mt-1 mb-3">{certificate.user?.telephone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-semibold text-900">Username:</label>
                                        <p className="mt-1 mb-3">{certificate.user?.username || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">User Status:</label>
                                        <p className="mt-1 mb-3">
                                            <Tag value={certificate.user?.is_disabled ? 'DISABLED' : 'ACTIVE'}
                                                 severity={certificate.user?.is_disabled ? 'danger' : 'success'} />
                                        </p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Account Created:</label>
                                        <p className="mt-1 mb-3">{certificate.user?.formatted_created_at || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabPanel>

                    {/* **NEW**: Organization Information Tab */}
                    <TabPanel header="Organization" leftIcon="pi pi-building mr-2">
                        <Card title="Organization Details">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-semibold text-900">Organization Name:</label>
                                        <p className="mt-1 mb-3 text-lg">{certificate.organization?.name || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Code:</label>
                                        <p className="mt-1 mb-3">{certificate.organization?.code || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Email:</label>
                                        <p className="mt-1 mb-3">{certificate.organization?.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-semibold text-900">Address:</label>
                                        <p className="mt-1 mb-3">{certificate.organization?.address || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Phone:</label>
                                        <p className="mt-1 mb-3">{certificate.organization?.telephone || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Status:</label>
                                        <p className="mt-1 mb-3">
                                            <Tag value={certificate.organization?.is_disabled ? 'DISABLED' : 'ACTIVE'}
                                                 severity={certificate.organization?.is_disabled ? 'danger' : 'success'} />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabPanel>

                    {/* **NEW**: Office Information Tab */}
                    <TabPanel header="Office" leftIcon="pi pi-home mr-2">
                        <Card title="Office Details">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-semibold text-900">Office Name:</label>
                                        <p className="mt-1 mb-3 text-lg">{certificate.office?.name || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Code:</label>
                                        <p className="mt-1 mb-3">{certificate.office?.code || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Email:</label>
                                        <p className="mt-1 mb-3">{certificate.office?.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="font-semibold text-900">Address:</label>
                                        <p className="mt-1 mb-3">{certificate.office?.address || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Phone:</label>
                                        <p className="mt-1 mb-3">{certificate.office?.telephone || 'N/A'}</p>
                                    </div>
                                    <div className="field">
                                        <label className="font-semibold text-900">Master Office:</label>
                                        <p className="mt-1 mb-3">
                                            <Tag value={certificate.office?.is_master_office ? 'YES' : 'NO'}
                                                 severity={certificate.office?.is_master_office ? 'info' : 'secondary'} />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabPanel>

                    <TabPanel header="Actions" leftIcon="pi pi-cog mr-2">
                        <Card title="Production Actions"> {/* **UPDATED**: Changed title */}
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
                                        <h4 className="m-0 text-900">Download from External API</h4> {/* **NEW** */}
                                        <p className="mt-1 mb-0 text-600">Download directly from the external production API</p>
                                    </div>
                                    <Button
                                        label="Download"
                                        icon="pi pi-download"
                                        onClick={handleDownloadExternal}
                                        loading={downloadLoading.external}
                                    />
                                </div>

                                <div className="flex align-items-center justify-content-between p-3 border-round surface-100">
                                    <div>
                                        <h4 className="m-0 text-900">Download from Database</h4> {/* **NEW** */}
                                        <p className="mt-1 mb-0 text-600">Download using stored database link (if available)</p>
                                    </div>
                                    <Button
                                        label="Download"
                                        icon="pi pi-database"
                                        className="p-button-outlined"
                                        onClick={handleDownloadFromDatabase}
                                        loading={downloadLoading.database}
                                    />
                                </div>

                                {!certificate.sent_to_storage && ( // **UPDATED**: Only show actions if not sent to storage
                                    <>
                                        <div className="flex align-items-center justify-content-between p-3 border-round surface-100">
                                            <div>
                                                <h4 className="m-0 text-900">Suspend Production</h4> {/* **UPDATED** */}
                                                <p className="mt-1 mb-0 text-600">Temporarily suspend this production</p>
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
                                                <h4 className="m-0 text-900">Cancel Production</h4> {/* **UPDATED** */}
                                                <p className="mt-1 mb-0 text-600">Permanently cancel this production</p>
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