import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Upload, Download, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface BulkUpload {
  id: number;
  fileName: string;
  status: string;
  totalRows?: number;
  processedRows?: number;
  successfulRows?: number;
  errors?: string[];
  createdAt: string;
  completedAt?: string;
}

interface FunctionalBulkUploadProps {
  roasterId: number;
}

export default function FunctionalBulkUpload({ roasterId }: FunctionalBulkUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { data: uploads, refetch } = useQuery({
    queryKey: ['/api/roaster/bulk-uploads'],
    refetchInterval: 2000, // Poll every 2 seconds for progress updates
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/roaster/bulk-upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Started",
        description: "Your CSV file is being processed. You'll see progress updates below.",
      });
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/roaster/bulk-uploads'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const downloadTemplate = () => {
    window.open('/api/csv-template', '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Product Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV Template
            </Button>
            <p className="text-sm text-gray-600">
              Download the template to see the required format for bulk uploads
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    {selectedFile ? selectedFile.name : 'Select a CSV file to upload'}
                  </span>
                  <input
                    id="csv-upload"
                    name="csv-upload"
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  CSV files up to 10MB
                </p>
              </div>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button 
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
        </CardHeader>
        <CardContent>
          {!uploads || uploads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No uploads yet. Upload your first CSV file to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {uploads.map((upload: BulkUpload) => (
                <div key={upload.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(upload.status)}
                      <span className="font-medium">{upload.fileName}</span>
                      <Badge className={getStatusColor(upload.status)}>
                        {upload.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(upload.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {upload.status === 'processing' && upload.totalRows && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{upload.processedRows || 0} / {upload.totalRows}</span>
                      </div>
                      <Progress 
                        value={((upload.processedRows || 0) / upload.totalRows) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {upload.status === 'completed' && (
                    <div className="text-sm text-gray-600">
                      <p>✅ Successfully processed {upload.successfulRows} products</p>
                      {upload.errors && upload.errors.length > 0 && (
                        <p>⚠️ {upload.errors.length} errors encountered</p>
                      )}
                    </div>
                  )}

                  {upload.status === 'failed' && upload.errors && upload.errors.length > 0 && (
                    <div className="mt-2">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-red-600 font-medium">
                          View Errors ({upload.errors.length})
                        </summary>
                        <div className="mt-2 p-2 bg-red-50 rounded max-h-32 overflow-y-auto">
                          {upload.errors.slice(0, 10).map((error, index) => (
                            <p key={index} className="text-red-700 text-xs">{error}</p>
                          ))}
                          {upload.errors.length > 10 && (
                            <p className="text-red-600 text-xs font-medium">
                              ... and {upload.errors.length - 10} more errors
                            </p>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}