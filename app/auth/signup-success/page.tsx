import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Account Created!
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Check your email to confirm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-300">
                We&apos;ve sent a confirmation email to your inbox. Please click the link in the email to verify your account and start trading on VirtuixRW.
              </p>
              <p className="text-sm text-zinc-400">
                Didn&apos;t receive an email? Check your spam folder or{' '}
                <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300 underline">
                  try again
                </Link>
                .
              </p>
              <div className="pt-4">
                <Link href="/auth/signin" className="block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Go to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
