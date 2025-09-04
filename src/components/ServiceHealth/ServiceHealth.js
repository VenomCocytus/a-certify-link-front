import React from 'react';
import { Tag } from 'primereact/tag';
import './ServiceHealth.css';

const ServiceHealth = ({ statistics }) => {
    const getServiceStatus = () => {
        if (!statistics) {
            return {
                status: 'unknown',
                message: 'Checking service status...',
                severity: 'secondary'
            };
        }

        if (statistics.isAsaciData) {
            if (statistics.hasPartialData) {
                return {
                    status: 'partial',
                    message: 'ASACI services partially available',
                    severity: 'warning'
                };
            } else {
                return {
                    status: 'healthy',
                    message: 'All ASACI services operational',
                    severity: 'success'
                };
            }
        } else {
            return {
                status: 'unavailable',
                message: 'ASACI services unavailable - showing sample data',
                severity: 'danger'
            };
        }
    };

    const serviceStatus = getServiceStatus();

    const getStatusIcon = () => {
        switch (serviceStatus.status) {
            case 'healthy':
                return 'pi pi-check-circle';
            case 'partial':
                return 'pi pi-exclamation-triangle';
            case 'unavailable':
                return 'pi pi-times-circle';
            default:
                return 'pi pi-spin pi-spinner';
        }
    };

    return (
        <div className="service-health">
            <div className="flex align-items-center gap-2">
                <i className={`${getStatusIcon()} text-lg`}></i>
                <span className="text-sm font-medium">Service Status:</span>
                <Tag 
                    value={serviceStatus.message} 
                    severity={serviceStatus.severity}
                    className="service-status-tag"
                />
            </div>
        </div>
    );
};

export default ServiceHealth;