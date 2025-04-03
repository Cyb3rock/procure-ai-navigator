
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { CheckCircle, XCircle, AlertCircle, Info, Download, Filter } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type ComplianceStatus = 'Compliant' | 'Partial' | 'Non-compliant' | 'Not Provided';

interface VendorData {
  id: string;
  name: string;
  price: number;
  compliance: ComplianceStatus;
  scores: {
    technical: number;
    financial: number;
    experience: number;
    implementation: number;
    support: number;
  };
  additionalFeatures: string[];
}

const mockVendors: VendorData[] = [
  {
    id: "V1",
    name: "Tech Solutions Inc.",
    price: 450000,
    compliance: "Compliant",
    scores: {
      technical: 85,
      financial: 75,
      experience: 90,
      implementation: 80,
      support: 85
    },
    additionalFeatures: ["24/7 Support", "Cloud Integration", "Mobile App"]
  },
  {
    id: "V2",
    name: "InnovateSys LLC",
    price: 520000,
    compliance: "Compliant",
    scores: {
      technical: 92,
      financial: 65,
      experience: 75,
      implementation: 85,
      support: 90
    },
    additionalFeatures: ["AI-powered analytics", "Custom Reporting", "Advanced Security"]
  },
  {
    id: "V3",
    name: "Digital Enterprises",
    price: 380000,
    compliance: "Partial",
    scores: {
      technical: 70,
      financial: 90,
      experience: 65,
      implementation: 75,
      support: 60
    },
    additionalFeatures: ["Cost Optimization", "Scalable Infrastructure"]
  },
  {
    id: "V4",
    name: "NextGen Systems",
    price: 490000,
    compliance: "Non-compliant",
    scores: {
      technical: 80,
      financial: 70,
      experience: 85,
      implementation: 65,
      support: 70
    },
    additionalFeatures: ["Integration APIs", "Workflow Automation", "User Training"]
  }
];

const getWeightedScore = (vendor: VendorData, weights: Record<string, number>) => {
  const { technical, financial, experience, implementation, support } = vendor.scores;
  return (
    (technical * weights.technical +
    financial * weights.financial +
    experience * weights.experience +
    implementation * weights.implementation +
    support * weights.support) /
    (weights.technical + weights.financial + weights.experience + weights.implementation + weights.support)
  ).toFixed(1);
};

const getComplianceIcon = (status: ComplianceStatus) => {
  switch (status) {
    case 'Compliant':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'Partial':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'Non-compliant':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'Not Provided':
      return <Info className="h-5 w-5 text-gray-500" />;
  }
};

