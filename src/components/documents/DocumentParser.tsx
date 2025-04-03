
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ExtractedRequirement } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function DocumentParser() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('upload');
  const [extractedRequirements, setExtractedRequirements] = useState<ExtractedRequirement[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate processing with progress updates
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setActiveTab('results');
          // Simulate extracted requirements
          const mockRequirements: ExtractedRequirement[] = [
            { id: 'req-001', text: 'Vendor must have at least 5 years of experience in public sector projects', category: 'Qualification', criticality: 'High' },
            { id: 'req-002', text: 'Solution must comply with GDPR regulations', category: 'Compliance', criticality: 'Critical' },
            { id: 'req-003', text: 'Delivery timeframe should not exceed 6 months', category: 'Timeline', criticality: 'Medium' },
            { id: 'req-004', text: 'Proposed solution must integrate with existing ERP system', category: 'Technical', criticality: 'High' },
            { id: 'req-005', text: 'Training for at least 50 staff members must be included', category: 'Training', criticality: 'Medium' },
            { id: 'req-006', text: 'Warranty period must be at least 12 months', category: 'Support', criticality: 'High' },
            { id: 'req-007', text: 'Cost must not exceed the allocated budget of $500,000', category: 'Financial', criticality: 'Critical' },
          ];
          setExtractedRequirements(mockRequirements);
        }
        return newProgress;
      });
    }, 300);
  };

  const handleExport = () => {
    if (extractedRequirements.length === 0) {
      toast({
        title: "Nothing to export",
        description: "No requirements have been extracted yet.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["ID", "Requirement", "Category", "Criticality"];
    const csvContent = [
      headers.join(","),
      ...extractedRequirements.map(req => 
        [
          req.id,
          `"${req.text.replace(/"/g, '""')}"`, // Escape quotes in CSV
          req.category,
          req.criticality
        ].join(",")
      )
    ].join("\n");

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `requirements-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 100);

    toast({
      title: "Export successful",
      description: `${extractedRequirements.length} requirements exported to CSV.`,
    });
  };

  const getCriticalityBadge = (criticality: string) => {
    switch (criticality) {
      case 'Critical':
        return <Badge variant="destructive">{criticality}</Badge>;
      case 'High':
        return <Badge className="bg-amber-500">{criticality}</Badge>;
      case 'Medium':
        return <Badge className="bg-blue-500">{criticality}</Badge>;
      default:
        return <Badge>{criticality}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Document Parser</CardTitle>
        <CardDescription>
          Upload RFP documents to automatically extract and analyze requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="results" disabled={extractedRequirements.length === 0}>
              Extracted Requirements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Drop your RFP document here</p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, DOCX, and TXT formats up to 25MB
                </p>
              </div>
              
              <div className="flex justify-center mt-4">
                <Label 
                  htmlFor="document-upload" 
                  className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md"
                >
                  Browse files
                </Label>
                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
            
            {selectedFile && (
              <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.round(selectedFile.size / 1024)} KB)
                  </span>
                </div>
                <Button onClick={handleUpload} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Process Document'}
                </Button>
              </div>
            )}
            
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyzing document...</span>
                  <span>{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="results">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Extracted Requirements</h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExport}
                    className="ml-auto"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as CSV
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{extractedRequirements.length} requirements identified</span>
              </div>
              
              <ScrollArea className="h-[400px] border rounded-md">
                <div className="p-4 space-y-4">
                  {extractedRequirements.map((req) => (
                    <div key={req.id} className="border rounded-md p-3 space-y-2 hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{req.id}</span>
                        {getCriticalityBadge(req.criticality)}
                      </div>
                      <p className="text-sm">{req.text}</p>
                      <Separator />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Category: {req.category}</span>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>AI confidence: High</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="justify-between flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">
          <span className="ai-tag">AI Powered</span> Document processing using natural language understanding
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExport}
          disabled={extractedRequirements.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Requirements
        </Button>
      </CardFooter>
    </Card>
  );
}
