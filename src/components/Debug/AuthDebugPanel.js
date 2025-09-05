import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge } from 'primereact/badge';
import { Card } from 'primereact/card';
import { ScrollPanel } from 'primereact/scrollpanel';
import authDebugger from '../../utils/authDebugger';
import { useAuth } from '../../contexts/AuthContext';

const AuthDebugPanel = ({ visible, onHide }) => {
  const [authReport, setAuthReport] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { user, isAuthenticated, loading: authLoading, authError } = useAuth();

  useEffect(() => {
    if (visible) {
      loadDebugData();
    }
  }, [visible]);

  const loadDebugData = async () => {
    setLoading(true);
    try {
      const report = await authDebugger.generateAuthReport();
      setAuthReport(report);
      setLogs(authDebugger.logs);
    } catch (error) {
      console.error('Failed to load debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = (format) => {
    const data = authDebugger.exportLogs(format);
    const blob = new Blob([data], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auth-debug-logs.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    authDebugger.clearLogs();
    setLogs([]);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getCategoryBadge = (category) => {
    const severityMap = {
      'ERROR': 'danger',
      'WARNING': 'warning',
      'SUCCESS': 'success',
      'INFO': 'info',
      'DEBUG': 'secondary',
      'NETWORK': 'primary'
    };
    return <Badge value={category} severity={severityMap[category] || 'secondary'} />;
  };

  const renderOverviewTab = () => (
    <div className="grid">
      <div className="col-12 md:col-6">
        <Card title="Authentication Status" className="h-full">
          <div className="space-y-2">
            <div className="flex justify-content-between">
              <span>Authenticated:</span>
              <Badge value={isAuthenticated ? 'Yes' : 'No'} 
                     severity={isAuthenticated ? 'success' : 'danger'} />
            </div>
            <div className="flex justify-content-between">
              <span>Loading:</span>
              <Badge value={authLoading ? 'Yes' : 'No'} 
                     severity={authLoading ? 'warning' : 'success'} />
            </div>
            <div className="flex justify-content-between">
              <span>User:</span>
              <span>{user?.email || 'None'}</span>
            </div>
            {authError && (
              <div className="flex justify-content-between">
                <span>Error:</span>
                <span className="text-red-500 text-sm">{authError}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="col-12 md:col-6">
        <Card title="System Health" className="h-full">
          {authReport && (
            <div className="space-y-2">
              <div className="flex justify-content-between">
                <span>API Health:</span>
                <Badge value={authReport.apiHealth?.healthy ? 'Healthy' : 'Unhealthy'} 
                       severity={authReport.apiHealth?.healthy ? 'success' : 'danger'} />
              </div>
              <div className="flex justify-content-between">
                <span>Network:</span>
                <Badge value={authReport.browser?.onLine ? 'Online' : 'Offline'} 
                       severity={authReport.browser?.onLine ? 'success' : 'danger'} />
              </div>
              <div className="flex justify-content-between">
                <span>Cache Valid:</span>
                <Badge value={authReport.userCache?.isValid ? 'Yes' : 'No'} 
                       severity={authReport.userCache?.isValid ? 'success' : 'warning'} />
              </div>
              {authReport.apiHealth?.duration && (
                <div className="flex justify-content-between">
                  <span>API Response:</span>
                  <span>{authReport.apiHealth.duration}ms</span>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {authReport?.diagnostics && authReport.diagnostics.length > 0 && (
        <div className="col-12">
          <Card title="Diagnostics">
            <div className="space-y-3">
              {authReport.diagnostics.map((diagnostic, index) => (
                <div key={index} className="flex align-items-start gap-3">
                  <Badge value={diagnostic.type} 
                         severity={diagnostic.type === 'ERROR' ? 'danger' : 
                                 diagnostic.type === 'WARNING' ? 'warning' : 'info'} />
                  <div className="flex-1">
                    <div className="font-semibold">{diagnostic.message}</div>
                    <div className="text-sm text-600">{diagnostic.suggestion}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const renderLogsTab = () => (
    <div>
      <div className="flex justify-content-between align-items-center mb-3">
        <h3>Recent Logs ({logs.length})</h3>
        <div className="flex gap-2">
          <Button label="Refresh" icon="pi pi-refresh" size="small" onClick={loadDebugData} />
          <Button label="Export JSON" icon="pi pi-download" size="small" 
                  onClick={() => exportLogs('json')} />
          <Button label="Export CSV" icon="pi pi-download" size="small" 
                  onClick={() => exportLogs('csv')} />
          <Button label="Clear" icon="pi pi-trash" size="small" severity="secondary"
                  onClick={clearLogs} />
        </div>
      </div>
      
      <DataTable value={logs} scrollable scrollHeight="400px" className="w-full">
        <Column field="timestamp" header="Time" 
                body={(rowData) => formatTimestamp(rowData.timestamp)} 
                style={{ minWidth: '150px' }} />
        <Column field="category" header="Level" 
                body={(rowData) => getCategoryBadge(rowData.category)}
                style={{ minWidth: '80px' }} />
        <Column field="message" header="Message" style={{ minWidth: '200px' }} />
        <Column field="data" header="Data" 
                body={(rowData) => (
                  <ScrollPanel style={{ width: '200px', height: '60px' }}>
                    <pre className="text-xs">{JSON.stringify(rowData.data, null, 2)}</pre>
                  </ScrollPanel>
                )}
                style={{ minWidth: '200px' }} />
      </DataTable>
    </div>
  );

  const renderTokensTab = () => (
    <div className="grid">
      {authReport?.tokenManager && (
        <div className="col-12">
          <Card title="Token Information">
            <div className="grid">
              <div className="col-12 md:col-6">
                <h4>Token Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-content-between">
                    <span>Has Access Token:</span>
                    <Badge value={authReport.tokenManager.hasAccessToken ? 'Yes' : 'No'} 
                           severity={authReport.tokenManager.hasAccessToken ? 'success' : 'danger'} />
                  </div>
                  <div className="flex justify-content-between">
                    <span>Has Refresh Token:</span>
                    <Badge value={authReport.tokenManager.hasRefreshToken ? 'Yes' : 'No'} 
                           severity={authReport.tokenManager.hasRefreshToken ? 'success' : 'danger'} />
                  </div>
                  <div className="flex justify-content-between">
                    <span>Access Token Valid:</span>
                    <Badge value={authReport.tokenManager.accessTokenValid ? 'Yes' : 'No'} 
                           severity={authReport.tokenManager.accessTokenValid ? 'success' : 'danger'} />
                  </div>
                  <div className="flex justify-content-between">
                    <span>Expiring Soon:</span>
                    <Badge value={authReport.tokenManager.accessTokenExpiringSoon ? 'Yes' : 'No'} 
                           severity={authReport.tokenManager.accessTokenExpiringSoon ? 'warning' : 'success'} />
                  </div>
                  <div className="flex justify-content-between">
                    <span>Refresh In Progress:</span>
                    <Badge value={authReport.tokenManager.refreshInProgress ? 'Yes' : 'No'} 
                           severity={authReport.tokenManager.refreshInProgress ? 'info' : 'secondary'} />
                  </div>
                </div>
              </div>
              
              <div className="col-12 md:col-6">
                {authReport.tokenManager.accessTokenInfo && (
                  <>
                    <h4>Token Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-content-between">
                        <span>Expires At:</span>
                        <span className="text-sm">{formatTimestamp(authReport.tokenManager.accessTokenInfo.expirationTime)}</span>
                      </div>
                      <div className="flex justify-content-between">
                        <span>Time Until Expiry:</span>
                        <span className="text-sm">{Math.round(authReport.tokenManager.accessTokenInfo.timeUntilExpiration / 1000)}s</span>
                      </div>
                      <div className="flex justify-content-between">
                        <span>Is Expired:</span>
                        <Badge value={authReport.tokenManager.accessTokenInfo.isExpired ? 'Yes' : 'No'} 
                               severity={authReport.tokenManager.accessTokenInfo.isExpired ? 'danger' : 'success'} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {authReport?.userCache && (
        <div className="col-12">
          <Card title="User Cache">
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="space-y-2">
                  <div className="flex justify-content-between">
                    <span>Cache Exists:</span>
                    <Badge value={authReport.userCache.exists ? 'Yes' : 'No'} 
                           severity={authReport.userCache.exists ? 'success' : 'warning'} />
                  </div>
                  <div className="flex justify-content-between">
                    <span>Has User Data:</span>
                    <Badge value={authReport.userCache.hasUser ? 'Yes' : 'No'} 
                           severity={authReport.userCache.hasUser ? 'success' : 'warning'} />
                  </div>
                  <div className="flex justify-content-between">
                    <span>Is Valid:</span>
                    <Badge value={authReport.userCache.isValid ? 'Yes' : 'No'} 
                           severity={authReport.userCache.isValid ? 'success' : 'warning'} />
                  </div>
                </div>
              </div>
              
              <div className="col-12 md:col-6">
                {authReport.userCache.exists && (
                  <div className="space-y-2">
                    <div className="flex justify-content-between">
                      <span>Age:</span>
                      <span>{Math.round(authReport.userCache.age / 1000)}s</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span>Expires In:</span>
                      <span>{Math.round(authReport.userCache.expiresIn / 1000)}s</span>
                    </div>
                    <div className="flex justify-content-between">
                      <span>Cache Size:</span>
                      <span>{authReport.userCache.cacheSize} bytes</span>
                    </div>
                    {authReport.userCache.userEmail && (
                      <div className="flex justify-content-between">
                        <span>Cached User:</span>
                        <span>{authReport.userCache.userEmail}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <Dialog
      header="Authentication Debug Panel"
      visible={visible}
      onHide={onHide}
      style={{ width: '90vw', height: '80vh' }}
      maximizable
    >
      {loading ? (
        <div className="flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <i className="pi pi-spinner pi-spin text-4xl"></i>
        </div>
      ) : (
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          <TabPanel header="Overview" leftIcon="pi pi-home">
            {renderOverviewTab()}
          </TabPanel>
          
          <TabPanel header="Logs" leftIcon="pi pi-list">
            {renderLogsTab()}
          </TabPanel>
          
          <TabPanel header="Tokens" leftIcon="pi pi-key">
            {renderTokensTab()}
          </TabPanel>
        </TabView>
      )}
    </Dialog>
  );
};

export default AuthDebugPanel;