export function VendorComparisonMatrix() {
  const [weights, setWeights] = useState({
    technical: 30,
    financial: 25,
    experience: 15,
    implementation: 15,
    support: 15
  });
  
  const handleWeightChange = (category: string, value: number[]) => {
    setWeights({
      ...weights,
      [category]: value[0]
    });
  };
  
  const renderScoreCell = (score: number) => {
    return (
      <div className="flex items-center justify-center space-x-2">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium",
          score >= 90 ? "bg-green-500" :
          score >= 80 ? "bg-green-400" :
          score >= 70 ? "bg-yellow-400" :
          score >= 60 ? "bg-orange-400" :
          "bg-red-500"
        )}>
          {score}
        </div>
      </div>
    );
  };
  
  const renderWeightedScoreCell = (vendor: VendorData) => {
    const score = parseFloat(getWeightedScore(vendor, weights));
    return (
      <div className="flex items-center justify-center">
        <div className={cn(
          "min-w-16 py-1 px-2 rounded-full flex items-center justify-center text-white font-medium",
          score >= 85 ? "bg-green-500" :
          score >= 75 ? "bg-green-400" :
          score >= 65 ? "bg-yellow-400" :
          score >= 55 ? "bg-orange-400" :
          "bg-red-500"
        )}>
          {score}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vendor Comparison Matrix</CardTitle>
        <CardDescription>
          Compare vendor submissions across key evaluation criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="comparison">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="comparison">Comparison Matrix</TabsTrigger>
            <TabsTrigger value="weights">Evaluation Weights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-32">Vendor</TableHead>
                    <TableHead className="text-center">Price</TableHead>
                    <TableHead className="text-center">Compliance</TableHead>
                    <TableHead className="text-center">Technical (w:{weights.technical})</TableHead>
                    <TableHead className="text-center">Financial (w:{weights.financial})</TableHead>
                    <TableHead className="text-center">Experience (w:{weights.experience})</TableHead>
                    <TableHead className="text-center">Implementation (w:{weights.implementation})</TableHead>
                    <TableHead className="text-center">Support (w:{weights.support})</TableHead>
                    <TableHead className="text-center bg-procurement-50">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center justify-center space-x-1">
                              <span>Weighted Score</span>
                              <Info className="h-4 w-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              The weighted score is calculated based on the weights assigned to each criterion.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVendors
                    .sort((a, b) => parseFloat(getWeightedScore(b, weights)) - parseFloat(getWeightedScore(a, weights)))
                    .map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell className="text-center">${vendor.price.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {getComplianceIcon(vendor.compliance)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{renderScoreCell(vendor.scores.technical)}</TableCell>
                      <TableCell className="text-center">{renderScoreCell(vendor.scores.financial)}</TableCell>
                      <TableCell className="text-center">{renderScoreCell(vendor.scores.experience)}</TableCell>
                      <TableCell className="text-center">{renderScoreCell(vendor.scores.implementation)}</TableCell>
                      <TableCell className="text-center">{renderScoreCell(vendor.scores.support)}</TableCell>
                      <TableCell className="text-center bg-procurement-50">
                        {renderWeightedScoreCell(vendor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex space-x-1">
                <Badge className="bg-procurement-100 text-procurement-800">
                  <span className="ai-tag mr-1">AI</span>
                  Analysis
                </Badge>
                <Badge variant="outline">{mockVendors.length} Vendors</Badge>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="weights" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="technical-weight" className="text-sm font-medium">
                    Technical Score Weight
                  </label>
                  <span className="text-sm">{weights.technical}%</span>
                </div>
                <Slider
                  id="technical-weight"
                  value={[weights.technical]}
                  min={5}
                  max={50}
                  step={5}
                  onValueChange={(value) => handleWeightChange('technical', value)}
                  className="py-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="financial-weight" className="text-sm font-medium">
                    Financial Score Weight
                  </label>
                  <span className="text-sm">{weights.financial}%</span>
                </div>
                <Slider
                  id="financial-weight"
                  value={[weights.financial]}
                  min={5}
                  max={50}
                  step={5}
                  onValueChange={(value) => handleWeightChange('financial', value)}
                  className="py-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="experience-weight" className="text-sm font-medium">
                    Experience Score Weight
                  </label>
                  <span className="text-sm">{weights.experience}%</span>
                </div>
                <Slider
                  id="experience-weight"
                  value={[weights.experience]}
                  min={5}
                  max={50}
                  step={5}
                  onValueChange={(value) => handleWeightChange('experience', value)}
                  className="py-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="implementation-weight" className="text-sm font-medium">
                    Implementation Score Weight
                  </label>
                  <span className="text-sm">{weights.implementation}%</span>
                </div>
                <Slider
                  id="implementation-weight"
                  value={[weights.implementation]}
                  min={5}
                  max={50}
                  step={5}
                  onValueChange={(value) => handleWeightChange('implementation', value)}
                  className="py-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="support-weight" className="text-sm font-medium">
                    Support Score Weight
                  </label>
                  <span className="text-sm">{weights.support}%</span>
                </div>
                <Slider
                  id="support-weight"
                  value={[weights.support]}
                  min={5}
                  max={50}
                  step={5}
                  onValueChange={(value) => handleWeightChange('support', value)}
                  className="py-2"
                />
              </div>
            </div>
            
            <div className="rounded-md bg-muted p-4">
              <h3 className="text-sm font-medium mb-2">Total Weight</h3>
              <div className="flex items-center justify-between">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={cn(
                      "h-2.5 rounded-full",
                      Object.values(weights).reduce((a, b) => a + b, 0) === 100 
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    )}
                    style={{ width: `${Math.min(100, Object.values(weights).reduce((a, b) => a + b, 0))}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium">
                  {Object.values(weights).reduce((a, b) => a + b, 0)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Object.values(weights).reduce((a, b) => a + b, 0) === 100 
                  ? "Weights are balanced at 100%"
                  : "Total weight should equal 100%"}
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button className="w-full sm:w-auto">Apply Weighting</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
