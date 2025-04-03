
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, CheckCircle, AlertCircle, FileUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export function DocumentParser() {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedRequirements, setExtractedRequirements] = useState<string[]>([]);
  const { toast } = useToast();
  
  const mockExtractedRequirements = [
    {
      id: "REQ-001",
      text: "Vendor must provide 24/7 technical support for all cloud services.",
      category: "Technical",
      criticality: "High"
    },
    {
      id: "REQ-002",
      text: "Solution must maintain 99.9% uptime on a monthly basis.",
      category: "Performance",
      criticality: "Critical"
    },
    {
      id: "REQ-003",
      text: "Vendor must have at least 5 years of experience in providing similar services.",
      category: "Vendor Qualification",
      criticality: "Medium"
    },
    {
      id: "REQ-004",
      text: "Solution must support single sign-on (SSO) integration.",
      category: "Security",
      criticality: "High"
    },
    {
      id: "REQ-005",
      text: "Vendor must provide training to at least 50 staff members.",
      category: "Training",
      criticality: "Medium"
    },
    {
      id: "REQ-006",
      text: "Data must be encrypted both at rest and in transit.",
      category: "Security",
      criticality: "Critical"
    },
    {
      id: "REQ-007",
      text: "Solution must be ISO 27001 certified.",
      category: "Compliance",
      criticality: "High"
    },
  ];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };
  
  const handleProcessDocument = () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload first.",
        variant: "destructive",
      });
      return;
    }
    
    setProcessingState('uploading');
    setTimeout(() => {
      setProcessingState('processing');
      setTimeout(() => {
        setProcessingState('complete');
        setExtractedRequirements(mockExtractedRequirements);
        toast({
          title: "Document processed successfully",
          description: `Extracted ${mockExtractedRequirements.length} requirements from the document.`,
        });
      }, 3000);
    }, 1500);
  };
  
  const renderProcessingStatus = () => {
    switch (processingState) {
      case 'idle':
        return null;
      case 'uploading':
        return (
          <div className="flex items-center space-x-2 text-blue-600 animate-pulse-fade">
            <FileUp className="h-4 w-4" />
            <span>Uploading document...</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center space-x-2 text-amber-600 animate-pulse-fade">
            <FileText className="h-4 w-4" />
            <span>Analyzing document with AI...</span>
          </div>
        );
      case 'complete':
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Processing complete!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>Error processing document. Please try again.</span>
          </div>
        );
    }
  };
  
  const getCriticalityStyle = (criticality: string) => {
    switch (criticality) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Technical':
        return 'bg-indigo-100 text-indigo-800';
      case 'Performance':
        return 'bg-purple-100 text-purple-800';
      case 'Security':
        return 'bg-red-100 text-red-800';
      case 'Compliance':
        return 'bg-green-100 text-green-800';
      case 'Training':
        return 'bg-blue-100 text-blue-800';
      case 'Vendor Qualification':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Document Processing</CardTitle>
        <CardDescription>
          Upload RFP documents to extract requirements and metadata using AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="extracted" disabled={processingState !== 'complete'}>
              Extracted Data
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="document">Document</Label>
                <div className="border-2 border-dashed rounded-md p-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="bg-muted rounded-full p-3">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Drag and drop your file here</p>
                      <p className="text-sm text-muted-foreground">
                        Support for PDF, Word, and Excel documents
                      </p>
                    </div>
                    <input 
                      id="document" 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileChange}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => document.getElementById('document')?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                </div>
                {uploadedFile && (
                  <div className="flex items-center justify-between rounded-md border px-3 py-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{uploadedFile.name}</span>
                    </div>
                    <Badge variant="outline">{(uploadedFile.size / 1024).toFixed(0)} KB</Badge>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                {renderProcessingStatus()}
                <Button 
                  className="ml-auto" 
                  onClick={handleProcessDocument}
                  disabled={!uploadedFile || processingState === 'uploading' || processingState === 'processing'}
                >
                  {processingState === 'idle' || processingState === 'complete' || processingState === 'error' 
                    ? 'Process Document' 
                    : 'Processing...'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="extracted" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Extracted Requirements</h3>
              <div className="flex space-x-2">
                <Badge className="bg-procurement-100 text-procurement-800">
                  <span className="ai-tag mr-1">AI</span>
                  Auto-detected
                </Badge>
                <Badge variant="outline">{extractedRequirements.length} Requirements</Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
              {extractedRequirements.map((req: any) => (
                <div key={req.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm text-muted-foreground">{req.id}</span>
                    <div className="flex space-x-2">
                      <Badge className={getCategoryStyle(req.category)}>{req.category}</Badge>
                      <Badge className={getCriticalityStyle(req.criticality)}>{req.criticality}</Badge>
                    </div>
                  </div>
                  <p className="mt-1">{req.text}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
