import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Steps } from 'primereact/steps';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Panel } from 'primereact/panel';
import { apiService } from '../../services/apiService';
import { useToast } from '../../contexts/ToastContext';
import './CreateEdition.css';
import {useNavigate} from "react-router-dom";

const CreateEdition = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [policyData, setPolicyData] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [successDialog, setSuccessDialog] = useState(false);
    const [editionResult, setEditionResult] = useState(null);
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    // Step 1: Search Policy
    const [searchForm, setSearchForm] = useState({
        policyNumber: '',
        endorsementNumber: '',
        applicantCode: ''
    });

    // Step 2: Edition Form - Only notification field is editable
    const [editionForm, setEditionForm] = useState({
        emailNotification: ''
    });

    const steps = [
        { label: 'Search Policy' },
        { label: 'Configure Edition' },
        { label: 'Review & Submit' }
    ];

    const handleSearchPolicy = async () => {
        if (!searchForm.policyNumber || !searchForm.endorsementNumber || !searchForm.applicantCode) {
            showError('Please fill in all search fields');
            return;
        }

        setSearchLoading(true);
        setValidationErrors({});

        try {
            // const response = await apiService.searchOrassPolicies({
            //     policyNumber: searchForm.policyNumber,
            //     endorsementNumber: searchForm.endorsementNumber,
            //     applicantCode: searchForm.applicantCode,
            //     limit: 1
            // });
            // console.log(response);

            // Mocked response as requested
            const response = {
                data: {
                    data: [{
                        policyNumber: "1006310001640",
                        officeCode: "ASACI_ACTIVA_1001",
                        organizationCode: "ASACI_ACTIVA",
                        certificateType: "cima",
                        emailNotification: "notifications@example.com",
                        generatedBy: "01JYM40ESBJPFHY4AVJBTXVJVE",
                        channel: "web",
                        certificateColor: "cima-jaune",
                        premiumRC: 25000,
                        vehicleEnergy: "SEDI",
                        vehicleChassisNumber: "VF1KM0B0H58123456",
                        vehicleModel: "TOYOTA CAMRY 2023",
                        vehicleGenre: "GV01",
                        vehicleCategory: "01",
                        vehicleUsage: "UV01",
                        vehicleBrand: "FIAT",
                        vehicleType: "TV01",
                        vehicleSeats: 5,
                        subscriberType: "ST01",
                        subscriberPhone: "+237690123456",
                        subscriberPoBox: "BP 1234",
                        subscriberEmail: "souscripteur@example.com",
                        subscriberName: "MARTIN DUPONT",
                        insuredPhone: "+237691234567",
                        insuredPoBox: "BP 5678",
                        insuredName: "JEAN MARTIN",
                        insuredEmail: "assure@example.com",
                        vehicleRegistrationNumber: "LT-123-AK",
                        policyEffectiveDate: "2028-07-10",
                        policyExpiryDate: "2029-07-09",
                        vehicleFiscalPower: 8,
                        vehicleUsefulLoad: 500,
                        fleetReduction: 6,
                        rNum: 1,
                        opATD: null
                    }]
                }
            };

            if (response.data?.data && response.data.data.length > 0) {
                const policy = response.data.data[0];
                setPolicyData(policy);
                setActiveIndex(1);
                showSuccess('Policy found successfully!');
            } else {
                showError('No policy found with the provided details');
            }
        } catch (error) {
            showError('Failed to search policy. Please check your inputs and try again.');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleCreateEdition = async () => {
        if (!policyData) {
            showError('No policy data available');
            return;
        }

        setLoading(true);
        setValidationErrors({});

        try {
            // Create edition request using policy data directly
            const editionRequest = {
                policyNumber: policyData.policyNumber || searchForm.policyNumber,
                organizationCode: policyData.organizationCode,
                officeCode: policyData.officeCode,
                certificateType: policyData.certificateType,
                emailNotification: editionForm.emailNotification,
                generatedBy: policyData.generatedBy || 'Web Interface',
                channel: policyData.channel || 'web',
                certificateColor: policyData.certificateColor,

                // All other fields come from policy data
                subscriberName: policyData.subscriberName || '',
                subscriberPhone: policyData.subscriberPhone || '',
                subscriberEmail: policyData.subscriberEmail || '',
                subscriberPoBox: policyData.subscriberPoBox || '',
                insuredName: policyData.insuredName || policyData.subscriberName || '',
                insuredPhone: policyData.insuredPhone || policyData.subscriberPhone || '',
                insuredEmail: policyData.insuredEmail || policyData.subscriberEmail || '',
                insuredPoBox: policyData.insuredPoBox || policyData.subscriberPoBox || '',
                vehicleRegistrationNumber: policyData.vehicleRegistrationNumber || '',
                vehicleChassisNumber: policyData.vehicleChassisNumber || '',
                vehicleBrand: policyData.vehicleBrand || '',
                vehicleModel: policyData.vehicleModel || '',
                vehicleType: policyData.vehicleType || 'UV01',
                vehicleCategory: policyData.vehicleCategory || 'UV01',
                vehicleUsage: policyData.vehicleUsage || 'UV01',
                vehicleGenre: policyData.vehicleGenre || 'UV01',
                vehicleEnergy: policyData.vehicleEnergy || 'UV01',
                vehicleSeats: policyData.vehicleSeats || 5,
                vehicleFiscalPower: policyData.vehicleFiscalPower || 7,
                vehicleUsefulLoad: policyData.vehicleUsefulLoad || 0,
                fleetReduction: policyData.fleetReduction || 0,
                subscriberType: policyData.subscriberType || 'UV01',
                premiumRC: policyData.premiumRC || 50000,
                policyEffectiveDate: policyData.policyEffectiveDate || new Date().toISOString().split('T')[0],
                policyExpiryDate: policyData.policyExpiryDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
                rNum: policyData.rNum || 1,
                opATD: policyData.opATD || ''
            };

            const response = await apiService.createEditionRequest(editionRequest);

            // Set success data and show a dialog
            setEditionResult(response.data);
            setSuccessDialog(true);

        } catch (error) {
            // Handle validation errors
            if (error.response?.status === 400 && error.response?.data?.details?.validationErrors) {
                const errors = error.response.data.details.validationErrors;
                setValidationErrors(errors);

                // Show the first few validation errors in toast
                const errorMessages = Object.entries(errors).slice(0, 3).map(([field, message]) =>
                    `${field}: ${message}`
                ).join('\n');

                showError(`Validation errors:\n${errorMessages}`);
            }
            else if (error.response?.status === 422 && error.response?.data?.details) {
                const errorMessage = error.response.data.details;
                showError(`Validation errors:\n${errorMessage}`);
            }
            // Handling axios response errors
            else if (error.response?.status === 422) {
                const errorMessage =
                    error.response.data?.message ||
                    error.response.data?.detail ||
                    'An external service validation error occurred (422).';
                showError(`External service error:\n${errorMessage}`);
            }
            else {
                showError(error.response?.data?.message || 'Failed to create edition request');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = async (downloadLink) => {
        try {
            // Open download link in new tab
            window.open(downloadLink, '_blank');
            showSuccess('Certificate download initiated');
        } catch (error) {
            showError('Failed to download certificate');
        }
    };

    const resetForm = () => {
        setActiveIndex(0);
        setPolicyData(null);
        setValidationErrors({});
        setEditionResult(null);
        setSuccessDialog(false);
        setSearchForm({
            policyNumber: '',
            endorsementNumber: '',
            applicantCode: ''
        });
        setEditionForm({
            emailNotification: ''
        });
    };

    const formatPolicyData = (data) => {
        if (!data) return {};

        return {
            'Policy Number': data.policyNumber || 'N/A',
            'Organization Code': data.organizationCode || 'N/A',
            'Office Code': data.officeCode || 'N/A',
            'Certificate Type': data.certificateType || 'N/A',
            'Certificate Color': data.certificateColor || 'N/A',
            'Subscriber Name': data.subscriberName || 'N/A',
            'Vehicle Registration': data.vehicleRegistrationNumber || 'N/A',
            'Vehicle Brand': data.vehicleBrand || 'N/A',
            'Vehicle Model': data.vehicleModel || 'N/A',
            'Premium RC': data.premiumRC ? `${data.premiumRC} XAF` : 'N/A',
            'Effective Date': data.policyEffectiveDate || 'N/A',
            'Expiry Date': data.policyExpiryDate || 'N/A'
        };
    };

    // Step 1: Search Policy
    const renderSearchStep = () => (
        <Card title="Search ORASS Policy" className="create-edition-card">
            <p className="text-600 mb-4">
                Enter the policy details to search for an existing ORASS policy.
            </p>

            <div className="grid">
                <div className="col-12 md:col-4">
                    <div className="field">
                        <label htmlFor="policyNumber" className="block text-900 font-medium mb-2">
                            Policy Number *
                        </label>
                        <InputText
                            id="policyNumber"
                            value={searchForm.policyNumber}
                            onChange={(e) => setSearchForm(prev => ({ ...prev, policyNumber: e.target.value }))}
                            placeholder="Enter policy number"
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="col-12 md:col-4">
                    <div className="field">
                        <label htmlFor="endorsementNumber" className="block text-900 font-medium mb-2">
                            Endorsement Number *
                        </label>
                        <InputText
                            id="endorsementNumber"
                            value={searchForm.endorsementNumber}
                            onChange={(e) => setSearchForm(prev => ({ ...prev, endorsementNumber: e.target.value }))}
                            placeholder="Enter endorsement number"
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="col-12 md:col-4">
                    <div className="field">
                        <label htmlFor="applicantCode" className="block text-900 font-medium mb-2">
                            Applicant Code *
                        </label>
                        <InputText
                            id="applicantCode"
                            value={searchForm.applicantCode}
                            onChange={(e) => setSearchForm(prev => ({ ...prev, applicantCode: e.target.value }))}
                            placeholder="Enter applicant code"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-content-end mt-4">
                <Button
                    label="Search Policy"
                    icon="pi pi-search"
                    onClick={handleSearchPolicy}
                    loading={searchLoading}
                    disabled={!searchForm.policyNumber || !searchForm.endorsementNumber || !searchForm.applicantCode}
                />
            </div>
        </Card>
    );

    // Step 2: Configure Edition - Only notification field editable
    const renderConfigureStep = () => (
        <div className="grid">
            <div className="col-12 lg:col-8">
                <Card title="Edition Configuration" className="create-edition-card h-full">
                    {/* Validation Errors Display */}
                    {Object.keys(validationErrors).length > 0 && (
                        <Panel header="Validation Errors" className="mb-4" toggleable>
                            <div className="validation-errors">
                                {Object.entries(validationErrors).map(([field, message]) => (
                                    <Message
                                        key={field}
                                        severity="error"
                                        text={`${field}: ${message}`}
                                        className="mb-2"
                                    />
                                ))}
                            </div>
                        </Panel>
                    )}

                    <div className="grid">
                        {/* Read-only fields from policy data */}
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="block text-900 font-medium mb-2">
                                    Organization Code
                                </label>
                                <InputText
                                    value={policyData?.organizationCode || ''}
                                    className="w-full"
                                    disabled
                                />
                                <small className="text-500">From policy data</small>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="block text-900 font-medium mb-2">
                                    Office Code
                                </label>
                                <InputText
                                    value={policyData?.officeCode || ''}
                                    className="w-full"
                                    disabled
                                />
                                <small className="text-500">From policy data</small>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="block text-900 font-medium mb-2">
                                    Certificate Type
                                </label>
                                <InputText
                                    value={policyData?.certificateType?.toUpperCase() || ''}
                                    className="w-full"
                                    disabled
                                />
                                <small className="text-500">From policy data</small>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="block text-900 font-medium mb-2">
                                    Certificate Color
                                </label>
                                <InputText
                                    value={policyData?.certificateColor || ''}
                                    className="w-full"
                                    disabled
                                />
                                <small className="text-500">From policy data</small>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="block text-900 font-medium mb-2">
                                    Channel
                                </label>
                                <InputText
                                    value={policyData?.channel || 'web'}
                                    className="w-full"
                                    disabled
                                />
                                <small className="text-500">From policy data</small>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="block text-900 font-medium mb-2">
                                    Generated By
                                </label>
                                <InputText
                                    value={policyData?.generatedBy || 'Web Interface'}
                                    className="w-full"
                                    disabled
                                />
                                <small className="text-500">From policy data</small>
                            </div>
                        </div>

                        {/* Only editable field */}
                        <div className="col-12">
                            <div className="field">
                                <label htmlFor="emailNotification" className="block text-900 font-medium mb-2">
                                    Email Notification
                                </label>
                                <InputText
                                    id="emailNotification"
                                    type="email"
                                    value={editionForm.emailNotification}
                                    onChange={(e) => setEditionForm(prev => ({ ...prev, emailNotification: e.target.value }))}
                                    placeholder="Enter notification email"
                                    className="w-full"
                                />
                                <small className="text-500">This is the only editable field</small>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-12 lg:col-4">
                <Card title="Policy Information" className="create-edition-card h-full">
                    {policyData ? (
                        <div className="policy-info">
                            {Object.entries(formatPolicyData(policyData)).map(([key, value]) => (
                                <div key={key} className="field">
                                    <label className="block text-600 font-medium mb-1">{key}:</label>
                                    <span className="text-900">{value}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Message severity="info" text="No policy data available" />
                    )}
                </Card>
            </div>
        </div>
    );

    // Step 3: Review & Submit
    const renderReviewStep = () => (
        <Card title="Review Edition Request" className="create-edition-card">
            <div className="grid">
                <div className="col-12 md:col-6">
                    <h4 className="text-900 mb-3">Edition Configuration</h4>
                    <div className="review-section">
                        <div className="field">
                            <span className="font-medium">Organization Code:</span>
                            <span className="ml-2">{policyData?.organizationCode}</span>
                        </div>
                        <div className="field">
                            <span className="font-medium">Office Code:</span>
                            <span className="ml-2">{policyData?.officeCode}</span>
                        </div>
                        <div className="field">
                            <span className="font-medium">Certificate Type:</span>
                            <Tag value={policyData?.certificateType?.toUpperCase()} className="ml-2" />
                        </div>
                        <div className="field">
                            <span className="font-medium">Certificate Color:</span>
                            <Tag value={policyData?.certificateColor} severity="info" className="ml-2" />
                        </div>
                        <div className="field">
                            <span className="font-medium">Channel:</span>
                            <span className="ml-2">{policyData?.channel || 'web'}</span>
                        </div>
                        {editionForm.emailNotification && (
                            <div className="field">
                                <span className="font-medium">Email Notification:</span>
                                <span className="ml-2">{editionForm.emailNotification}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-12 md:col-6">
                    <h4 className="text-900 mb-3">Policy Information</h4>
                    <div className="review-section">
                        {Object.entries(formatPolicyData(policyData)).map(([key, value]) => (
                            <div key={key} className="field">
                                <span className="font-medium">{key}:</span>
                                <span className="ml-2">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Divider />

            <div className="flex justify-content-between">
                <Button
                    label="Back"
                    icon="pi pi-arrow-left"
                    className="p-button-outlined"
                    onClick={() => setActiveIndex(1)}
                />
                <Button
                    label="Create Edition Request"
                    icon="pi pi-check"
                    onClick={handleCreateEdition}
                    loading={loading}
                />
            </div>
        </Card>
    );

    // Success Dialog with Certificate Preview
    const renderSuccessDialog = () => {
        const certificate = editionResult?.data?.asaciResult?.data?.certificates?.[0];

        return (
            <Dialog
                header="Certificate Created Successfully"
                visible={successDialog}
                style={{ width: '600px' }}
                modal
                onHide={() => setSuccessDialog(false)}
                footer={
                    <div className="flex justify-content-between">
                        <Button
                            label="Create Another"
                            icon="pi pi-plus"
                            className="p-button-outlined"
                            onClick={() => {
                                setSuccessDialog(false);
                                resetForm();
                            }}
                        />
                        <div className="flex gap-2">
                            {certificate?.download_link && (
                                <Button
                                    label="Download Certificate"
                                    icon="pi pi-download"
                                    onClick={() => handleDownloadCertificate(certificate.download_link)}
                                />
                            )}
                            <Button
                                label="Close"
                                icon="pi pi-times"
                                className="p-button-outlined"
                                onClick={() => {
                                    setSuccessDialog(false);
                                    navigate('/dashboard');
                                }}
                            />
                        </div>
                    </div>
                }
            >
                {certificate && (
                    <div className="certificate-preview">
                        <div className="success-message mb-4">
                            <Message severity="success" text={editionResult?.message || 'Certificate created successfully'} />
                        </div>

                        <Card title="Certificate Details" className="mb-4">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="block text-600 font-medium mb-1">Reference:</label>
                                        <span className="text-900 font-bold">{certificate.reference}</span>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="block text-600 font-medium mb-1">State:</label>
                                        <Tag value={certificate.state?.label} severity="success" />
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="block text-600 font-medium mb-1">Insured Name:</label>
                                        <span className="text-900">{certificate.insured_name}</span>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="block text-600 font-medium mb-1">License Plate:</label>
                                        <span className="text-900">{certificate.licence_plate}</span>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="block text-600 font-medium mb-1">Policy Number:</label>
                                        <span className="text-900">{certificate.police_number}</span>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="block text-600 font-medium mb-1">Chassis Number:</label>
                                        <span className="text-900">{certificate.chassis_number}</span>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="block text-600 font-medium mb-1">Valid From:</label>
                                        <span className="text-900">{certificate.starts_at}</span>
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label className="block text-600 font-medium mb-1">Valid Until:</label>
                                        <span className="text-900">{certificate.ends_at}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="download-info">
                            <Message
                                severity="info"
                                text="Click 'Download Certificate' to download the PDF certificate. The certificate is now active and can be used immediately."
                            />
                        </div>
                    </div>
                )}
            </Dialog>
        );
    };

    return (
        <div className="create-edition">
            <div className="create-edition-header mb-4">
                <h1 className="text-3xl font-bold text-900 mb-2">Create Edition Request</h1>
                <p className="text-600">Create a new certificate edition request from ORASS policy data</p>
            </div>

            <div className="create-edition-steps mb-4">
                <Steps model={steps} activeIndex={activeIndex} className="mb-4" />
            </div>

            <div className="create-edition-content">
                {activeIndex === 0 && renderSearchStep()}
                {activeIndex === 1 && renderConfigureStep()}
                {activeIndex === 2 && renderReviewStep()}
            </div>

            {activeIndex === 1 && (
                <div className="flex justify-content-between mt-4">
                    <Button
                        label="Back"
                        icon="pi pi-arrow-left"
                        className="p-button-outlined"
                        onClick={() => setActiveIndex(0)}
                    />
                    <Button
                        label="Next"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        onClick={() => setActiveIndex(2)}
                        disabled={!policyData}
                    />
                </div>
            )}

            {renderSuccessDialog()}
        </div>
    );
};

export default CreateEdition;