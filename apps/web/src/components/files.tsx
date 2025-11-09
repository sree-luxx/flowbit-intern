'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Folder, File, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
  owner: string;
}

export function Files() {
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [files] = useState<FileItem[]>([
    { id: '1', name: 'Invoices', type: 'folder', modified: '2024-01-15', owner: 'Admin' },
    { id: '2', name: 'Receipts', type: 'folder', modified: '2024-01-14', owner: 'Admin' },
    { id: '3', name: 'Reports', type: 'folder', modified: '2024-01-13', owner: 'Admin' },
    { id: '4', name: 'invoice_2024_001.pdf', type: 'file', size: '2.4 MB', modified: '2024-01-15', owner: 'Admin' },
    { id: '5', name: 'receipt_jan_2024.pdf', type: 'file', size: '1.8 MB', modified: '2024-01-14', owner: 'Admin' },
    { id: '6', name: 'monthly_report.xlsx', type: 'file', size: '3.2 MB', modified: '2024-01-13', owner: 'Admin' },
    { id: '7', name: 'vendor_contracts', type: 'folder', modified: '2024-01-12', owner: 'Admin' },
    { id: '8', name: 'tax_documents', type: 'folder', modified: '2024-01-11', owner: 'Admin' },
  ]);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath([...currentPath, file.name]);
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
    }
  };

  const handleBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedFile(null);
    }
  };

  const handleCloseFile = () => {
    setSelectedFile(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {currentPath.length > 0 && (
            <Button variant="ghost" onClick={handleBack}>
              ← Back
            </Button>
          )}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search files and folders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => alert('Upload functionality coming soon!')}>
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>

      {selectedFile ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle>{selectedFile.name}</CardTitle>
                  <CardDescription>File Details</CardDescription>
                </div>
              </div>
              <Button variant="ghost" onClick={handleCloseFile}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">File Information</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{selectedFile.size || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modified:</span>
                    <span className="font-medium">{formatDate(selectedFile.modified)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Owner:</span>
                    <span className="font-medium">{selectedFile.owner}</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Preview</div>
                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                  File preview for {selectedFile.name} would appear here
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {currentPath.length > 0 ? `Files in ${currentPath[currentPath.length - 1]}` : 'All Files'}
            </CardTitle>
            <CardDescription>Manage your documents and folders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No files found</div>
              ) : (
                filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {file.type === 'folder' ? (
                        <Folder className="w-5 h-5 text-purple-600" />
                      ) : (
                        <File className="w-5 h-5 text-blue-600" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-gray-500">
                          {file.size && `${file.size} • `}
                          Modified {formatDate(file.modified)} • {file.owner}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.type === 'folder' && (
                        <span className="text-sm text-gray-400">Click to open →</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

