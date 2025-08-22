// src/app/(admin)/dashboard/resume/page.tsx
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResumeActions } from "@/components/admin/resume-actions"; // <-- IMPORT
import { UploadResumeButton } from "@/components/admin/resume-form"; // <-- IMPORT

export default async function AdminResumePage() {
    const resumes = await db.resume.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Manage Resumes</h1>
                <UploadResumeButton /> {/* <-- USE COMPONENT */}
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Versions</CardTitle>
                    <CardDescription>
                        Set one resume as the default to be shown on your public page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {resumes.length > 0 ? (
                        resumes.map(resume => (
                            <div key={resume.id} className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-4">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">{resume.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                     {resume.isDefault && (
                                        <Badge variant="default" className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Default
                                        </Badge>
                                    )}
                                </div>
                                <ResumeActions resume={resume} /> {/* <-- USE COMPONENT */}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No resumes uploaded yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}