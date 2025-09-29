import SignUpForm from "@/components/auth/signup-form";

export default function SignUpPage() {
    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
             <div className="w-full max-w-sm rounded-xl bg-card/80 text-card-foreground shadow-2xl backdrop-blur-sm p-6 sm:p-8">
                <SignUpForm />
            </div>
        </div>
    )
}
