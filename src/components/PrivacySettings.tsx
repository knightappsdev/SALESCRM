import React, { useState } from 'react';
import { Shield, Download, Trash2, Eye } from 'lucide-react';

interface PrivacySettings {
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  cookieConsent: boolean;
  dataRetentionPeriod: string;
  hipaaCompliance: boolean;
  auditLogsEnabled: boolean;
}

const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    dataProcessingConsent: true,
    marketingConsent: false,
    analyticsConsent: true,
    cookieConsent: true,
    dataRetentionPeriod: '7 years',
    hipaaCompliance: true,
    auditLogsEnabled: true
  });

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDataExport = () => {
    console.log('Exporting user data...');
    alert('Data export initiated. You will receive an email when ready.');
  };

  const handleDataDeletion = () => {
    console.log('Initiating data deletion request...');
    alert('Data deletion request submitted. This action will be processed within 30 days.');
  };

  const handleViewLogs = () => {
    console.log('Viewing data processing logs...');
    alert('Opening data processing logs...');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Privacy & Compliance Settings</h1>
      </div>

      {/* GDPR Compliance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-2">GDPR Compliance</h2>
        <p className="text-gray-600 mb-4">
          Manage your data processing preferences in accordance with GDPR regulations
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="data-processing" className="text-sm font-medium">
              Data Processing Consent
            </label>
            <input
              type="checkbox"
              id="data-processing"
              checked={settings.dataProcessingConsent}
              onChange={(e) => handleSettingChange('dataProcessingConsent', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="marketing" className="text-sm font-medium">
              Marketing Communications
            </label>
            <input
              type="checkbox"
              id="marketing"
              checked={settings.marketingConsent}
              onChange={(e) => handleSettingChange('marketingConsent', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="analytics" className="text-sm font-medium">
              Analytics & Performance
            </label>
            <input
              type="checkbox"
              id="analytics"
              checked={settings.analyticsConsent}
              onChange={(e) => handleSettingChange('analyticsConsent', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="cookies" className="text-sm font-medium">
              Cookie Consent
            </label>
            <input
              type="checkbox"
              id="cookies"
              checked={settings.cookieConsent}
              onChange={(e) => handleSettingChange('cookieConsent', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* HIPAA Compliance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-2">HIPAA Compliance</h2>
        <p className="text-gray-600 mb-4">
          Healthcare data protection and privacy controls
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="hipaa" className="text-sm font-medium">
              HIPAA Compliance Mode
            </label>
            <input
              type="checkbox"
              id="hipaa"
              checked={settings.hipaaCompliance}
              onChange={(e) => handleSettingChange('hipaaCompliance', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="audit-logs" className="text-sm font-medium">
              Audit Logs
            </label>
            <input
              type="checkbox"
              id="audit-logs"
              checked={settings.auditLogsEnabled}
              onChange={(e) => handleSettingChange('auditLogsEnabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Retention Period</label>
            <textarea
              value={settings.dataRetentionPeriod}
              onChange={(e) => handleSettingChange('dataRetentionPeriod', e.target.value)}
              placeholder="Specify data retention period..."
              className="w-full min-h-[60px] p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Data Rights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-2">Your Data Rights</h2>
        <p className="text-gray-600 mb-4">
          Exercise your rights regarding personal data
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleDataExport}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4" />
            <span>Export My Data</span>
          </button>
          
          <button 
            onClick={handleDataDeletion}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Trash2 className="h-4 w-4" />
            <span>Request Data Deletion</span>
          </button>
          
          <button 
            onClick={handleViewLogs}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="h-4 w-4" />
            <span>View Data Processing Log</span>
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-2">Privacy Notice</h2>
        <p className="text-sm text-gray-600">
          This CRM system is designed to comply with GDPR and HIPAA regulations. All personal data is encrypted
          and processed according to the highest security standards. For more information about our privacy
          practices, please review our complete privacy policy.
        </p>
      </div>
    </div>
  );
};

export default PrivacySettings;