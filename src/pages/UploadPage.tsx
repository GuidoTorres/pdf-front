import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardBody, Button, Progress, Select, SelectItem, Chip } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useDocumentStore } from '../stores/useDocumentStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UploadPage: React.FC = () => {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [provider, setProvider] = useState<'docling' | 'traditional'>('docling');
  
  const { processDocument, isProcessing, processingProgress } = useDocumentStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await processDocument(selectedFile, provider);
    if (result) {
      navigate('/history');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card className="bg-content1/60 backdrop-blur-md border border-divider">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">{t('uploadBankStatement')}</h2>
            <p className="text-default-500 mt-1">
              {t('uploadIntro')}
            </p>
          </div>
          {user?.subscription && (
            <Chip color="primary" variant="flat">
              {user.subscription.pages_remaining} {t('pagesRemaining')}
            </Chip>
          )}
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Processing Method Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('processingMethod')}</label>
            <Select
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'docling' | 'traditional')}
              className="max-w-xs"
            >
              <SelectItem key="docling" value="docling">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:zap" className="text-primary" />
                  {t('aiPowered')}
                </div>
              </SelectItem>
              <SelectItem key="traditional" value="traditional">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:file-text" />
                  {t('textExtraction')}
                </div>
              </SelectItem>
            </Select>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/10'
                : selectedFile
                ? 'border-success bg-success/10'
                : 'border-divider'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <Icon icon="lucide:file-check" className="mx-auto text-5xl text-success" />
                <div>
                  <p className="text-lg font-medium">{selectedFile.name}</p>
                  <p className="text-default-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button
                  color="default"
                  variant="flat"
                  onClick={() => setSelectedFile(null)}
                >
                  {t('removeFile')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Icon icon="lucide:upload-cloud" className="mx-auto text-5xl text-primary" />
                <div>
                  <p className="mb-2 text-lg">{t('dragAndDropFile')}</p>
                  <p className="text-default-500 mb-4">{t('orClickToSelect')}</p>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    as="label"
                    htmlFor="file-upload"
                    color="primary"
                    size="lg"
                    className="cursor-pointer"
                  >
                    {t('selectPDF')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('processingDocument')}</span>
                <span className="text-sm text-default-500">{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} color="primary" />
              <p className="text-sm text-default-500">
                {processingProgress < 30 && t('analyzingStructure')}
                {processingProgress >= 30 && processingProgress < 60 && t('extractingData')}
                {processingProgress >= 60 && processingProgress < 90 && t('processingWithAI')}
                {processingProgress >= 90 && t('finalizingResults')}
              </p>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end">
            <Button
              color="primary"
              size="lg"
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing}
              className="min-w-32"
            >
              {isProcessing ? (
                <>
                  <Icon icon="lucide:loader-2" className="animate-spin mr-2" />
                  {t('processing')}...
                </>
              ) : (
                <>
                  <Icon icon="lucide:upload" className="mr-2" />
                  {t('process')}
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="bg-default-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon icon="lucide:info" className="text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Supported formats:</p>
                <ul className="text-default-600 space-y-1">
                  <li>• PDF bank statements</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• Both scanned and digital PDFs supported</li>
                </ul>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default UploadPage;