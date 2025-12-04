"use client"
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SignIn from '@/components/signin/app-blurred-test';
import { Progress } from '@nextui-org/react';
import { logo } from '@/components/primitives';

export default function SignUpApp() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && status === 'authenticated') {
      router.push('/match-making');
    }
  }, [isMounted, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen" style={{
        backgroundImage: `url('/blur-glow-pry-gh.svg')`,
        backgroundSize: "cover",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}>
        <span style={{ fontSize: "24px"}} className={`${logo({color: "battleOrange"})}`}>
          <span className="shadow-lg">Loading...</span>
        </span>
        <Progress color="warning" isIndeterminate aria-label="Your request is being processed..." className="max-w-md" size="lg" />
        <span>Your request is being processed...</span>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="flex flex-col justify-center items-center w-full h-screen" style={{
        backgroundImage: `url('/blur-glow-pry-gh.svg')`,
        backgroundSize: "cover",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}>
        <span>Authenticated successfully. Redirecting...</span>
        <Progress color="success" isIndeterminate aria-label="Authenticated successfully. Redirecting..." className="max-w-md" size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen" style={{
      backgroundImage: `url('/blur-glow-pry-gh.svg')`,
      backgroundSize: "cover",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    }}>
      <SignIn />
    </div>
  );
}
