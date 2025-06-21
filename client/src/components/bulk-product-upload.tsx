import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BulkUpload {
  id: number;
  fileName: string;
  status: string;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  errors?: string[];
  createdAt: string;
  completedAt?: string;
}

interface BulkProductUploadProps {
  roasterId: number;
}

export default function BulkProductUpload({ roasterId }: BulkProductUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roasterId', roasterId.toString());
      
      const response = await fetch('/api/bulk-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Started",
        description: `Processing ${data.totalRows} products from ${data.fileName}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bulk-uploads', roasterId] });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,description,price,stockQuantity,origin,roastLevel,process,altitude,varietal,tastingNotes,images
Ethiopian Yirgacheffe,Premium single-origin coffee with bright acidity,24.99,50,Ethiopia,Medium,Washed,1700-2200m,Heirloom,Floral citrus chocolate,https://example.com/image1.jpg;https://example.com/image2.jpg
Colombian Supremo,Rich full-bodied coffee with nutty undertones,22.99,75,Colombia,Medium-Dark,Washed,1200-1800m,Typica,Nutty caramel dark chocolate,https://example.com/image3.jpg`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-upload-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Bulk Product Upload</h3>
        <p className="text-muted-foreground">Upload multiple products at once using CSV files</p>
      </div>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Template
          </CardTitle>
          <CardDescription>
            Get the CSV template with proper formatting and required columns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline" className="w-full">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Products
          </CardTitle>
          <CardDescription>
            Drag and drop your CSV file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? "border-teal-500 bg-teal-50 dark:bg-teal-950/20" 
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {selectedFile ? selectedFile.name : "Drop your CSV file here"}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedFile 
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB` 
                  : "or click to browse files"
                }
              </p>
              {!selectedFile && (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {selectedFile && (
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => uploadMutation.mutate(selectedFile)}
                disabled={uploadMutation.isPending}
                className="flex-1"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Products"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedFile(null)}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required columns:</strong> name, description, price, stockQuantity, origin, roastLevel
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">File Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CSV format only</li>
                <li>• Maximum file size: 5MB</li>
                <li>• UTF-8 encoding recommended</li>
                <li>• Use semicolons (;) to separate multiple image URLs</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Data Validation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Prices must be positive numbers</li>
                <li>• Stock quantities must be integers</li>
                <li>• Roast levels: Light, Medium, Medium-Dark, Dark</li>
                <li>• Images must be valid URLs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Status */}
      {uploadMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600" />
              Processing Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Validating and importing products...</span>
                <span>Please wait</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}