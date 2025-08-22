// src/app/(admin)/auth/denied/page.tsx
export default function DeniedPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
            <p className="mt-4 text-muted-foreground">
                You do not have permission to view this page.
            </p>
        </div>
    );
}