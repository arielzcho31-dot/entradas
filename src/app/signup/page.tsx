import SignUpForm from "@/components/auth/signup-form";

export default function SignUpPage() {
    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
             <div className="w-full max-w-2xl bg-card text-card-foreground p-4 sm:p-6" style={{border: '1rem solid white', borderImage: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M2,2H78V78H2V2Z\' fill=\'white\'/%3E%3Cpath d=\'M0,0H80V4H0V0Z\' fill=\'%2328364C\'/%3E%3Cpath d=\'M0,8H80V12H0V8Z\' fill=\'%2328364C\'/%3E%3Cpath d=\'M0,16H80V20H0V16Z\' fill=\'%2328364C\'/%3E%3Cpath d=\'M0,24H80V28H0V24Z\' fill=\'%2328364C\'/%3E%3Cpath d=\'M0,32H80V36H0V32Z\' fill=\'%2328364C\'/%3E%3Cpath d=\'M0,40H80V44H0V40Z\' fill=\'%2328364C\'/%3E%3Cpath d=\'M0,48H80V52H0V48Z\' fill=\'%2328364C\'/%3E%3Cpath d=\'M0,56H80V60H0V56Z\' fill=\'%2328364C\'/%3E%3Cpath d=\'M0,64H80V68H0V64Z\' fill=\'%2328364C\'/%3E%3Cpath d=\'M0,72H80V76H0V72Z\' fill=\'%2328364C\'/%3E%3C/svg%3E") 20 / 1rem / 0.5rem'}}>
                <SignUpForm />
            </div>
        </div>
    )
}
