// src/app/(admin)/auth/signin/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Github } from "lucide-react";

export default function SignInPage() {
    //const [email, setEmail] = useState("");
    // const [isLoading, setIsLoading] = useState(false);
    const [isLoading] = useState(false);

    // const handleEmailSignIn = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setIsLoading(true);
    //     await signIn("email", { email, callbackUrl: "/dashboard" });
    //     setIsLoading(false);
    // };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <div className="w-full max-w-sm rounded-lg border p-6 shadow-sm">
                <h1 className="mb-2 text-center text-2xl font-bold">Admin Sign In</h1>
                <p className="mb-6 text-center text-muted-foreground">
                    Sign in to manage your portfolio content.
                </p>

{/*                 <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Sending link..." : "Sign in with Email"}
                    </Button>
                </form> */}

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
{/*                             Or continue with */}
                        </span>
                    </div>
                </div>

                <Button
                    onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                    className="w-full"
                    variant="outline"
                    disabled={isLoading}
                >
                    <Github className="mr-2 h-4 w-4" />
                    Sign in with GitHub
                </Button>
            </div>
        </div>
    );
}
