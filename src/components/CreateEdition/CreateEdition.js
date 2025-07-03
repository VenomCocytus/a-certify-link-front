import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Steps } from 'primereact/steps';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { apiService } from '../../services/apiService';
import { useToast } from '../../contexts/ToastContext';
import './CreateEdition.css';

const CreateEdition = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [policyData, setPolicyData] = useState(null);
    const [certificateColors, setCertificateColors] = useState([]);
    const { showSuccess, showError, showInfo } = useToast();

    // Step 1: Search Policy
    const [searchForm, setSearchForm] = useState({
        policyNumber: '',
        endorsementNumber: '',
        applicantCode: ''
    });

    // Step 2: Edition Form
    const [editionForm, setEditionForm] = useState({
        organizationCode: '',
        officeCode: '',
        certificateType: 'cima',
        certificateColor: '',
        emailNotification: '',
        generatedBy: '',
        channel: 'web'
    });

    const steps = [
        { label: 'Search Policy' },
        { label: 'Configure Edition' },
        { label: 'Review & Submit' }
    ];

    const certificateTypes = [
        { label: 'CIMA', value: 'cima' },
        { label: 'POOL TPV', value: 'pooltpv' },
        { label: 'MATCA', value: 'matca' },
        { label: 'POOL TPV BLEU', value: 'pooltpvbleu' }
    ];

    const channelTypes = [
        { label: 'Web', value: 'web' },
        { label: 'API', value: 'api' }
    ];

    useEffect(() => {
        fetchCertificateColors();
    }, []);

    const fetchCertificateColors = async () => {
        try {
            const response = await apiService.getCertificateColors();
            const colors = response.data?.map(color => ({
                label: color.name || color.label || color,
                value: color.value || color.code || color
            })) || [];
            setCertificateColors(colors);
        } catch (error) {
            // Use mock data if API fails
            setCertificateColors([
                { label: 'CIMA Jaune', value: 'cima-jaune' },
                { label: 'CIMA Verte', value: 'cima-verte' },
                { label: 'POOL TPV Rouge', value: 'pooltpv-rouge' },
                { label: 'POOL TPV Bleu', value: 'pooltpv-bleu' },
                { label: 'POOL TPV Marron', value: 'pooltpv-marron' },
                { label: 'MATCA Bleu', value: 'matca-bleu' }
            ]);
        }
    };

    const handleSearchPolicy = async () => {
        if (!searchForm.policyNumber || !searchForm.endorsementNumber || !searchForm.applicantCode) {
            showError('Please fill in all search fields');
            return;
        }

        setSearchLoading(true);
        try {
            // const response = await apiService.searchOrassPolicies({
            //     policyNumber: searchForm.policyNumber,
            //     endorsementNumber: searchForm.endorsementNumber,
            //     applicantCode: searchForm.applicantCode,
            //     limit: 1
            // });

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
                        vehicleRegistrationNumber: "LT-123-AB",
                        policyEffectiveDate: "2027-06-17",
                        policyExpiryDate: "2027-08-19",
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

                // Pre-fill some form fields if available in policy data
                setEditionForm(prev => ({
                    ...prev,
                    organizationCode: policy.organizationCode || '',
                    officeCode: policy.officeCode || ''
                }));
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

        if (!editionForm.certificateColor) {
            showError('Please select a certificate color');
            return;
        }

        setLoading(true);
        try {
            // Map policy data to edition request format
            const editionRequest = {
                policyNumber: policyData.policyNumber || searchForm.policyNumber,
                organizationCode: editionForm.organizationCode,
                officeCode: editionForm.officeCode,
                certificateType: editionForm.certificateType,
                emailNotification: editionForm.emailNotification,
                generatedBy: editionForm.generatedBy || 'Web Interface',
                channel: editionForm.channel,
                certificateColor: editionForm.certificateColor,

                // Subscriber Information
                subscriberName: policyData.subscriberName || '',
                subscriberPhone: policyData.subscriberPhone || '',
                subscriberEmail: policyData.subscriberEmail || '',
                subscriberPoBox: policyData.subscriberPoBox || '',

                // Insured Information
                insuredName: policyData.insuredName || policyData.subscriberName || '',
                insuredPhone: policyData.insuredPhone || policyData.subscriberPhone || '',
                insuredEmail: policyData.insuredEmail || policyData.subscriberEmail || '',
                insuredPoBox: policyData.insuredPoBox || policyData.subscriberPoBox || '',

                // Vehicle Information
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

            showSuccess('Edition request created successfully!');

            // Reset form and go back to step 1
            setActiveIndex(0);
            setPolicyData(null);
            setSearchForm({
                policyNumber: '',
                endorsementNumber: '',
                applicantCode: ''
            });
            setEditionForm({
                organizationCode: '',
                officeCode: '',
                certificateType: 'cima',
                certificateColor: '',
                emailNotification: '',
                generatedBy: '',
                channel: 'web'
            });

        } catch (error) {
            showError(error.response?.data?.message || 'Failed to create edition request');
        } finally {
            setLoading(false);
        }
    };

    const formatPolicyData = (data) => {
        if (!data) return {};

        return {
            'Policy Number': data.policyNumber || 'N/A',
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

    // Step 2: Configure Edition
    const renderConfigureStep = () => (
        <div className="grid">
            <div className="col-12 lg:col-8">
                <Card title="Edition Configuration" className="create-edition-card h-full">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="organizationCode" className="block text-900 font-medium mb-2">
                                    Organization Code *
                                </label>
                                <InputText
                                    id="organizationCode"
                                    value={editionForm.organizationCode}
                                    onChange={(e) => setEditionForm(prev => ({ ...prev, organizationCode: e.target.value }))}
                                    placeholder="Enter organization code"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="officeCode" className="block text-900 font-medium mb-2">
                                    Office Code *
                                </label>
                                <InputText
                                    id="officeCode"
                                    value={editionForm.officeCode}
                                    onChange={(e) => setEditionForm(prev => ({ ...prev, officeCode: e.target.value }))}
                                    placeholder="Enter office code"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="certificateType" className="block text-900 font-medium mb-2">
                                    Certificate Type *
                                </label>
                                <Dropdown
                                    id="certificateType"
                                    value={editionForm.certificateType}
                                    options={certificateTypes}
                                    onChange={(e) => setEditionForm(prev => ({ ...prev, certificateType: e.value }))}
                                    placeholder="Select certificate type"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="certificateColor" className="block text-900 font-medium mb-2">
                                    Certificate Color *
                                </label>
                                <Dropdown
                                    id="certificateColor"
                                    value={editionForm.certificateColor}
                                    options={certificateColors}
                                    onChange={(e) => setEditionForm(prev => ({ ...prev, certificateColor: e.value }))}
                                    placeholder="Select certificate color"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="channel" className="block text-900 font-medium mb-2">
                                    Channel
                                </label>
                                <Dropdown
                                    id="channel"
                                    value={editionForm.channel}
                                    options={channelTypes}
                                    onChange={(e) => setEditionForm(prev => ({ ...prev, channel: e.value }))}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="generatedBy" className="block text-900 font-medium mb-2">
                                    Generated By
                                </label>
                                <InputText
                                    id="generatedBy"
                                    value={editionForm.generatedBy}
                                    onChange={(e) => setEditionForm(prev => ({ ...prev, generatedBy: e.target.value }))}
                                    placeholder="Enter generator name"
                                    className="w-full"
                                />
                            </div>
                        </div>

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
                            <span className="ml-2">{editionForm.organizationCode}</span>
                        </div>
                        <div className="field">
                            <span className="font-medium">Office Code:</span>
                            <span className="ml-2">{editionForm.officeCode}</span>
                        </div>
                        <div className="field">
                            <span className="font-medium">Certificate Type:</span>
                            <Tag value={editionForm.certificateType.toUpperCase()} className="ml-2" />
                        </div>
                        <div className="field">
                            <span className="font-medium">Certificate Color:</span>
                            <Tag value={editionForm.certificateColor} severity="info" className="ml-2" />
                        </div>
                        <div className="field">
                            <span className="font-medium">Channel:</span>
                            <span className="ml-2">{editionForm.channel}</span>
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
                        disabled={!editionForm.organizationCode || !editionForm.officeCode || !editionForm.certificateColor}
                    />
                </div>
            )}
        </div>
    );
};

export default CreateEdition;