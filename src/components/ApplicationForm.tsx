import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, Loader2, X, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { validateFile, uploadFileWithRetry } from "@/lib/upload-utils";
import { logError } from "@/lib/error-logger";

interface Props {
  opportunityId: string;
  opportunityTitle: string;
  requiredDocuments?: string[];
}

export default function ApplicationForm({ opportunityId, opportunityTitle, requiredDocuments = [] }: Props) {
  const { user } = useAuth();
  const generalFileRef = useRef<HTMLInputElement>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [requiredFiles, setRequiredFiles] = useState<Record<string, File | null>>(
    () => Object.fromEntries(requiredDocuments.map((d) => [d, null]))
  );
  const [generalFiles, setGeneralFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const hasRequiredDocs = requiredDocuments.length > 0;

  // Check if all required documents are uploaded
  const allRequiredUploaded = useMemo(() => {
    if (!hasRequiredDocs) return true;
    return requiredDocuments.every((doc) => requiredFiles[doc] !== null);
  }, [hasRequiredDocs, requiredDocuments, requiredFiles]);

  // Count uploaded required docs
  const uploadedCount = useMemo(() => {
    if (!hasRequiredDocs) return 0;
    return requiredDocuments.filter((doc) => requiredFiles[doc] !== null).length;
  }, [hasRequiredDocs, requiredDocuments, requiredFiles]);

  const handleRequiredFileChange = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const validation = validateFile(f);
    if (!validation.valid) {
      toast({ title: "Invalid file", description: validation.error, variant: "destructive" });
      return;
    }
    setRequiredFiles((prev) => ({ ...prev, [docName]: f }));
    setUploadError(null);
    e.target.value = "";
  };

  const handleGeneralFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const validation = validateFile(f);
    if (!validation.valid) {
      toast({ title: "Invalid file", description: validation.error, variant: "destructive" });
      return;
    }
    setGeneralFiles((prev) => [...prev, f]);
    setUploadError(null);
    if (generalFileRef.current) generalFileRef.current.value = "";
  };

  const removeGeneralFile = (index: number) => {
    setGeneralFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please sign in to apply", variant: "destructive" });
      return;
    }

    if (hasRequiredDocs && !allRequiredUploaded) {
      toast({ title: "Missing documents", description: "Please upload all required documents before submitting.", variant: "destructive" });
      return;
    }

    const allFiles: { file: File; label: string }[] = [];

    if (hasRequiredDocs) {
      for (const docName of requiredDocuments) {
        const file = requiredFiles[docName];
        if (file) allFiles.push({ file, label: docName });
      }
    }

    for (const file of generalFiles) {
      allFiles.push({ file, label: file.name });
    }

    setSubmitting(true);
    setUploading(allFiles.length > 0);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const { data: app, error: insertError } = await supabase
        .from("applications")
        .insert({
          opportunity_id: opportunityId,
          seeker_id: user.id,
          cover_letter: coverLetter || null,
        } as any)
        .select("id")
        .single();

      if (insertError) throw insertError;

      if (allFiles.length > 0) {
        let completed = 0;
        for (const { file, label } of allFiles) {
          const filePath = `${user.id}/${Date.now()}-${file.name}`;
          const result = await uploadFileWithRetry("resumes", filePath, file);

          if (!result.success) {
            setUploadError(result.error || "Upload failed.");
            toast({ title: "Upload failed", description: `Failed to upload "${label}".`, variant: "destructive" });
            logError(new Error(result.error), { component: "ApplicationForm", action: "file_upload", fileName: file.name, opportunityId });
            setSubmitting(false);
            setUploading(false);
            return;
          }

          const fileType = file.name.split(".").pop()?.toLowerCase() || "pdf";
          await supabase.from("application_documents").insert({
            application_id: (app as any).id,
            file_url: filePath,
            file_type: fileType,
          } as any);

          completed++;
          setUploadProgress(Math.round((completed / allFiles.length) * 100));
        }
      }

      setUploading(false);
      setSubmitted(true);
      toast({ title: "Application submitted!", description: `Your application for "${opportunityTitle}" has been received.` });
    } catch (err: any) {
      if (err.code === "23505") {
        toast({ title: "Already applied", description: "You have already applied to this opportunity.", variant: "destructive" });
      } else {
        const msg = err.message || "Something went wrong.";
        setUploadError(msg);
        toast({ title: "Error submitting application", description: msg, variant: "destructive" });
        logError(err, { component: "ApplicationForm", action: "submit", opportunityId });
      }
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <Card className="glow-border">
        <CardContent className="py-8 text-center space-y-3">
          <h3 className="text-lg font-bold text-foreground">Sign in to Apply</h3>
          <p className="text-sm text-muted-foreground">You need an account to apply for opportunities.</p>
          <Button onClick={() => window.location.href = "/auth"} className="btn-gradient">Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="glow-border">
        <CardContent className="py-8 text-center space-y-3">
          <CheckCircle size={40} className="mx-auto text-emerald-500" />
          <h3 className="text-lg font-bold text-foreground">Application Submitted!</h3>
          <p className="text-sm text-muted-foreground">We've received your application. You'll be notified of any updates.</p>
        </CardContent>
      </Card>
    );
  }

  // Step-based flow for required documents
  if (hasRequiredDocs && !showForm) {
    return (
      <Card className="glow-border">
        <CardContent className="py-6 text-center space-y-4">
          <FileText size={36} className="mx-auto text-primary" />
          <h3 className="text-lg font-bold text-foreground">Apply for this Opportunity</h3>
          <p className="text-sm text-muted-foreground">
            This opportunity requires {requiredDocuments.length} document{requiredDocuments.length > 1 ? "s" : ""} to be uploaded.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {requiredDocuments.map((doc) => (
              <span key={doc} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <FileText size={12} /> {doc}
              </span>
            ))}
          </div>
          <Button onClick={() => setShowForm(true)} className="btn-gradient rounded-lg font-semibold text-base py-5 px-8">
            Apply for this Opportunity
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glow-border">
      <CardHeader>
        <CardTitle className="text-lg">
          {hasRequiredDocs ? "Upload Required Documents & Submit" : "Apply for this Opportunity"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Required document upload fields */}
        {hasRequiredDocs && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Required Documents</Label>
              <span className="text-xs text-muted-foreground">
                {uploadedCount}/{requiredDocuments.length} uploaded
              </span>
            </div>
            <Progress value={(uploadedCount / requiredDocuments.length) * 100} className="h-2" />

            {requiredDocuments.map((docName) => {
              const file = requiredFiles[docName];
              return (
                <div key={docName} className="space-y-1.5">
                  <Label className="text-sm flex items-center gap-1">
                    {file ? (
                      <CheckCircle size={14} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={14} className="text-destructive" />
                    )}
                    {docName}
                  </Label>
                  {file ? (
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                      <FileText size={18} className="text-emerald-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setRequiredFiles((prev) => ({ ...prev, [docName]: null }))} disabled={submitting}>
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-border p-4 transition-colors hover:border-primary/50 hover:bg-accent/50 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <Upload size={20} className="text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Click to upload {docName}</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX — max 5MB</p>
                      </div>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleRequiredFileChange(docName, e)} className="hidden" disabled={submitting} />
                    </label>
                  )}
                </div>
              );
            })}

            {!allRequiredUploaded && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <p className="text-sm text-amber-700">Please upload all required documents to submit your application.</p>
              </div>
            )}
          </div>
        )}

        {/* Cover letter - always optional */}
        <div className="space-y-1.5">
          <Label>Cover Letter <span className="text-muted-foreground text-xs">(Optional)</span></Label>
          <Textarea
            rows={5}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell us why you're a great fit..."
          />
        </div>

        {/* General file upload (when no required docs) */}
        {!hasRequiredDocs && (
          <div className="space-y-1.5">
            <Label>Documents <span className="text-muted-foreground text-xs">(Optional — PDF, DOC, DOCX — max 5MB each)</span></Label>
            <input ref={generalFileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleGeneralFileChange} className="hidden" />

            {generalFiles.length > 0 && (
              <div className="space-y-2">
                {generalFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <FileText size={18} className="text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeGeneralFile(i)} disabled={submitting}>
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div
              onClick={() => !submitting && generalFileRef.current?.click()}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-border p-4 transition-colors hover:border-primary/50 hover:bg-accent/50 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Upload size={20} className="text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">Click to upload documents</p>
            </div>
          </div>
        )}

        {uploading && <Progress value={uploadProgress} className="h-2" />}

        {uploadError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-destructive flex-1">{uploadError}</p>
            <Button variant="outline" size="sm" onClick={handleSubmit} className="shrink-0">
              <RefreshCw size={14} className="mr-1" /> Retry
            </Button>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={submitting || (hasRequiredDocs && !allRequiredUploaded)}
          className="btn-gradient w-full rounded-lg font-semibold text-base py-5"
        >
          {submitting ? (
            <><Loader2 size={16} className="mr-2 animate-spin" /> Submitting...</>
          ) : hasRequiredDocs && !allRequiredUploaded ? (
            `Upload all documents to submit (${uploadedCount}/${requiredDocuments.length})`
          ) : (
            "Submit Application"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
