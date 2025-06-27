import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';

const ConfirmationDialog = ({
                                visible,
                                onHide,
                                onConfirm,
                                title = 'Confirm Action',
                                message = 'Are you sure you want to proceed?',
                                icon = 'pi pi-exclamation-triangle',
                                iconColor = 'text-orange-500',
                                confirmLabel = 'Confirm',
                                cancelLabel = 'Cancel',
                                confirmButtonClass = 'p-button-danger',
                                severity = 'warn',
                                requireReason = false,
                                reasonLabel = 'Reason (optional)',
                                reasonRequired = false,
                                reasonPlaceholder = 'Enter reason for this action...',
                                loading = false,
                                width = '450px'
                            }) => {
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState('');

    const handleConfirm = () => {
        if (requireReason && reasonRequired && !reason.trim()) {
            setReasonError('Reason is required');
            return;
        }

        onConfirm(reason.trim());
        setReason('');
        setReasonError('');
    };

    const handleCancel = () => {
        setReason('');
        setReasonError('');
        onHide();
    };

    const handleReasonChange = (e) => {
        setReason(e.target.value);
        if (reasonError) {
            setReasonError('');
        }
    };

    const getSeverityConfig = () => {
        const configs = {
            warn: {
                icon: 'pi pi-exclamation-triangle',
                iconColor: 'text-orange-500',
                confirmClass: 'p-button-warning'
            },
            error: {
                icon: 'pi pi-times-circle',
                iconColor: 'text-red-500',
                confirmClass: 'p-button-danger'
            },
            info: {
                icon: 'pi pi-info-circle',
                iconColor: 'text-blue-500',
                confirmClass: 'p-button-info'
            },
            success: {
                icon: 'pi pi-check-circle',
                iconColor: 'text-green-500',
                confirmClass: 'p-button-success'
            }
        };

        return configs[severity] || configs.warn;
    };

    const config = getSeverityConfig();

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button
                label={cancelLabel}
                icon="pi pi-times"
                className="p-button-text"
                onClick={handleCancel}
                disabled={loading}
            />
            <Button
                label={confirmLabel}
                icon="pi pi-check"
                className={confirmButtonClass || config.confirmClass}
                onClick={handleConfirm}
                loading={loading}
            />
        </div>
    );

    return (
        <Dialog
            header={title}
            visible={visible}
            onHide={handleCancel}
            footer={dialogFooter}
            style={{ width }}
            modal
            className="confirmation-dialog"
            closable={!loading}
            closeOnEscape={!loading}
        >
            <div className="confirmation-content">
                <div className="flex align-items-start gap-3 mb-4">
                    <i className={`${icon || config.icon} text-3xl ${iconColor || config.iconColor}`}></i>
                    <div className="flex-1">
                        <p className="text-900 font-medium mb-2">{message}</p>
                    </div>
                </div>

                {requireReason && (
                    <div className="field">
                        <label htmlFor="reason" className="block text-900 font-medium mb-2">
                            {reasonLabel}
                            {reasonRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <InputTextarea
                            id="reason"
                            value={reason}
                            onChange={handleReasonChange}
                            placeholder={reasonPlaceholder}
                            rows={3}
                            className={`w-full ${reasonError ? 'p-invalid' : ''}`}
                            disabled={loading}
                        />
                        {reasonError && (
                            <Message severity="error" text={reasonError} className="mt-1" />
                        )}
                    </div>
                )}
            </div>
        </Dialog>
    );
};

// Specialized confirmation dialogs
export const DeleteConfirmationDialog = (props) => (
    <ConfirmationDialog
        title="Delete Confirmation"
        message="Are you sure you want to delete this item? This action cannot be undone."
        icon="pi pi-trash"
        iconColor="text-red-500"
        confirmLabel="Delete"
        confirmButtonClass="p-button-danger"
        severity="error"
        {...props}
    />
);

export const CancelConfirmationDialog = (props) => (
    <ConfirmationDialog
        title="Cancel Confirmation"
        message="Are you sure you want to cancel this operation? Any unsaved changes will be lost."
        icon="pi pi-times"
        iconColor="text-orange-500"
        confirmLabel="Cancel Operation"
        confirmButtonClass="p-button-warning"
        severity="warn"
        requireReason={true}
        reasonLabel="Cancellation reason"
        {...props}
    />
);

export const SuspendConfirmationDialog = (props) => (
    <ConfirmationDialog
        title="Suspend Confirmation"
        message="Are you sure you want to suspend this item? It will be temporarily disabled."
        icon="pi pi-pause"
        iconColor="text-orange-500"
        confirmLabel="Suspend"
        confirmButtonClass="p-button-warning"
        severity="warn"
        requireReason={true}
        reasonLabel="Suspension reason"
        {...props}
    />
);

export const ApproveConfirmationDialog = (props) => (
    <ConfirmationDialog
        title="Approve Confirmation"
        message="Are you sure you want to approve this request?"
        icon="pi pi-check"
        iconColor="text-green-500"
        confirmLabel="Approve"
        confirmButtonClass="p-button-success"
        severity="success"
        {...props}
    />
);

export const RejectConfirmationDialog = (props) => (
    <ConfirmationDialog
        title="Reject Confirmation"
        message="Are you sure you want to reject this request?"
        icon="pi pi-times"
        iconColor="text-red-500"
        confirmLabel="Reject"
        confirmButtonClass="p-button-danger"
        severity="error"
        requireReason={true}
        reasonLabel="Rejection reason"
        reasonRequired={true}
        {...props}
    />
);

export const LogoutConfirmationDialog = (props) => (
    <ConfirmationDialog
        title="Logout Confirmation"
        message="Are you sure you want to logout from your account?"
        icon="pi pi-sign-out"
        iconColor="text-blue-500"
        confirmLabel="Logout"
        confirmButtonClass="p-button-info"
        severity="info"
        {...props}
    />
);

export default ConfirmationDialog;