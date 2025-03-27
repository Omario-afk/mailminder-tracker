import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, PlusCircle, FilePlus, Save, Send } from "lucide-react";

enum DocumentScope {
  REGIONAL = "regional",
  PRINCIPAL = "principal",
  COMMUNAL = "communal"
}

enum DocumentType {
  REUNION = "reunion",
  MISSION = "mission",
  VISITE = "visite",
  FEP = "fep",
  CPC = "cpc"
}

const SendInterface = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    scope: "",
    sender: "",
    issueDate: "",
    receiptDate: "",
    receiptNumber: "",
    subject: "",
    type: "",
    meetingDate: "",
    location: "",
    time: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setDocumentPreview(objectUrl);
      toast({
        title: "Document uploaded",
        description: `File '${file.name}' uploaded successfully.`
      });
    }
  };

  const handleScan = () => {
    toast({
      title: "Scanner activated",
      description: "Scanning document... (This would connect to a physical scanner in a real app)"
    });
    
    setTimeout(() => {
      setDocumentPreview("/placeholder.svg");
      toast({
        title: "Document scanned",
        description: "Document scanned successfully."
      });
    }, 2000);
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Document saved as draft."
    });
  };

  const handleSubmit = () => {
    toast({
      title: "Document transmitted",
      description: "Document has been transmitted successfully."
    });
    navigate("/dashboard");
  };

  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Interface d'envoi</h1>
        <p className="text-muted-foreground">Manage document sending and processing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="glass-card h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <h2 className="text-lg font-semibold mb-4">Document Preview</h2>
              
              <div className="flex-1 border-2 border-dashed border-muted rounded-lg flex items-center justify-center bg-muted/30 mb-4 overflow-hidden">
                {documentPreview ? (
                  <img 
                    src={documentPreview} 
                    alt="Document preview" 
                    className="max-w-full max-h-[300px] object-contain"
                  />
                ) : (
                  <div className="text-center p-12">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Upload or scan a document</p>
                  </div>
                )}
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg text-center">
                <p className="font-semibold">Document ID</p>
                <p className="text-lg">{formData.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button className="w-full" onClick={() => document.getElementById("file-upload")?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept="image/*,.pdf" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                
                <Button variant="outline" className="w-full" onClick={handleScan}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Scan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Document Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="scope">Etendue</Label>
                  <Select onValueChange={(value) => handleSelectChange("scope", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DocumentScope.REGIONAL}>Regionale</SelectItem>
                      <SelectItem value={DocumentScope.PRINCIPAL}>Principal</SelectItem>
                      <SelectItem value={DocumentScope.COMMUNAL}>Communal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sender">Emetteur</Label>
                  <Input
                    id="sender"
                    name="sender"
                    value={formData.sender}
                    onChange={handleChange}
                    placeholder="Enter sender name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Date Emission</Label>
                  <Input
                    id="issueDate"
                    name="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptDate">Date Reception</Label>
                  <Input
                    id="receiptDate"
                    name="receiptDate"
                    type="date"
                    value={formData.receiptDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptNumber">Numero Reception B.O DRE</Label>
                  <Input
                    id="receiptNumber"
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleChange}
                    placeholder="Enter receipt number"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <Label htmlFor="subject">Objet Texto</Label>
                <Textarea
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter subject"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select onValueChange={(value) => handleSelectChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DocumentType.REUNION}>Reunion</SelectItem>
                      <SelectItem value={DocumentType.MISSION}>Mission</SelectItem>
                      <SelectItem value={DocumentType.VISITE}>Visite</SelectItem>
                      <SelectItem value={DocumentType.FEP}>FEP</SelectItem>
                      <SelectItem value={DocumentType.CPC}>CPC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetingDate">Date R</Label>
                  <Input
                    id="meetingDate"
                    name="meetingDate"
                    type="date"
                    value={formData.meetingDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Heure</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
                <Button onClick={handleSubmit}>
                  <Send className="mr-2 h-4 w-4" />
                  Transmettre
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SendInterface;
